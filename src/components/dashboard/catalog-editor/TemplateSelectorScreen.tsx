"use client";

import { useState } from "react";
import { CATALOG_TEMPLATES, TEMPLATE_IDS, type TemplateId } from "@/lib/domain/catalog-templates";
import CatalogPresentation, { type CatalogPresentationProps } from "@/components/catalog/CatalogPresentation";
import { createTemplateLayout } from "@/lib/catalog-builder/template-layouts";
import type { CatalogLayout } from "@/lib/catalog-builder/schema";
import { BLOCK_LABELS } from "@/lib/catalog-builder/schema";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";

type PreviewData = Pick<CatalogPresentationProps, "business" | "services" | "packages" | "portfolioItems" | "availabilitySlots" | "reviews">;

function TemplateThumbnail({
  templateId,
  data,
  layout,
  personalized,
}: {
  templateId: TemplateId;
  data: PreviewData;
  layout?: CatalogLayout;
  personalized?: boolean;
}) {
  const template = CATALOG_TEMPLATES[templateId];
  const previewBusiness = {
    ...data.business,
    template_id: templateId,
    primary_color: personalized ? data.business.primary_color : template.palette.primaryColorDefault,
    secondary_color: personalized ? data.business.secondary_color : template.palette.secondaryColorDefault,
  };
  return (
    <div className="relative h-32 w-full overflow-hidden bg-neutral-900">
      <div className="pointer-events-none absolute left-0 top-0 w-[625%] origin-top-left scale-[0.16] select-none">
        <CatalogPresentation
          {...data}
          business={previewBusiness}
          sectionsConfig={[]}
          catalogLayout={layout ?? createTemplateLayout(templateId)}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

export default function TemplateSelectorScreen({
  onContinue,
  ...data
}: PreviewData & { onContinue: () => void }) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [pendingTemplate, setPendingTemplate] = useState<TemplateId | null>(null);
  const [confirmScratch, setConfirmScratch] = useState(false);

  function chooseTemplate(templateId: TemplateId) {
    setPendingTemplate(templateId);
  }

  function applyTemplate(mode: "style" | "complete") {
    if (!pendingTemplate) return;
    if (mode === "style") {
      dispatch({ type: "APPLY_TEMPLATE_STYLE", templateId: pendingTemplate });
    } else {
      dispatch({ type: "APPLY_TEMPLATE", templateId: pendingTemplate, permiteRecursosPro: data.business.plano === "profissional" });
    }
    setPendingTemplate(null);
    onContinue();
  }

  function startFromScratch() {
    dispatch({ type: "START_FROM_SCRATCH" });
    setConfirmScratch(false);
    onContinue();
  }

  const currentTemplate = CATALOG_TEMPLATES[state.business.template_id as TemplateId] ?? CATALOG_TEMPLATES.classico_dark;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-xl font-semibold text-white">Como você quer construir seu catálogo?</h1>
      <p className="mt-1.5 text-sm text-neutral-400">
        Comece do zero ou use um template com cores, cards e seções prontos. Você pode ajustar tudo depois.
      </p>

      {state.templateCustomized && (
        <div className="mt-8">
          <span className="mb-2 block text-sm font-medium text-neutral-300">Seu catálogo atual</span>
          <div
            role="button"
            tabIndex={0}
            onClick={onContinue}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onContinue();
              }
            }}
            className="flex w-full items-center gap-4 rounded-xl border border-white bg-neutral-900 p-3 text-left"
          >
            <div className="w-28 shrink-0 overflow-hidden rounded-lg">
              <TemplateThumbnail templateId={currentTemplate.id} data={data} layout={state.layout} personalized />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Personalizado</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Baseado em {currentTemplate.nome}, com seus ajustes.
              </p>
              <span className="mt-2 inline-block text-xs font-semibold text-white underline">
                Continuar editando
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <span className="mb-2 block text-sm font-medium text-neutral-300">Monte do seu jeito</span>
        <button
          type="button"
          onClick={() => setConfirmScratch(true)}
          className="group grid w-full gap-4 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 text-left transition hover:border-neutral-600 sm:grid-cols-[180px_1fr] sm:items-center"
        >
          <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-700 bg-neutral-950">
            <div className="absolute inset-x-4 top-4 h-7 rounded-md border border-neutral-800 bg-neutral-900" />
            <div className="grid w-28 grid-cols-2 gap-2 pt-7">
              <span className="h-8 rounded-md border border-neutral-800 bg-neutral-900" />
              <span className="h-8 rounded-md border border-neutral-800 bg-neutral-900" />
            </div>
            <span className="absolute bottom-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-light text-neutral-950 transition group-hover:scale-105">
              +
            </span>
          </div>
          <div>
            <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
              Controle total
            </span>
            <p className="mt-3 text-base font-semibold text-white">Começar do zero</p>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Abra somente a base do seu catálogo e adicione cada seção na ordem que preferir.
            </p>
            <span className="mt-3 inline-flex text-xs font-semibold text-white">Criar catálogo vazio →</span>
          </div>
        </button>
      </div>

      <div className="mt-8">
        <span className="mb-2 block text-sm font-medium text-neutral-300">
          {state.templateCustomized ? "Ou comece de um template pronto" : "Templates prontos"}
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEMPLATE_IDS.map((id) => {
            const template = CATALOG_TEMPLATES[id];
            const isActive = !state.templateCustomized && state.business.template_id === id;
            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => chooseTemplate(id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    chooseTemplate(id);
                  }
                }}
                className={`overflow-hidden rounded-xl border p-3 text-left transition ${
                  isActive ? "border-white bg-neutral-900" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                }`}
              >
                <TemplateThumbnail templateId={id} data={data} />
                <p className="mt-3 text-sm font-semibold text-white">{template.nome}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{template.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>

      {pendingTemplate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Como deseja aplicar este template?</p>
            <p className="mt-2 text-sm text-neutral-400">
              O template <strong className="text-white">{CATALOG_TEMPLATES[pendingTemplate].nome}</strong> possui esta
              seleção inicial de seções:
            </p>
            <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
              {createTemplateLayout(pendingTemplate).blocks.map((block) => (
                <span key={block.instanceId} className="rounded-full bg-neutral-900 px-2 py-1 text-[10px] text-neutral-400">
                  {BLOCK_LABELS[block.type]}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => applyTemplate("style")}
              className="mt-5 w-full rounded-lg border border-neutral-700 px-4 py-3 text-left"
            >
              <span className="block text-sm font-semibold text-white">Aplicar somente o estilo</span>
              <span className="mt-1 block text-xs text-neutral-500">Troca cores e identidade, preservando todas as suas seções e a ordem atual.</span>
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("complete")}
              className="mt-2 w-full rounded-lg bg-white px-4 py-3 text-left text-neutral-950"
            >
              <span className="block text-sm font-semibold">Aplicar template completo</span>
              <span className="mt-1 block text-xs text-neutral-600">Substitui a estrutura atual pela seleção mostrada acima. Seus serviços, fotos e dados continuam salvos.</span>
            </button>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmScratch && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-base font-semibold text-white">Começar um catálogo vazio?</p>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              A estrutura atual será removida do editor. Seus serviços, pacotes, fotos e dados do negócio continuam salvos e poderão ser adicionados novamente como seções.
            </p>
            <button
              type="button"
              onClick={startFromScratch}
              className="mt-5 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-950"
            >
              Sim, construir do zero
            </button>
            <button
              type="button"
              onClick={() => setConfirmScratch(false)}
              className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
