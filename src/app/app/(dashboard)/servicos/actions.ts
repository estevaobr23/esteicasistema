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
    price_type: priceType,
    featured,
  };

  let serviceId = id;

  if (id) {
    await supabase.from("services").update(payload).eq("id", id);
  } else {
    const { data } = await supabase.from("services").insert(payload).select("id").single();
    serviceId = data?.id ?? null;
  }

  if (serviceId) {
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
        .eq("id", serviceId);
    }
  }

  revalidatePath("/app/servicos");
  redirect("/app/servicos");
}

export async function toggleServicoAtivo(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("services").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/servicos");
}

export async function excluirServico(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("services").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/servicos");
}

export async function duplicarServico(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { data: original } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();
  if (!original) return;

  await supabase.from("services").insert({
    business_id: original.business_id,
    name: `${original.name} (cópia)`,
    slug: original.slug,
    category: original.category,
    short_description: original.short_description,
    description: original.description,
    image_url: original.image_url,
    gallery: original.gallery,
    video_url: original.video_url,
    duration_minutes: original.duration_minutes,
    price_type: original.price_type,
    base_price: original.base_price,
    featured: original.featured,
    active: original.active,
    sort_order: original.sort_order,
    cta_label: original.cta_label,
  });

  revalidatePath("/app/servicos");
}
