"use client";

import { useState } from "react";
import { CATALOG_TEMPLATES, TEMPLATE_IDS, type TemplateId } from "@/lib/domain/catalog-templates";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";

function TemplateThumbnail({ templateId }: { templateId: TemplateId }) {
  const template = CATALOG_TEMPLATES[templateId];
  return (
    <div
      className="flex h-24 w-full flex-col gap-1.5 p-2.5"
      style={{ backgroundColor: template.palette.bg, borderRadius: template.cardStyle.borderRadius }}
    >
      <div
        className="h-2.5 w-2/3"
        style={{
          backgroundColor: template.palette.textColor,
          borderRadius: "2px",
          fontWeight: template.typography.headingWeight,
        }}
      />
      <div className="flex flex-1 gap-1.5">
        <div
          className="flex-1"
          style={{
            backgroundColor: template.palette.bgDeep,
            borderRadius: template.cardStyle.borderRadius,
            border: `${template.cardStyle.borderWidth} solid ${template.palette.textMuted}`,
          }}
        />
        <div
          className="flex-1"
          style={{
            backgroundColor: template.palette.bgDeep,
            borderRadius: template.cardStyle.borderRadius,
            border: `${template.cardStyle.borderWidth} solid ${template.palette.textMuted}`,
          }}
        />
      </div>
      <div
        className="h-2 w-1/3 rounded-full"
        style={{ backgroundColor: template.palette.primaryColorDefault }}
      />
    </div>
  );
}

export default function TemplateSelectorScreen({ onContinue }: { onContinue: () => void }) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [pendingTemplate, setPendingTemplate] = useState<TemplateId | null>(null);

  function chooseTemplate(templateId: TemplateId) {
    if (state.templateCustomized) {
      setPendingTemplate(templateId);
      return;
    }
    dispatch({ type: "APPLY_TEMPLATE", templateId });
    onContinue();
  }

  function confirmApply() {
    if (!pendingTemplate) return;
    dispatch({ type: "APPLY_TEMPLATE", templateId: pendingTemplate });
    setPendingTemplate(null);
    onContinue();
  }

  const currentTemplate = CATALOG_TEMPLATES[state.business.template_id as TemplateId] ?? CATALOG_TEMPLATES.classico_dark;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-xl font-semibold text-white">Escolha o template do seu catálogo</h1>
      <p className="mt-1.5 text-sm text-neutral-400">
        Cada template já vem com cores, estilo dos cards e seções prontos. Você pode ajustar tudo depois.
      </p>

      {state.templateCustomized && (
        <div className="mt-8">
          <span className="mb-2 block text-sm font-medium text-neutral-300">Seu catálogo atual</span>
          <button
            type="button"
            onClick={onContinue}
            className="flex w-full items-center gap-4 rounded-xl border border-white bg-neutral-900 p-3 text-left"
          >
            <div className="w-28 shrink-0 overflow-hidden rounded-lg">
              <TemplateThumbnail templateId={currentTemplate.id} />
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
          </button>
        </div>
      )}

      <div className="mt-8">
        <span className="mb-2 block text-sm font-medium text-neutral-300">
          {state.templateCustomized ? "Ou comece de um template pronto" : "Templates prontos"}
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEMPLATE_IDS.map((id) => {
            const template = CATALOG_TEMPLATES[id];
            const isActive = !state.templateCustomized && state.business.template_id === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => chooseTemplate(id)}
                className={`overflow-hidden rounded-xl border p-3 text-left transition ${
                  isActive ? "border-white bg-neutral-900" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                }`}
              >
                <TemplateThumbnail templateId={id} />
                <p className="mt-3 text-sm font-semibold text-white">{template.nome}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{template.descricao}</p>
              </button>
            );
          })}
        </div>
      </div>

      {pendingTemplate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-sm font-semibold text-white">Trocar de template?</p>
            <p className="mt-2 text-sm text-neutral-400">
              Isso vai substituir suas cores e a ordem/visibilidade das seções pelas do template{" "}
              <strong className="text-white">{CATALOG_TEMPLATES[pendingTemplate].nome}</strong>. Seus textos, fotos e
              vídeos cadastrados não são afetados.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="flex-1 rounded-lg border border-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmApply}
                className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950"
              >
                Substituir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
