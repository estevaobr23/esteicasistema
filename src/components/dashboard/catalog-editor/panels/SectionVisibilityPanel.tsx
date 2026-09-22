"use client";

import { SECTION_LABELS, moveSectionId, type SectionId } from "@/lib/domain/catalog-sections";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";
import AvaliacoesPanel from "./AvaliacoesPanel";
import BrandingVideoPanel from "./BrandingVideoPanel";
import type { Plano } from "@/lib/domain/plans";

export default function SectionVisibilityPanel({
  sectionId,
  plano,
  permiteOcultarSecoes,
  permiteVideos,
}: {
  sectionId: SectionId;
  plano: Plano;
  permiteOcultarSecoes: boolean;
  permiteVideos: boolean;
}) {
  if (sectionId === "avaliacoes") return <AvaliacoesPanel plano={plano} />;
  if (sectionId === "branding_video") return <BrandingVideoPanel permiteVideos={permiteVideos} />;

  return <GenericSectionControls sectionId={sectionId} permiteOcultarSecoes={permiteOcultarSecoes} />;
}

function GenericSectionControls({
  sectionId,
  permiteOcultarSecoes,
}: {
  sectionId: SectionId;
  permiteOcultarSecoes: boolean;
}) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const index = state.sectionsConfig.findIndex((s) => s.id === sectionId);
  const section = state.sectionsConfig[index];
  if (!section) return null;

  function move(direction: -1 | 1) {
    const ids = state.sectionsConfig.map((s) => s.id);
    const next = moveSectionId(ids, index, direction);
    dispatch({ type: "REORDER_SECTIONS", ids: next });
  }

  return (
    <div className="space-y-4">
      {!permiteOcultarSecoes && (
        <p className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
          🔒 Reordenar e ocultar seções está disponível no plano Profissional.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={section.visible}
          disabled={!permiteOcultarSecoes}
          onChange={(e) => dispatch({ type: "TOGGLE_SECTION", id: sectionId, visible: e.target.checked })}
          className="h-4 w-4 accent-white disabled:opacity-30"
        />
        Mostrar &ldquo;{SECTION_LABELS[sectionId]}&rdquo; no catálogo
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!permiteOcultarSecoes || index === 0}
          onClick={() => move(-1)}
          className="flex-1 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-300 disabled:opacity-30"
        >
          ↑ Mover para cima
        </button>
        <button
          type="button"
          disabled={!permiteOcultarSecoes || index === state.sectionsConfig.length - 1}
          onClick={() => move(1)}
          className="flex-1 rounded-lg border border-neutral-800 px-3 py-2 text-sm text-neutral-300 disabled:opacity-30"
        >
          ↓ Mover para baixo
        </button>
      </div>
    </div>
  );
}
