"use client";

import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

export default function TextosPanel() {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();

  function updateHighlight(index: number, value: string) {
    const next = [...state.business.highlights];
    next[index] = value;
    dispatch({ type: "SET_HIGHLIGHTS", values: next });
  }

  function addHighlight() {
    if (state.business.highlights.length >= 4) return;
    dispatch({ type: "SET_HIGHLIGHTS", values: [...state.business.highlights, ""] });
  }

  function removeHighlight(index: number) {
    dispatch({ type: "SET_HIGHLIGHTS", values: state.business.highlights.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Título de destaque</label>
        <input
          value={state.business.headline}
          onChange={(e) => dispatch({ type: "SET_HEADLINE", value: e.target.value })}
          placeholder={state.business.headline || "Usa o nome do negócio se deixar em branco"}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Sobre</label>
        <textarea
          value={state.business.about}
          onChange={(e) => dispatch({ type: "SET_ABOUT", value: e.target.value })}
          rows={4}
          placeholder="Conte um pouco sobre o seu negócio."
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-300">Frases de destaque</span>
          {state.business.highlights.length < 4 && (
            <button type="button" onClick={addHighlight} className="text-xs font-semibold text-white underline">
              + Adicionar
            </button>
          )}
        </div>
        <div className="space-y-2">
          {state.business.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={h}
                onChange={(e) => updateHighlight(i, e.target.value)}
                placeholder="Ex: +500 carros atendidos"
                className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeHighlight(i)}
                className="rounded-lg border border-neutral-800 px-2.5 py-2 text-xs text-neutral-400"
              >
                Remover
              </button>
            </div>
          ))}
          {state.business.highlights.length === 0 && (
            <p className="text-xs text-neutral-500">Nenhuma frase adicionada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
