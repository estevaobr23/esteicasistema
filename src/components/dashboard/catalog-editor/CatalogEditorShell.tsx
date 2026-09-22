"use client";

import { useState } from "react";
import type { Database } from "@/lib/supabase/types";
import CatalogPresentation from "@/components/catalog/CatalogPresentation";
import { limitesDoPlano } from "@/lib/domain/plans";
import { useCatalogEditorState } from "./CatalogEditorContext";
import TemplatePanel from "./panels/TemplatePanel";
import TextosPanel from "./panels/TextosPanel";
import SecoesPanel from "./panels/SecoesPanel";
import ServicosPanel from "./panels/ServicosPanel";
import BrandingVideoPanel from "./panels/BrandingVideoPanel";
import AvaliacoesPanel from "./panels/AvaliacoesPanel";
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

const TABS = [
  { key: "template", label: "Template" },
  { key: "textos", label: "Textos" },
  { key: "secoes", label: "Seções" },
  { key: "servicos", label: "Serviços" },
  { key: "video", label: "Vídeo" },
  { key: "avaliacoes", label: "Avaliações" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function CatalogEditorShell({
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
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [tab, setTab] = useState<TabKey>("template");
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  const previewBusiness: Business = {
    ...business,
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

  return (
    <div className="flex h-[calc(100vh-4.25rem)] flex-col sm:h-screen">
      <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-white">Catálogo</h1>
        <SaveBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-full flex-col overflow-hidden sm:w-[420px] sm:shrink-0 sm:border-r sm:border-neutral-900">
          <div className="flex overflow-x-auto border-b border-neutral-900 px-4 sm:px-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${
                  tab === t.key ? "border-white text-white" : "border-transparent text-neutral-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {tab === "template" && <TemplatePanel />}
            {tab === "textos" && <TextosPanel />}
            {tab === "secoes" && <SecoesPanel permiteOcultarSecoes={limites.permiteOcultarSecoes} />}
            {tab === "servicos" && (
              <ServicosPanel permiteGaleriaFotos={limites.permiteGaleriaFotos} permiteVideos={limites.permiteVideos} />
            )}
            {tab === "video" && <BrandingVideoPanel permiteVideos={limites.permiteVideos} />}
            {tab === "avaliacoes" && <AvaliacoesPanel plano={business.plano as "essencial" | "profissional"} />}
          </div>
        </div>

        <div className="hidden flex-1 overflow-y-auto bg-neutral-900 sm:block">
          <div className="mx-auto max-w-sm py-6">
            <CatalogPresentation
              business={previewBusiness}
              services={previewServices}
              packages={packages}
              portfolioItems={portfolioItems}
              availabilitySlots={availabilitySlots}
              reviews={reviews}
              sectionsConfig={state.sectionsConfig}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowPreviewMobile(true)}
        className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-950 shadow-lg sm:hidden"
      >
        Ver catálogo
      </button>

      {showPreviewMobile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950 sm:hidden">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-900 bg-neutral-950 px-4 py-3">
            <span className="text-sm font-semibold text-white">Pré-visualização</span>
            <button
              type="button"
              onClick={() => setShowPreviewMobile(false)}
              className="rounded-lg border border-neutral-800 px-3 py-1.5 text-sm text-neutral-300"
            >
              Fechar
            </button>
          </div>
          <CatalogPresentation
            business={previewBusiness}
            services={previewServices}
            packages={packages}
            portfolioItems={portfolioItems}
            availabilitySlots={availabilitySlots}
            reviews={reviews}
            sectionsConfig={state.sectionsConfig}
          />
        </div>
      )}
    </div>
  );
}
