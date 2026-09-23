"use client";

import type { EditableTarget } from "@/lib/domain/editable-target";
import type { Plano } from "@/lib/domain/plans";
import { useCatalogEditorState } from "./CatalogEditorContext";
import TextosPanel from "./panels/TextosPanel";
import HeroMediaPanel from "./panels/HeroMediaPanel";
import SectionVisibilityPanel from "./panels/SectionVisibilityPanel";
import ServicoMediaEditor from "./panels/ServicoMediaEditor";
import BlockEditorPanel, { type CatalogSourceOption, type ManagedSectionStatus } from "./BlockEditorPanel";

function targetTitle(target: EditableTarget): string {
  switch (target.kind) {
    case "section_text":
      if (target.field === "headline") return "Título de destaque";
      if (target.field === "about") return "Sobre o negócio";
      return "Frases de destaque";
    case "hero_media":
      return target.field === "logo_url" ? "Logo" : "Foto principal e cores";
    case "service_media":
      return "Mídia do serviço";
    case "catalog_block":
      return "Editar seção";
    case "section_block":
      return "Seção do catálogo";
  }
}

export default function BottomSheet({
  target,
  onClose,
  plano,
  permiteGaleriaFotos,
  permiteVideos,
  permiteOcultarSecoes,
  sourceOptions,
  managedStatus,
  onEditSalesPage,
}: {
  target: EditableTarget | null;
  onClose: () => void;
  plano: Plano;
  permiteGaleriaFotos: boolean;
  permiteVideos: boolean;
  permiteOcultarSecoes: boolean;
  sourceOptions: { services: CatalogSourceOption[]; packages: CatalogSourceOption[]; portfolio: CatalogSourceOption[]; reviews: CatalogSourceOption[] };
  managedStatus: ManagedSectionStatus;
  onEditSalesPage?: (serviceId: string) => void;
}) {
  const state = useCatalogEditorState();

  if (!target) return null;
  const showHeader = target.kind !== "service_media";

  const showFooterConfirm = target.kind === "catalog_block";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={targetTitle(target)}
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-neutral-800 bg-neutral-950 sm:max-w-2xl sm:rounded-2xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {showHeader && (
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{targetTitle(target)}</h3>
              <button type="button" onClick={onClose} className="text-xs text-neutral-400 underline">
                Fechar
              </button>
            </div>
          )}

          {target.kind === "section_text" && (
            <TextosPanel campoFoco={target.field === "highlights" ? undefined : target.field} />
          )}

          {target.kind === "hero_media" && <HeroMediaPanel campoFoco={target.field} />}

          {target.kind === "service_media" &&
            (() => {
              const service = state.services.find((s) => s.id === target.serviceId);
              if (!service) return null;
              return (
                <ServicoMediaEditor
                  service={service}
                  permiteGaleriaFotos={permiteGaleriaFotos}
                  permiteVideos={permiteVideos}
                  onClose={onClose}
                  onEditSalesPage={onEditSalesPage ? () => onEditSalesPage(service.id) : undefined}
                />
              );
            })()}

          {target.kind === "section_block" && (
            <SectionVisibilityPanel
              sectionId={target.sectionId}
              plano={plano}
              permiteOcultarSecoes={permiteOcultarSecoes}
              permiteVideos={permiteVideos}
            />
          )}

          {target.kind === "catalog_block" && (
            <BlockEditorPanel instanceId={target.instanceId} permiteVideos={permiteVideos} permiteOcultarSecoes={permiteOcultarSecoes} sourceOptions={sourceOptions} managedStatus={managedStatus} onClose={onClose} />
          )}
        </div>

        {showFooterConfirm && (
          <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 p-4 sm:p-5">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              ✓ Concluir e aplicar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
