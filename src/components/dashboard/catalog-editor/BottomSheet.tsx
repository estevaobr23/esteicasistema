"use client";

import type { EditableTarget } from "@/lib/domain/editable-target";
import type { Plano } from "@/lib/domain/plans";
import { useCatalogEditorState } from "./CatalogEditorContext";
import TextosPanel from "./panels/TextosPanel";
import HeroMediaPanel from "./panels/HeroMediaPanel";
import SectionVisibilityPanel from "./panels/SectionVisibilityPanel";
import ServicoMediaEditor from "./panels/ServicoMediaEditor";

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
}: {
  target: EditableTarget | null;
  onClose: () => void;
  plano: Plano;
  permiteGaleriaFotos: boolean;
  permiteVideos: boolean;
  permiteOcultarSecoes: boolean;
}) {
  const state = useCatalogEditorState();

  if (!target) return null;
  const showHeader = target.kind !== "service_media";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl border-t border-neutral-800 bg-neutral-950 p-5 sm:max-w-md sm:rounded-2xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
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
      </div>
    </div>
  );
}
