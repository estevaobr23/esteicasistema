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
  const serviceId = String(formData.get("service_id") ?? "").trim();
  const packageId = String(formData.get("package_id") ?? "").trim();
  const portfolioItemId = String(formData.get("portfolio_item_id") ?? "").trim();
  const source = String(formData.get("source") ?? "manual");
  const reviewDate = String(formData.get("review_date") ?? "").trim();

  if (!customerName) return;

  const [{ data: relatedService }, { data: relatedPackage }, { data: relatedPortfolio }] = await Promise.all([
    serviceId ? supabase.from("services").select("id").eq("id", serviceId).eq("business_id", business.id).maybeSingle() : Promise.resolve({ data: null }),
    packageId ? supabase.from("packages").select("id").eq("id", packageId).eq("business_id", business.id).maybeSingle() : Promise.resolve({ data: null }),
    portfolioItemId ? supabase.from("portfolio_items").select("id").eq("id", portfolioItemId).eq("business_id", business.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  await supabase.from("reviews").insert({
    business_id: business.id,
    customer_name: customerName,
    rating,
    text: text || null,
    service_id: relatedService?.id ?? null,
    package_id: relatedPackage?.id ?? null,
    portfolio_item_id: relatedPortfolio?.id ?? null,
    source,
    review_date: reviewDate || null,
  });

  revalidatePath("/app/avaliacoes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function removerAvaliacao(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("reviews").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/avaliacoes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function toggleAvaliacaoAtiva(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("reviews").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/avaliacoes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}
