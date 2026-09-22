"use client";

import { useEffect, useState } from "react";
import type { Database } from "@/lib/supabase/types";
import CatalogPresentation from "@/components/catalog/CatalogPresentation";
import { limitesDoPlano } from "@/lib/domain/plans";
import type { EditableTarget } from "@/lib/domain/editable-target";
import type { SectionConfig } from "@/lib/domain/catalog-sections";
import { useSetBottomNavHidden } from "@/components/dashboard/BottomNavVisibilityProvider";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";
import TemplateSelectorScreen from "./TemplateSelectorScreen";
import BottomSheet from "./BottomSheet";
import SaveBar from "./SaveBar";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServiceFeature = Database["public"]["Tables"]["service_features"]["Row"];
type ServicePriceRow = Database["public"]["Tables"]["service_prices"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"] & {
  service_features?: ServiceFeature[];
  service_prices?: ServicePriceRow[];
};
type Package = Database["public"]["Tables"]["packages"]["Row"] & {
  package_services?: { service_id: string }[];
};
type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];
type AvailabilitySlot = Database["public"]["Tables"]["availability_slots"]["Row"];
type Review = Database["public"]["Tables"]["reviews"]["Row"];

export default function CatalogEditor({
  business,
  services,
  packages,
  portfolioItems,
  availabilitySlots,
  reviews,
}: {
  business: Business;
  services: Service[];
  packages: Package[];
  portfolioItems: PortfolioItem[];
  availabilitySlots: AvailabilitySlot[];
  reviews: Review[];
}) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const setBottomNavHidden = useSetBottomNavHidden();
  const [showTemplateScreen, setShowTemplateScreen] = useState(!state.templateCustomized);
  const [activeTarget, setActiveTarget] = useState<EditableTarget | null>(null);
  const plano = business.plano as "essencial" | "profissional";
  const limites = limitesDoPlano(plano);

  useEffect(() => {
    setBottomNavHidden(!showTemplateScreen);
    return () => setBottomNavHidden(false);
  }, [showTemplateScreen, setBottomNavHidden]);

  if (showTemplateScreen) {
    return <TemplateSelectorScreen onContinue={() => setShowTemplateScreen(false)} />;
  }

  const previewBusiness: Business = {
    ...business,
    template_id: state.business.template_id,
    theme: state.business.theme,
    primary_color: state.business.primary_color,
    secondary_color: state.business.secondary_color,
    logo_url: state.business.logo_url || null,
    cover_url: state.business.cover_url || null,
    about: state.business.about || null,
    headline: state.business.headline || null,
    highlights: state.business.highlights,
    branding_video_url: state.business.branding_video_url || null,
  };

  const previewServices: Service[] = services.map((s) => {
    const draft = state.services.find((d) => d.id === s.id);
    if (!draft) return s;
    return {
      ...s,
      media_mode: draft.media_mode,
      image_url: draft.image_url,
      before_image: draft.before_image,
      after_image: draft.after_image,
      gallery: draft.gallery,
      video_url: draft.video_url,
    };
  });

  function moveSection(sectionId: SectionConfig["id"], direction: -1 | 1) {
    const ids = state.sectionsConfig.map((s) => s.id);
    const index = ids.indexOf(sectionId);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    dispatch({ type: "REORDER_SECTIONS", ids: next });
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => setShowTemplateScreen(true)}
          className="rounded-lg border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300"
        >
          Trocar template
        </button>
        <SaveBar />
      </div>

      <CatalogPresentation
        business={previewBusiness}
        services={previewServices}
        packages={packages}
        portfolioItems={portfolioItems}
        availabilitySlots={availabilitySlots}
        reviews={reviews}
        sectionsConfig={state.sectionsConfig}
        editable
        onFieldTap={setActiveTarget}
        onMoveSection={limites.permiteOcultarSecoes ? moveSection : undefined}
      />

      <BottomSheet
        target={activeTarget}
        onClose={() => setActiveTarget(null)}
        plano={plano}
        permiteGaleriaFotos={limites.permiteGaleriaFotos}
        permiteVideos={limites.permiteVideos}
        permiteOcultarSecoes={limites.permiteOcultarSecoes}
      />
    </div>
  );
}
