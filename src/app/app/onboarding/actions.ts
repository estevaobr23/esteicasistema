"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarSlugDisponivel } from "@/lib/domain/business";
import type { Plano } from "@/lib/domain/plans";
import { seedExampleCatalogContent } from "@/lib/domain/seed-example-catalog";

/**
 * O portão: único ponto do sistema que decide se alguém entra.
 * Confere a compra aprovada (tabela purchases, deny-all RLS — só service_role
 * enxerga) antes de criar o tenant. Sem compra aprovada, não libera nada.
 */
export async function createBusiness(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  const email = user.email.trim().toLowerCase();
  const nome = String(formData.get("name") ?? "").trim();

  if (!nome) {
    redirect(`/app/onboarding?erro=${encodeURIComponent("Informe o nome da sua estética.")}`);
  }

  const admin = createAdminClient();
  const { data: purchase } = await admin
    .from("purchases")
    .select("plano")
    .eq("email", email)
    .eq("status", "aprovado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!purchase) {
    redirect(
      "/app/onboarding?erro=" +
        encodeURIComponent(
          "Não encontramos uma compra aprovada com este e-mail. Verifique se usou o mesmo e-mail da compra, ou entre em contato com o suporte."
        )
    );
  }

  const plano = purchase.plano as Plano;
  const slug = await gerarSlugDisponivel(nome);

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id, name: nome, slug, plano })
    .select("id,name,plano")
    .single();

  if (error || !business) {
    redirect(`/app/onboarding?erro=${encodeURIComponent("Não foi possível criar seu negócio. Tente novamente.")}`);
  }

  try {
    await seedExampleCatalogContent({
      supabase: admin,
      businessId: business.id,
      businessName: business.name,
      plano: business.plano as Plano,
    });
  } catch (seedError) {
    console.error("Falha ao preparar catálogo de exemplo", seedError);
    await admin.from("businesses").delete().eq("id", business.id);
    redirect(`/app/onboarding?erro=${encodeURIComponent("Não foi possível preparar seu catálogo de exemplo. Tente novamente.")}`);
  }

  await admin
    .from("purchases")
    .update({ usado_em: new Date().toISOString() })
    .eq("email", email)
    .is("usado_em", null);

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?etapa=visual");
}
