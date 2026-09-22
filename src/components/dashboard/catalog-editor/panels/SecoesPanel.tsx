"use client";

import { SECTION_LABELS, type SectionId } from "@/lib/domain/catalog-sections";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

export default function SecoesPanel({ permiteOcultarSecoes }: { permiteOcultarSecoes: boolean }) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();

  function move(index: number, direction: -1 | 1) {
    const ids = state.sectionsConfig.map((s) => s.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    dispatch({ type: "REORDER_SECTIONS", ids: next as SectionId[] });
  }

  return (
    <div className="space-y-3">
      {!permiteOcultarSecoes && (
        <p className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
          🔒 Reordenar e ocultar seções está disponível no plano Profissional.
        </p>
      )}

      <div className="space-y-2">
        {state.sectionsConfig.map((section, i) => (
          <div
            key={section.id}
            className={`flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 ${
              !permiteOcultarSecoes ? "opacity-50" : ""
            }`}
          >
            <span className="text-sm text-white">{SECTION_LABELS[section.id]}</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!permiteOcultarSecoes || i === 0}
                onClick={() => move(i, -1)}
                className="rounded border border-neutral-800 px-2 py-1 text-xs text-neutral-300 disabled:opacity-30"
                aria-label={`Mover ${SECTION_LABELS[section.id]} para cima`}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={!permiteOcultarSecoes || i === state.sectionsConfig.length - 1}
                onClick={() => move(i, 1)}
                className="rounded border border-neutral-800 px-2 py-1 text-xs text-neutral-300 disabled:opacity-30"
                aria-label={`Mover ${SECTION_LABELS[section.id]} para baixo`}
              >
                ↓
              </button>
              <label className="ml-1 inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={section.visible}
                  disabled={!permiteOcultarSecoes}
                  onChange={(e) => dispatch({ type: "TOGGLE_SECTION", id: section.id, visible: e.target.checked })}
                  className="h-4 w-4 accent-white disabled:opacity-30"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
