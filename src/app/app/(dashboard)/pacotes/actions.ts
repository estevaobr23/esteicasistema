"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";

async function assertPacotesPermitido() {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");
  if (!limites.permitePacotes) {
    redirect(
      "/app/pacotes?erro=" +
        encodeURIComponent("Pacotes estão disponíveis no plano Profissional. Faça upgrade para liberar.")
    );
  }
  return business;
}

export async function upsertPacote(formData: FormData) {
  const business = await assertPacotesPermitido();
  const supabase = await createClient();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = formData.get("image_url") ? String(formData.get("image_url")) : null;
  const videoUrl = formData.get("video_url") ? String(formData.get("video_url")).trim() : null;
  const videoPosterUrl = formData.get("video_poster_url") ? String(formData.get("video_poster_url")) : null;
  const mediaMode = String(formData.get("media_mode") ?? "single_photo");
  const durationMinutes = formData.get("duration_minutes") ? Number(formData.get("duration_minutes")) : null;
  const featured = formData.get("featured") === "on";
  const ctaLabel = String(formData.get("cta_label") ?? "").trim();
  let gallery: string[] = [];
  let benefits: { label: string; icon_key: string; color_key: string }[] = [];
  try { const value = JSON.parse(String(formData.get("gallery") ?? "[]")); if (Array.isArray(value)) gallery = value.filter((item): item is string => typeof item === "string").slice(0, 12); } catch {}
  try {
    const value = JSON.parse(String(formData.get("benefits") ?? "[]"));
    if (Array.isArray(value)) benefits = value
      .filter((item) => item && typeof item.label === "string" && item.label.trim())
      .slice(0, 3)
      .map((item) => ({ label: item.label.trim(), icon_key: "check", color_key: "emerald" }));
  } catch {}
  const price = Number(formData.get("price") ?? 0);
  const promotionalPrice = formData.get("promotional_price") ? Number(formData.get("promotional_price")) : null;
  const serviceIds = formData.getAll("service_id").map(String);

  if (!name || !price) {
    redirect("/app/pacotes?erro=" + encodeURIComponent("Informe nome e preço do pacote."));
  }

  const payload = {
    business_id: business.id,
    name,
    description: description || null,
    image_url: imageUrl,
    gallery,
    video_url: videoUrl,
    video_poster_url: videoPosterUrl,
    media_mode: mediaMode,
    duration_minutes: durationMinutes,
    featured,
    cta_label: ctaLabel || null,
    price,
    promotional_price: promotionalPrice,
  };

  let packageId: string | null = null;
  if (id) {
    const { data } = await supabase
      .from("packages")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business.id)
      .select("id")
      .single();
    packageId = data?.id ?? null;
    if (packageId) {
      await supabase.from("package_services").delete().eq("package_id", packageId);
    }
  } else {
    const { data } = await supabase.from("packages").insert(payload).select("id").single();
    packageId = data?.id ?? null;
  }

  if (packageId && serviceIds.length > 0) {
    await supabase
      .from("package_services")
      .insert(serviceIds.map((serviceId) => ({ package_id: packageId!, service_id: serviceId })));
  }
  if (packageId) {
    await supabase.from("package_benefits").delete().eq("package_id", packageId);
    if (benefits.length) await supabase.from("package_benefits").insert(benefits.map((benefit, sortOrder) => ({ package_id: packageId!, ...benefit, sort_order: sortOrder })));
  }

  revalidatePath("/app/pacotes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
  redirect("/app/pacotes");
}

export async function duplicarPacote(formData: FormData) {
  const business = await assertPacotesPermitido();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const { data: original } = await supabase.from("packages").select("*, package_services(service_id), package_benefits(*)").eq("id", id).eq("business_id", business.id).single();
  if (!original) return;
  const { data: copy } = await supabase.from("packages").insert({
    business_id: business.id, name: `${original.name} (cópia)`, description: original.description,
    image_url: original.image_url, gallery: original.gallery, video_url: original.video_url,
    video_poster_url: original.video_poster_url, media_mode: original.media_mode,
    duration_minutes: original.duration_minutes, price: original.price, promotional_price: original.promotional_price,
    featured: original.featured, active: original.active, cta_label: original.cta_label, sort_order: original.sort_order,
  }).select("id").single();
  if (!copy?.id) return;
  if (original.package_services?.length) await supabase.from("package_services").insert(original.package_services.map((item) => ({ package_id: copy.id, service_id: item.service_id })));
  if (original.package_benefits?.length) await supabase.from("package_benefits").insert(original.package_benefits.map((item) => ({ package_id: copy.id, label: item.label, icon_key: item.icon_key, color_key: item.color_key, sort_order: item.sort_order })));
  revalidatePath("/app/pacotes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function togglePacoteAtivo(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("packages").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/pacotes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function excluirPacote(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("packages").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/pacotes");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}
