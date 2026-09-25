import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * cakto-webhook — Vitrine Detail
 *
 * Recebe purchase_approved da Cakto e grava em `purchases` (email, plano,
 * status, transaction_id, valor). O onboarding (app/onboarding/actions.ts)
 * já consulta essa tabela como "o portão": sem uma linha com
 * status="aprovado" casando pelo e-mail, o cliente não consegue criar o
 * negócio. Esta function é o único elo que faltava — o resto do fluxo
 * (cadastro, onboarding, criação de business) já existe e funciona.
 *
 * Diferente do motor customers/entitlements de outras áreas: aqui não há
 * tabela de produtos nem entitlements — é 1 produto só (Vitrine Detail) com
 * 3 ofertas de preço, mapeadas para 2 planos (Plano em src/lib/domain/plans.ts).
 *
 * Autenticação: body.secret comparado em tempo constante contra
 * CAKTO_WEBHOOK_SECRET.
 *
 * Idempotência: purchases.transaction_id é UNIQUE — reenvio do mesmo
 * webhook faz upsert, não duplica.
 *
 * Mapeamento de preço → plano (ofertas reais criadas na Cakto):
 *   R$37   (3dynu44)  → essencial    (Iniciante)
 *   R$59,90 (6q6mtju) → profissional (downsell)
 *   R$67   (coi2uot)  → profissional (principal)
 * Por segurança, qualquer valor >= 50 é tratado como profissional, e
 * qualquer valor menor como essencial — evita depender só do id da oferta,
 * que pode mudar se novas ofertas forem criadas.
 *
 * LOGS: nunca registram e-mail, nome, telefone, documento, IP.
 */

function getSecret(): string | undefined {
  return Deno.env.get("CAKTO_WEBHOOK_SECRET");
}

function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ba.length ^ bb.length;
  const max = Math.max(ba.length, bb.length);
  for (let i = 0; i < max; i++) diff |= (ba[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

function json(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function planoFromValor(valor: number): "essencial" | "profissional" {
  return valor >= 50 ? "profissional" : "essencial";
}

Deno.serve(async (req: Request) => {
  const reqId = crypto.randomUUID();
  const t0 = Date.now();

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed", allowed: "POST" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "POST" },
    });
  }

  const SECRET = getSecret();
  if (!SECRET) {
    console.error(`[${reqId}] CAKTO_WEBHOOK_SECRET não configurado no ambiente`);
    return json(500, { error: "server_misconfigured" });
  }

  let body: any;
  const raw = await req.text();
  try {
    body = JSON.parse(raw);
  } catch (_e) {
    console.log(`[${reqId}] 400 — JSON inválido (bytes=${raw.length})`);
    return json(400, { error: "invalid_json" });
  }

  // Cakto autentica via body.secret, não header.
  const bodySecret = typeof body?.secret === "string" ? body.secret : "";
  if (!bodySecret || !safeEqual(bodySecret, SECRET)) {
    console.log(`[${reqId}] 401 — secret inválido`);
    return json(401, { error: "unauthorized" });
  }

  const event: string | undefined = body?.event;
  console.log(`[${reqId}] evento recebido | event=${event ?? "-"}`);

  if (event !== "purchase_approved") {
    console.log(`[${reqId}] ignorado — event "${event ?? "-"}" não é "purchase_approved"`);
    return json(200, { received: true, processed: false, reason: "event_not_purchase_approved" });
  }

  const data = body?.data ?? {};
  const status: string | undefined = data?.status;

  if (status !== "paid") {
    console.log(`[${reqId}] ignorado — status "${status ?? "-"}" não é "paid"`);
    return json(200, { received: true, processed: false, reason: "status_not_paid" });
  }

  const transactionId: string | undefined = data?.id;
  if (!transactionId) {
    console.error(`[${reqId}] ignorado — data.id ausente`);
    return json(200, { received: true, processed: false, reason: "missing_transaction_id" });
  }

  const rawEmail = data?.customer?.email;
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email) {
    console.error(`[${reqId}] não processado — customer.email ausente | transaction_id=${transactionId}`);
    return json(200, { received: true, processed: false, reason: "missing_email" });
  }

  const offerPrice = typeof data?.offer?.price === "number" ? data.offer.price : null;
  const amount = typeof data?.amount === "number" ? data.amount : offerPrice ?? 0;
  const plano = planoFromValor(offerPrice ?? amount ?? 0);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    console.error(`[${reqId}] ambiente sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY`);
    return json(500, { error: "server_misconfigured" });
  }
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  try {
    const { data: purchase, error } = await db
      .from("purchases")
      .upsert(
        {
          email,
          plano,
          status: "aprovado",
          transaction_id: transactionId,
          valor: amount,
        },
        { onConflict: "transaction_id" }
      )
      .select("id")
      .single();

    if (error || !purchase) {
      console.error(`[${reqId}] falha no upsert de purchase: ${error?.code ?? "?"} ${error?.message ?? ""}`);
      return json(500, { error: "purchase_upsert_failed" });
    }

    console.log(
      `[${reqId}] concluído | purchase_id=${purchase.id} | plano=${plano} | transaction_id=${transactionId} | ${Date.now() - t0}ms`
    );

    return json(200, {
      received: true,
      processed: true,
      request_id: reqId,
      purchase_id: purchase.id,
      plano,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[${reqId}] erro inesperado: ${msg}`);
    return json(500, { error: "internal_error" });
  }
});
