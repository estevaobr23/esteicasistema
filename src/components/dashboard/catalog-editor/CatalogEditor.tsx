"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import CatalogPresentation from "@/components/catalog/CatalogPresentation";
import ServiceSalesPage from "@/components/catalog/ServiceSalesPage";
import { limitesDoPlano } from "@/lib/domain/plans";
import type { EditableTarget } from "@/lib/domain/editable-target";
import { useSetBottomNavHidden } from "@/components/dashboard/BottomNavVisibilityProvider";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";
import TemplateSelectorScreen from "./TemplateSelectorScreen";
import BottomSheet from "./BottomSheet";
import SaveBar from "./SaveBar";
import BlockLibrary from "./BlockLibrary";
import { formatBRL } from "@/lib/format";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type ServiceFeature = Database["public"]["Tables"]["service_features"]["Row"];
type ServicePriceRow = Database["public"]["Tables"]["service_prices"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"] & {
  service_features?: ServiceFeature[];
  service_prices?: ServicePriceRow[];
};
type Package = Database["public"]["Tables"]["packages"]["Row"] & {
  package_services?: { service_id: string }[];
  package_benefits?: Database["public"]["Tables"]["package_benefits"]["Row"][];
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showTemplateScreen, setShowTemplateScreen] = useState(!searchParams.get("servico"));
  const [activeTarget, setActiveTarget] = useState<EditableTarget | null>(null);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [addAfterInstanceId, setAddAfterInstanceId] = useState<string | undefined>();
  const [editMode, setEditMode] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const hasExampleContent = state.layout.blocks.some((block) => block.instanceId.startsWith("onboarding-example"));
  const [showExampleNotice, setShowExampleNotice] = useState(hasExampleContent);
  const editingSalesPageServiceId = searchParams.get("servico");
  const plano = business.plano as "essencial" | "profissional";
  const limites = limitesDoPlano(plano);

  function setEditingSalesPageServiceId(serviceId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (serviceId) params.set("servico", serviceId);
    else params.delete("servico");
    const query = params.toString();
    router.push(query ? `/app/catalogo?${query}` : "/app/catalogo");
  }

  useEffect(() => {
    setBottomNavHidden(!showTemplateScreen);
    return () => setBottomNavHidden(false);
  }, [showTemplateScreen, setBottomNavHidden]);

  if (showTemplateScreen) {
    return (
      <TemplateSelectorScreen
        business={business}
        services={services}
        packages={packages}
        portfolioItems={portfolioItems}
        availabilitySlots={availabilitySlots}
        reviews={reviews}
        onContinue={() => setShowTemplateScreen(false)}
      />
    );
  }

  const previewBusiness: Business = {
    ...business,
    template_id: state.business.template_id,
    theme: state.business.theme,
    primary_color: state.business.primary_color,
    secondary_color: state.business.secondary_color,
    bg_color_override: state.business.bg_color_override || null,
    font_pair_id: state.business.font_pair_id,
    animation_preset: state.business.animation_preset,
    logo_url: state.business.logo_url || null,
    cover_url: state.business.cover_url || null,
    about: state.business.about || null,
    headline: state.business.headline || null,
    highlights: state.business.highlights,
    branding_video_url: state.business.branding_video_url || null,
    hero_show_city_badge: state.business.hero_show_city_badge,
    hero_show_price_badge: state.business.hero_show_price_badge,
    hero_show_whatsapp_badge: state.business.hero_show_whatsapp_badge,
    button_radius: state.business.button_radius,
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
      sales_headline: draft.sales_headline || null,
      sales_subheadline: draft.sales_subheadline || null,
      sales_video_url: draft.sales_video_url || null,
      sales_page_enabled: draft.sales_page_enabled,
      sales_gallery: draft.sales_gallery,
      sales_bonuses: draft.sales_bonuses,
      sales_cta_message: draft.sales_cta_message || null,
      sales_guarantee_text: draft.sales_guarantee_text || null,
      sales_faq: draft.sales_faq,
      sales_urgency_text: draft.sales_urgency_text || null,
    };
  });

  const catalogSourceOptions = {
    services: services.map((item) => ({ id: item.id, name: item.name, imageUrl: item.image_url || item.before_image, secondaryImageUrl: item.after_image, meta: item.base_price ? `A partir de ${formatBRL(item.base_price)}` : item.category || "Serviço", featured: item.featured })),
    packages: packages.map((item) => ({ id: item.id, name: item.name, imageUrl: item.image_url, meta: formatBRL(item.promotional_price ?? item.price), featured: item.featured })),
    portfolio: portfolioItems.map((item) => ({ id: item.id, name: item.title ?? ([item.vehicle_make, item.vehicle_model].filter(Boolean).join(" ") || "Projeto sem título"), imageUrl: item.before_image || item.image_url, secondaryImageUrl: item.after_image, meta: item.category || item.vehicle || "Resultado", featured: item.featured })),
    reviews: reviews.map((item) => ({ id: item.id, name: item.customer_name, imageUrl: item.customer_photo_url, meta: `${"★".repeat(item.rating)} ${item.source}`, featured: item.rating === 5 })),
  };
  const managedSectionStatus = {
    branding_video: { ready: Boolean(state.business.branding_video_url), summary: state.business.branding_video_url ? "Vídeo de apresentação configurado." : "Adicione o link do vídeo diretamente neste painel." },
    horarios: { ready: availabilitySlots.length > 0, summary: availabilitySlots.length > 0 ? `${availabilitySlots.length} horário(s) ativo(s) disponível(is).` : "Cadastre os horários de atendimento para exibir esta seção." },
    sobre: { ready: Boolean(state.business.about), summary: state.business.about ? "Texto sobre o negócio configurado." : "Escreva uma apresentação do negócio para ativar esta seção." },
    localizacao: { ready: Boolean(business.address || business.city), summary: business.address || business.city ? "Localização do negócio configurada." : "Preencha cidade e endereço para ativar esta seção." },
  };

  function openBlockLibrary(afterInstanceId?: string) {
    setAddAfterInstanceId(afterInstanceId);
    setShowBlockLibrary(true);
  }

  if (editingSalesPageServiceId) {
    const editingService = previewServices.find((s) => s.id === editingSalesPageServiceId);
    if (editingService) {
      return (
        <div className="min-h-screen">
          <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-neutral-900 bg-neutral-950/95 px-3 py-2 backdrop-blur sm:px-4 sm:py-3">
            <button
              type="button"
              onClick={() => setEditingSalesPageServiceId(null)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-600 sm:text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
              Voltar ao catálogo
            </button>
            <p className="hidden truncate text-xs text-neutral-500 sm:block">
              Editando a página de vendas de <strong className="text-neutral-300">{editingService.name}</strong>
            </p>
            <SaveBar />
          </div>

          <ServiceSalesPage
            business={previewBusiness}
            service={editingService}
            reviews={reviews.filter((r) => r.service_id === editingService.id)}
            editable
            onEditTap={() => setActiveTarget({ kind: "service_media", serviceId: editingService.id })}
          />

          <BottomSheet
            target={activeTarget}
            onClose={() => setActiveTarget(null)}
            plano={plano}
            permiteGaleriaFotos={limites.permiteGaleriaFotos}
        permiteVideos={limites.permiteVideos}
        permiteOcultarSecoes={limites.permiteOcultarSecoes}
        sourceOptions={catalogSourceOptions}
        managedStatus={managedSectionStatus}
      />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 border-b border-neutral-900 bg-neutral-950/95 backdrop-blur">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <Link
            href="/app/dashboard"
            aria-label="Voltar para o dashboard"
            className="flex shrink-0 items-center justify-center rounded-lg border border-neutral-800 p-2 text-neutral-300 hover:border-neutral-600 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
          </Link>
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">Editor do catálogo</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${business.published ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"}`}>
                {business.published ? "Publicado" : "Rascunho"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-600">
              {editMode ? "Toque em qualquer área da prévia para editar" : "Modo navegação — veja o catálogo como o cliente vê"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className={`shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:text-sm ${
              editMode ? "bg-emerald-600 text-white hover:bg-emerald-500" : "border border-neutral-800 text-neutral-300 hover:border-neutral-600"
            }`}
          >
            {editMode ? "✎ Editando" : "Ativar edição"}
          </button>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-0.5 rounded-lg border border-neutral-800 p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                aria-label="Ver como desktop"
                aria-pressed={previewDevice === "desktop"}
                className={`flex h-7 w-8 items-center justify-center rounded-md text-xs transition ${
                  previewDevice === "desktop" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15H11v1.5h2.25a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5H9V15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Zm2.25-.75a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h11.5a.75.75 0 0 0 .75-.75v-8.5a.75.75 0 0 0-.75-.75H4.25Z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                aria-label="Ver como celular"
                aria-pressed={previewDevice === "mobile"}
                className={`flex h-7 w-8 items-center justify-center rounded-md text-xs transition ${
                  previewDevice === "mobile" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H6Zm0 1.5h8a.5.5 0 0 1 .5.5v10.5h-9V4a.5.5 0 0 1 .5-.5Zm3 12.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {editMode && (
              <button
                type="button"
                onClick={() => setActiveTarget({ kind: "hero_media", field: "cover_url" })}
                className="rounded-lg border border-neutral-800 px-2.5 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-600 sm:text-sm"
              >
                Estilo
              </button>
            )}
            {editMode && (
              <button
                type="button"
                onClick={() => openBlockLibrary()}
                className="rounded-lg bg-red-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-red-500 sm:text-sm"
              >
                + Seção
              </button>
            )}
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 md:inline-flex"
            >
              Abrir ↗
            </a>
            {editMode && (
              <button
                type="button"
                onClick={() => setShowTemplateScreen(true)}
                className="hidden rounded-lg border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 sm:inline-flex"
              >
                Template
              </button>
            )}
            <SaveBar />
          </div>
        </div>
      </div>

      {showExampleNotice && !state.dirty && (
        <div className="border-b border-sky-900/60 bg-sky-950/80 px-4 py-3 text-sky-100">
          <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Conteúdo de exemplo</p>
              <p className="mt-0.5 text-xs text-sky-200/70">Revise textos, preços e imagens antes de publicar. Tudo pode ser editado.</p>
            </div>
            <button type="button" onClick={() => setShowExampleNotice(false)} className="shrink-0 text-xs font-semibold text-sky-200 underline">Entendi</button>
          </div>
        </div>
      )}

      {previewDevice === "mobile" ? (
        <div className="flex justify-center overflow-x-auto bg-neutral-950 px-4 py-8 sm:py-10">
          <div>
            <div className="w-[390px] overflow-hidden rounded-[2.5rem] border-[10px] border-neutral-800 bg-black shadow-2xl">
              <div className="relative h-6 bg-neutral-800">
                <div className="absolute left-1/2 top-1 h-4 w-24 -translate-x-1/2 rounded-full bg-black" />
              </div>
              <iframe
                key={business.slug}
                src={`/${business.slug}`}
                title="Prévia no celular"
                width={390}
                height={720}
                className="block bg-white"
              />
            </div>
            <p className="mt-3 text-center text-xs text-neutral-500">
              Prévia real da última versão salva. Edite no modo desktop e clique em Salvar para atualizar aqui.
            </p>
          </div>
        </div>
      ) : (
        <CatalogPresentation
          business={previewBusiness}
          services={previewServices}
          packages={packages}
          portfolioItems={portfolioItems}
          availabilitySlots={availabilitySlots}
          reviews={reviews}
          sectionsConfig={state.sectionsConfig}
          catalogLayout={state.layout}
          editable={editMode}
          onFieldTap={editMode ? setActiveTarget : undefined}
          onMoveBlock={editMode ? (instanceId, direction) => dispatch({ type: "MOVE_BLOCK", instanceId, direction }) : undefined}
          onAddBlockAfter={editMode ? openBlockLibrary : undefined}
          onRemoveHeroBadge={editMode ? (badge) => dispatch({ type: "SET_HERO_BADGE", badge, visible: false }) : undefined}
        />
      )}

      <BottomSheet
        target={activeTarget}
        onClose={() => setActiveTarget(null)}
        plano={plano}
        permiteGaleriaFotos={limites.permiteGaleriaFotos}
        permiteVideos={limites.permiteVideos}
        permiteOcultarSecoes={limites.permiteOcultarSecoes}
        sourceOptions={catalogSourceOptions}
        managedStatus={managedSectionStatus}
        onEditSalesPage={(serviceId) => {
          setActiveTarget(null);
          setEditingSalesPageServiceId(serviceId);
        }}
      />

      <BlockLibrary
        open={showBlockLibrary}
        onClose={() => setShowBlockLibrary(false)}
        afterInstanceId={addAfterInstanceId}
        permiteRecursosPro={limites.permiteVideos}
        availability={{
          servicos: state.services.length,
          destaques: services.length,
          pacotes: packages.length,
          antes_depois: portfolioItems.length,
          avaliacoes: reviews.length,
          branding_video: state.business.branding_video_url ? 1 : 0,
          horarios: availabilitySlots.length,
          sobre: state.business.about ? 1 : 0,
          localizacao: business.address || business.city ? 1 : 0,
        }}
        onAdded={(instanceId) => setActiveTarget({ kind: "catalog_block", instanceId })}
      />
    </div>
  );
}
