"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessRaw } from "@/lib/domain/business-raw";
import { limitesDoPlano } from "@/lib/domain/plans";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";
import { createTemplateLayout } from "@/lib/catalog-builder/template-layouts";
import { createExampleCatalogLayout, isExampleCatalogLayout } from "@/lib/domain/seed-example-catalog";
import type { Json } from "@/lib/supabase/types";

export async function saveVisual(formData: FormData) {
  const business = await getCurrentBusinessRaw();
  const supabase = await createClient();

  const catalogTemplate = getCatalogTemplate(String(formData.get("catalog_template_id") ?? "classico_dark"));
  const theme = catalogTemplate.isDark ? "premium_dark" : "clean_detail";
  const primary_color = String(formData.get("primary_color") ?? catalogTemplate.palette.primaryColorDefault);
  const secondary_color = String(formData.get("secondary_color") ?? catalogTemplate.palette.secondaryColorDefault);
  const logo_url = formData.get("logo_url") ? String(formData.get("logo_url")) : undefined;
  const cover_url = formData.get("cover_url") ? String(formData.get("cover_url")) : undefined;
  const catalogLayout = isExampleCatalogLayout(business.catalog_layout)
    ? createExampleCatalogLayout(catalogTemplate.id)
    : createTemplateLayout(catalogTemplate.id);

  await supabase
    .from("businesses")
    .update({
      template_id: catalogTemplate.id,
      theme,
      primary_color,
      secondary_color,
      logo_url,
      cover_url,
      catalog_layout: catalogLayout as unknown as Json,
      catalog_layout_version: 1,
      catalog_updated_at: new Date().toISOString(),
    })
    .eq("id", business.id);

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?etapa=contato");
}

export async function saveContato(formData: FormData) {
  const business = await getCurrentBusinessRaw();
  const supabase = await createClient();

  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");

  if (!whatsapp) {
    redirect(`/app/onboarding?etapa=contato&erro=${encodeURIComponent("Informe o WhatsApp para continuar.")}`);
  }

  const city = String(formData.get("city") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const instagram = String(formData.get("instagram") ?? "").trim() || null;

  const dias = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const business_hours = Object.fromEntries(
    dias.map((dia) => [dia, String(formData.get(`horario__${dia}`) ?? "").trim() || "fechado"])
  );

  await supabase
    .from("businesses")
    .update({
      whatsapp,
      phone: whatsapp,
      city,
      email,
      address,
      instagram,
      business_hours,
    })
    .eq("id", business.id);

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?etapa=servicos");
}

export async function saveServicos(formData: FormData) {
  const business = await getCurrentBusinessRaw();
  const supabase = await createClient();

  const templateIds = formData.getAll("template_id").map(String);
  const limite = limitesDoPlano(business.plano as "essencial" | "profissional").maxServicosAtivos;

  if (limite !== null && templateIds.length > limite) {
    redirect(
      `/app/onboarding?etapa=servicos&erro=${encodeURIComponent(
        `Seu plano Essencial permite até ${limite} serviços. Selecione no máximo ${limite}.`
      )}`
    );
  }

  if (templateIds.length === 0) {
    redirect(
      `/app/onboarding?etapa=servicos&erro=${encodeURIComponent("Selecione ao menos um serviço para continuar.")}`
    );
  }

  const { data: templates } = await supabase
    .from("service_templates")
    .select("*")
    .in("id", templateIds);

  if (!templates || templates.length === 0) {
    redirect(`/app/onboarding?etapa=servicos&erro=${encodeURIComponent("Não foi possível carregar os serviços selecionados.")}`);
  }

  const { data: existingServices } = await supabase
    .from("services")
    .select("id,name")
    .eq("business_id", business.id);
  const templateNames = new Set((templates ?? []).map((template) => template.name));
  const allTemplateResult = await supabase.from("service_templates").select("name");
  const allTemplateNames = new Set((allTemplateResult.data ?? []).map((template) => template.name));

  for (const service of existingServices ?? []) {
    if (allTemplateNames.has(service.name) && !templateNames.has(service.name)) {
      await supabase.from("services").update({ active: false }).eq("id", service.id);
    }
  }

  for (const [index, template] of templates!.entries()) {
    const existing = (existingServices ?? []).find((service) => service.name === template.name);
    if (existing) {
      await supabase.from("services").update({ active: true, sort_order: index + 1 }).eq("id", existing.id);
      continue;
    }
    const { data: service, error } = await supabase
      .from("services")
      .insert({
        business_id: business.id,
        name: template.name,
        category: template.category,
        short_description: template.short_description,
        description: template.description,
        price_type: "quote",
        active: true,
        sort_order: index + 1,
      })
      .select("id")
      .single();

    if (error || !service) continue;

    if (template.default_features.length > 0) {
      await supabase.from("service_features").insert(
        template.default_features.map((label: string, i: number) => ({
          service_id: service.id,
          label,
          sort_order: i,
        }))
      );
    }
  }

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?etapa=precos");
}

export async function savePrecos(formData: FormData) {
  const business = await getCurrentBusinessRaw();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("id,service_prices(vehicle_type,promotional_price)")
    .eq("business_id", business.id)
    .eq("active", true);

  if (!services) redirect("/app/onboarding?etapa=precos");

  const VEHICLE_TYPES = ["hatch", "sedan", "suv", "pickup"] as const;

  for (const service of services!) {
    const priceType = String(formData.get(`price_type__${service.id}`) ?? "quote");

    if (priceType === "vehicle") {
      const rows = VEHICLE_TYPES.map((vt) => {
        const raw = formData.get(`price__${service.id}__${vt}`);
        const currentPromotionalPrice = service.service_prices.find((price) => price.vehicle_type === vt)?.promotional_price ?? null;
        return raw ? { service_id: service.id, vehicle_type: vt as string, price: Number(raw), promotional_price: currentPromotionalPrice } : null;
      }).filter((r) => r !== null);

      if (rows.length > 0) {
        await supabase.from("service_prices").delete().eq("service_id", service.id);
        await supabase.from("service_prices").insert(rows);
      }
      await supabase.from("services").update({ price_type: "vehicle" }).eq("id", service.id);
    } else if (priceType === "from") {
      const base = formData.get(`base_price__${service.id}`);
      await supabase
        .from("services")
        .update({ price_type: "from", base_price: base ? Number(base) : null })
        .eq("id", service.id);
    } else if (priceType === "fixed") {
      const base = formData.get(`base_price__${service.id}`);
      await supabase
        .from("services")
        .update({ price_type: "fixed", base_price: base ? Number(base) : null })
        .eq("id", service.id);
    } else {
      await supabase.from("services").update({ price_type: "quote" }).eq("id", service.id);
    }
  }

  revalidatePath("/app/onboarding");
  redirect("/app/onboarding?etapa=publicar");
}

export async function publishBusiness() {
  const business = await getCurrentBusinessRaw();
  const supabase = await createClient();

  await supabase
    .from("businesses")
    .update({ published: true, onboarding_completo: true })
    .eq("id", business.id);

  revalidatePath("/app/dashboard");
  redirect("/app/dashboard?publicado=1");
}
