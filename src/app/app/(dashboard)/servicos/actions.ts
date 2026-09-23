"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";

const VEHICLE_TYPES = ["hatch", "sedan", "suv", "pickup"] as const;

export async function upsertServico(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const shortDescription = String(formData.get("short_description") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = formData.get("image_url") ? String(formData.get("image_url")) : null;
  const beforeImage = formData.get("before_image") ? String(formData.get("before_image")) : null;
  const afterImage = formData.get("after_image") ? String(formData.get("after_image")) : null;
  const videoUrl = formData.get("video_url") ? String(formData.get("video_url")).trim() : null;
  const mediaMode = String(formData.get("media_mode") ?? "single_photo");
  const category = String(formData.get("category") ?? "").trim();
  const durationMinutes = formData.get("duration_minutes") ? Number(formData.get("duration_minutes")) : null;
  const ctaLabel = String(formData.get("cta_label") ?? "").trim();
  const features = String(formData.get("features") ?? "").split("\n").map((value) => value.trim()).filter(Boolean).slice(0, 12);
  let gallery: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("gallery") ?? "[]"));
    gallery = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(0, 12) : [];
  } catch {}
  const priceType = String(formData.get("price_type") ?? "quote");
  const featured = formData.get("featured") === "on";

  if (!name) redirect("/app/servicos?erro=" + encodeURIComponent("Informe o nome do serviço."));

  // Enforcement: só ao CRIAR novo serviço, não ao editar existente.
  if (!id) {
    const limite = limitesDoPlano(business.plano as "essencial" | "profissional").maxServicosAtivos;
    if (limite !== null) {
      const { count } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("active", true);

      if ((count ?? 0) >= limite) {
        redirect(
          "/app/servicos?erro=" +
            encodeURIComponent(
              `Seu plano Essencial permite até ${limite} serviços ativos. Desative algum serviço ou faça upgrade para o plano Profissional.`
            )
        );
      }
    }
  }

  const payload = {
    business_id: business.id,
    name,
    short_description: shortDescription || null,
    description: description || null,
    image_url: imageUrl,
    before_image: beforeImage,
    after_image: afterImage,
    gallery,
    video_url: videoUrl,
    media_mode: mediaMode,
    category: category || null,
    duration_minutes: durationMinutes,
    cta_label: ctaLabel || null,
    price_type: priceType,
    featured,
  };

  let serviceId: string | null = null;

  if (id) {
    const { data } = await supabase
      .from("services")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business.id)
      .select("id")
      .single();
    serviceId = data?.id ?? null;
  } else {
    const { data } = await supabase.from("services").insert(payload).select("id").single();
    serviceId = data?.id ?? null;
  }

  if (serviceId) {
    await supabase.from("service_features").delete().eq("service_id", serviceId);
    if (features.length) {
      await supabase.from("service_features").insert(features.map((label, sortOrder) => ({ service_id: serviceId!, label, sort_order: sortOrder })));
    }
    if (priceType === "vehicle") {
      const rows = VEHICLE_TYPES.map((vt) => {
        const raw = formData.get(`price__${vt}`);
        return raw ? { service_id: serviceId!, vehicle_type: vt as string, price: Number(raw) } : null;
      }).filter((r) => r !== null);

      await supabase.from("service_prices").delete().eq("service_id", serviceId);
      if (rows.length > 0) await supabase.from("service_prices").insert(rows);
    } else {
      const base = formData.get("base_price");
      await supabase
        .from("services")
        .update({ base_price: base ? Number(base) : null })
        .eq("id", serviceId)
        .eq("business_id", business.id);
    }
  }

  revalidatePath("/app/servicos");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
  redirect("/app/servicos");
}

export async function toggleServicoAtivo(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("services").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/servicos");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function excluirServico(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("services").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/servicos");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function duplicarServico(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const limite = limitesDoPlano(business.plano as "essencial" | "profissional").maxServicosAtivos;
  if (limite !== null) {
    const { count } = await supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("active", true);
    if ((count ?? 0) >= limite) redirect("/app/servicos?erro=" + encodeURIComponent(`Seu plano permite até ${limite} serviços ativos.`));
  }

  const { data: original } = await supabase
    .from("services")
    .select("*, service_prices(*), service_features(*)")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  if (!original) return;

  const { data: copy } = await supabase.from("services").insert({
    business_id: original.business_id,
    name: `${original.name} (cópia)`,
    slug: original.slug,
    category: original.category,
    short_description: original.short_description,
    description: original.description,
    image_url: original.image_url,
    gallery: original.gallery,
    video_url: original.video_url,
    media_mode: original.media_mode,
    before_image: original.before_image,
    after_image: original.after_image,
    duration_minutes: original.duration_minutes,
    price_type: original.price_type,
    base_price: original.base_price,
    featured: original.featured,
    active: original.active,
    sort_order: original.sort_order,
    cta_label: original.cta_label,
  }).select("id").single();

  if (copy?.id && original.service_prices?.length) {
    await supabase.from("service_prices").insert(original.service_prices.map((price) => ({
      service_id: copy.id,
      vehicle_type: price.vehicle_type,
      price: price.price,
      promotional_price: price.promotional_price,
      active: price.active,
    })));
  }
  if (copy?.id && original.service_features?.length) {
    await supabase.from("service_features").insert(original.service_features.map((feature) => ({
      service_id: copy.id,
      label: feature.label,
      sort_order: feature.sort_order,
    })));
  }

  revalidatePath("/app/servicos");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}
