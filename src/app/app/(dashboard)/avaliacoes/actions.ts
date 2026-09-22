"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";

async function assertAvaliacoesPermitido() {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");
  if (!limites.permiteAvaliacoes) {
    redirect(
      "/app/avaliacoes?erro=" +
        encodeURIComponent("Avaliações estão disponíveis no plano Profissional. Faça upgrade para liberar.")
    );
  }
  return business;
}

export async function adicionarAvaliacao(formData: FormData) {
  const business = await assertAvaliacoesPermitido();
  const supabase = await createClient();

  const customerName = String(formData.get("customer_name") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 5);
  const text = String(formData.get("text") ?? "").trim();

  if (!customerName) return;

  await supabase.from("reviews").insert({
    business_id: business.id,
    customer_name: customerName,
    rating,
    text: text || null,
  });

  revalidatePath("/app/avaliacoes");
}

export async function removerAvaliacao(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("reviews").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/avaliacoes");
}

export async function toggleAvaliacaoAtiva(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("reviews").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/avaliacoes");
}
