"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";
import { normalizeSectionsConfig, type SectionConfig } from "@/lib/domain/catalog-sections";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";
import type { BusinessDraft, MediaMode, ServiceDraft } from "@/components/dashboard/catalog-editor/CatalogEditorContext";
import { layoutToLegacySections, normalizeCatalogLayout, type CatalogLayout } from "@/lib/catalog-builder/schema";
import type { Json } from "@/lib/supabase/types";
import { getCatalogFontPair } from "@/lib/domain/catalog-fonts";

export type SaveCatalogPayload = {
  business: BusinessDraft;
  services: ServiceDraft[];
  sectionsConfig: SectionConfig[];
  layout: CatalogLayout;
};

export type SaveCatalogResult = { ok: true; savedAt: number } | { ok: false; error: string };

const GALLERY_MODES: MediaMode[] = ["gallery"];
const VIDEO_MODES: MediaMode[] = ["youtube"];
const PROFESSIONAL_BLOCKS = new Set(["antes_depois", "branding_video", "pacotes", "avaliacoes", "video"]);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

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
    const normalizedLayout = normalizeCatalogLayout(payload.layout, sectionsConfig, template.id);
    const catalogLayout: CatalogLayout = limites.permiteOcultarSecoes
      ? normalizedLayout
      : {
          ...normalizedLayout,
          blocks: normalizedLayout.blocks
            .filter((block) => !PROFESSIONAL_BLOCKS.has(block.type))
            .map((block) => ({
              ...block,
              visible: true,
              responsive: { ...block.responsive, hideOnMobile: false, hideOnDesktop: false },
            })),
        };
    const compatibleSectionsConfig = layoutToLegacySections(catalogLayout);
    const fontPair = getCatalogFontPair(payload.business.font_pair_id);
    const animationPreset = (["none", "soft", "dynamic"].includes(payload.business.animation_preset)
      ? payload.business.animation_preset
      : "soft") as "none" | "soft" | "dynamic";
    const backgroundOverride = HEX_COLOR.test(payload.business.bg_color_override)
      ? payload.business.bg_color_override
      : null;

    const { error: businessError } = await supabase
      .from("businesses")
      .update({
        template_id: template.id,
        theme,
        primary_color: payload.business.primary_color,
        secondary_color: payload.business.secondary_color,
        bg_color_override: backgroundOverride,
        font_pair_id: fontPair.id,
        animation_preset: animationPreset,
        logo_url: payload.business.logo_url || null,
        cover_url: payload.business.cover_url || null,
        about: payload.business.about || null,
        headline: payload.business.headline || null,
        highlights: payload.business.highlights,
        branding_video_url: brandingVideoUrl,
        hero_show_city_badge: payload.business.hero_show_city_badge,
        hero_show_price_badge: payload.business.hero_show_price_badge,
        hero_show_whatsapp_badge: payload.business.hero_show_whatsapp_badge,
        button_radius: payload.business.button_radius,
        sections_config: compatibleSectionsConfig,
        catalog_layout: catalogLayout as unknown as Json,
        catalog_layout_version: catalogLayout.schemaVersion,
        catalog_updated_at: new Date().toISOString(),
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
          sales_page_enabled: s.sales_page_enabled,
          sales_headline: s.sales_headline || null,
          sales_subheadline: s.sales_subheadline || null,
          sales_video_url: s.sales_video_url || null,
          sales_gallery: s.sales_gallery,
          sales_bonuses: s.sales_bonuses as unknown as Json,
          sales_cta_message: s.sales_cta_message || null,
          sales_guarantee_text: s.sales_guarantee_text || null,
          sales_faq: s.sales_faq as unknown as Json,
          sales_urgency_text: s.sales_urgency_text || null,
        })
        .eq("id", s.id)
        .eq("business_id", business.id);

      if (serviceError) return { ok: false, error: serviceError.message };
    }

    revalidatePath(`/${business.slug}`);
    revalidatePath("/[slug]/servico/[serviceSlug]", "page");
    revalidatePath("/app/catalogo");

    return { ok: true, savedAt: Date.now() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao salvar." };
  }
}
