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
  const imageUrl = String(formData.get("image_url") ?? "");
  const mediaType = String(formData.get("media_type") ?? "before_after");
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const instagramUrl = String(formData.get("instagram_url") ?? "").trim();
  const serviceId = String(formData.get("service_id") ?? "").trim();
  const vehicleMake = String(formData.get("vehicle_make") ?? "").trim();
  const vehicleModel = String(formData.get("vehicle_model") ?? "").trim();
  const vehicleYear = formData.get("vehicle_year") ? Number(formData.get("vehicle_year")) : null;
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const featured = formData.get("featured") === "on";
  let gallery: string[] = [];
  try { const value = JSON.parse(String(formData.get("gallery") ?? "[]")); if (Array.isArray(value)) gallery = value.filter((item): item is string => typeof item === "string").slice(0, 20); } catch {}

  const validMedia = (mediaType === "before_after" && beforeImage && afterImage) || (mediaType === "single_photo" && imageUrl) || (mediaType === "gallery" && gallery.length) || (mediaType === "youtube" && videoUrl) || (mediaType === "instagram" && /^https:\/\/(www\.)?instagram\.com\/(p|reel)\//i.test(instagramUrl));
  if (!validMedia) redirect("/app/portfolio?erro=" + encodeURIComponent("Complete a mídia escolhida para o projeto."));

  let validServiceId: string | null = null;
  if (serviceId) {
    const { data: relatedService } = await supabase.from("services").select("id").eq("id", serviceId).eq("business_id", business.id).maybeSingle();
    validServiceId = relatedService?.id ?? null;
  }

  await supabase.from("portfolio_items").insert({
    business_id: business.id,
    title: title || null,
    before_image: beforeImage,
    after_image: afterImage,
    image_url: imageUrl || null,
    gallery,
    video_url: videoUrl || null,
    instagram_url: instagramUrl || null,
    media_type: mediaType,
    service_id: validServiceId,
    vehicle_make: vehicleMake || null,
    vehicle_model: vehicleModel || null,
    vehicle_year: vehicleYear,
    vehicle: [vehicleMake, vehicleModel, vehicleYear].filter(Boolean).join(" ") || null,
    category: category || null,
    description: description || null,
    featured,
  });

  revalidatePath("/app/portfolio");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
  redirect("/app/portfolio");
}

export async function excluirItemPortfolio(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("portfolio_items").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/portfolio");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function toggleItemPortfolioAtivo(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("portfolio_items").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/portfolio");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}
