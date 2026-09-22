"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";
import { normalizeSectionsConfig, type SectionConfig } from "@/lib/domain/catalog-sections";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";
import type { BusinessDraft, MediaMode, ServiceDraft } from "@/components/dashboard/catalog-editor/CatalogEditorContext";

export type SaveCatalogPayload = {
  business: BusinessDraft;
  services: ServiceDraft[];
  sectionsConfig: SectionConfig[];
};

export type SaveCatalogResult = { ok: true; savedAt: number } | { ok: false; error: string };

const GALLERY_MODES: MediaMode[] = ["gallery"];
const VIDEO_MODES: MediaMode[] = ["youtube"];

export async function salvarCatalogoCompleto(payload: SaveCatalogPayload): Promise<SaveCatalogResult> {
  try {
    const business = await getCurrentBusiness();
    const supabase = await createClient();
    const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

    // Sanitização server-side: nunca confia no payload do client para o que o plano bloqueia.
    const sectionsConfig = limites.permiteOcultarSecoes
      ? normalizeSectionsConfig(payload.sectionsConfig)
      : normalizeSectionsConfig([]);

    const services = payload.services.map((s) => {
      let mediaMode = s.media_mode;
      if (GALLERY_MODES.includes(mediaMode) && !limites.permiteGaleriaFotos) mediaMode = "single_photo";
      if (VIDEO_MODES.includes(mediaMode) && !limites.permiteVideos) mediaMode = "single_photo";
      return { ...s, media_mode: mediaMode };
    });

    const brandingVideoUrl = limites.permiteVideos ? payload.business.branding_video_url || null : null;
    const template = getCatalogTemplate(payload.business.template_id);
    const theme = template.isDark ? "premium_dark" : "clean_detail";

    const { error: businessError } = await supabase
      .from("businesses")
      .update({
        template_id: template.id,
        theme,
        primary_color: payload.business.primary_color,
        secondary_color: payload.business.secondary_color,
        logo_url: payload.business.logo_url || null,
        cover_url: payload.business.cover_url || null,
        about: payload.business.about || null,
        headline: payload.business.headline || null,
        highlights: payload.business.highlights,
        branding_video_url: brandingVideoUrl,
        sections_config: sectionsConfig,
      })
      .eq("id", business.id);

    if (businessError) return { ok: false, error: businessError.message };

    for (const s of services) {
      const { error: serviceError } = await supabase
        .from("services")
        .update({
          media_mode: s.media_mode,
          image_url: s.image_url || null,
          before_image: s.before_image || null,
          after_image: s.after_image || null,
          gallery: s.gallery,
          video_url: s.video_url || null,
        })
        .eq("id", s.id)
        .eq("business_id", business.id);

      if (serviceError) return { ok: false, error: serviceError.message };
    }

    revalidatePath(`/${business.slug}`);
    revalidatePath("/app/catalogo");

    return { ok: true, savedAt: Date.now() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao salvar." };
  }
}
