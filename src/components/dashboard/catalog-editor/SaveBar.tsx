"use client";

import { useTransition } from "react";
import { salvarCatalogoCompleto } from "@/app/app/(dashboard)/catalogo/actions";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";

export default function SaveBar() {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    dispatch({ type: "SAVING", saving: true });
    startTransition(async () => {
      const result = await salvarCatalogoCompleto({
        business: state.business,
        services: state.services,
        sectionsConfig: state.sectionsConfig,
      });
      if (result.ok) {
        dispatch({ type: "SAVE_SUCCESS", savedAt: result.savedAt });
      } else {
        dispatch({ type: "SAVE_ERROR", message: result.error });
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {state.dirty && !state.saving && (
        <span className="hidden text-xs text-amber-400 sm:inline">Alterações não salvas</span>
      )}
      {state.saveError && <span className="hidden text-xs text-red-400 sm:inline">{state.saveError}</span>}
      {!state.dirty && state.lastSavedAt && !state.saving && (
        <span className="hidden text-xs text-emerald-400 sm:inline">Salvo</span>
      )}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || state.saving || !state.dirty}
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950 disabled:opacity-50"
      >
        {state.saving || isPending ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
