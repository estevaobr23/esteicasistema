"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusinessRaw } from "@/lib/domain/business-raw";
import { limitesDoPlano } from "@/lib/domain/plans";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";

export async function saveVisual(formData: FormData) {
  const business = await getCurrentBusinessRaw();
  const supabase = await createClient();

  const catalogTemplate = getCatalogTemplate(String(formData.get("catalog_template_id") ?? "classico_dark"));
  const theme = catalogTemplate.isDark ? "premium_dark" : "clean_detail";
  const primary_color = String(formData.get("primary_color") ?? catalogTemplate.palette.primaryColorDefault);
  const secondary_color = String(formData.get("secondary_color") ?? catalogTemplate.palette.secondaryColorDefault);
  const logo_url = formData.get("logo_url") ? String(formData.get("logo_url")) : undefined;
  const cover_url = formData.get("cover_url") ? String(formData.get("cover_url")) : undefined;

  await supabase
    .from("businesses")
    .update({
      template_id: catalogTemplate.id,
      theme,
      primary_color,
      secondary_color,
      logo_url,
      cover_url,
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

  // Remove serviços anteriores gerados pelo onboarding para essa conta antes
  // de reinserir — evita duplicar se o usuário voltar e re-selecionar.
  await supabase.from("services").delete().eq("business_id", business.id);

  for (const [index, template] of templates!.entries()) {
    const { data: service, error } = await supabase
      .from("services")
      .insert({
        business_id: business.id,
        name: template.name,
        category: template.category,
        short_description: template.short_description,
        description: template.description,
        price_type: "quote",
        sort_order: index,
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
    .select("id")
    .eq("business_id", business.id);

  if (!services) redirect("/app/onboarding?etapa=precos");

  const VEHICLE_TYPES = ["hatch", "sedan", "suv", "pickup"] as const;

  for (const service of services!) {
    const priceType = String(formData.get(`price_type__${service.id}`) ?? "quote");

    if (priceType === "vehicle") {
      const rows = VEHICLE_TYPES.map((vt) => {
        const raw = formData.get(`price__${service.id}__${vt}`);
        return raw ? { service_id: service.id, vehicle_type: vt as string, price: Number(raw) } : null;
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
