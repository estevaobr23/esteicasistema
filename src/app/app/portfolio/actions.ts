"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";

async function assertPortfolioPermitido() {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");
  if (!limites.permitePortfolio) {
    redirect(
      "/app/portfolio?erro=" +
        encodeURIComponent("Antes/depois está disponível no plano Profissional. Faça upgrade para liberar.")
    );
  }
  return business;
}

export async function criarItemPortfolio(formData: FormData) {
  const business = await assertPortfolioPermitido();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const beforeImage = String(formData.get("before_image") ?? "");
  const afterImage = String(formData.get("after_image") ?? "");
  const vehicle = String(formData.get("vehicle") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!beforeImage || !afterImage) {
    redirect("/app/portfolio?erro=" + encodeURIComponent("Envie as duas fotos: antes e depois."));
  }

  await supabase.from("portfolio_items").insert({
    business_id: business.id,
    title: title || null,
    before_image: beforeImage,
    after_image: afterImage,
    vehicle: vehicle || null,
    category: category || null,
    description: description || null,
  });

  revalidatePath("/app/portfolio");
  redirect("/app/portfolio");
}

export async function excluirItemPortfolio(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("portfolio_items").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/portfolio");
}

export async function toggleItemPortfolioAtivo(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("portfolio_items").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/portfolio");
}
