"use client";

import { useMemo, useState } from "react";
import { BLOCK_CATEGORIES, BLOCK_DEFINITIONS } from "@/lib/catalog-builder/block-registry";
import { createDefaultBlock, type CatalogBlockType } from "@/lib/catalog-builder/schema";
import { useCatalogEditorDispatch, useCatalogEditorState } from "./CatalogEditorContext";
import { SectionMiniature } from "./CatalogMiniatures";

export default function BlockLibrary({
  open,
  onClose,
  afterInstanceId,
  permiteRecursosPro,
  availability,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  afterInstanceId?: string;
  permiteRecursosPro: boolean;
  availability: Partial<Record<CatalogBlockType, number>>;
  onAdded?: (instanceId: string) => void;
}) {
  const dispatch = useCatalogEditorDispatch();
  const editorState = useCatalogEditorState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof BLOCK_CATEGORIES)[number] | "Todos">("Todos");
  const filtered = useMemo(
    () => BLOCK_DEFINITIONS.filter((item) => {
      const matchesCategory = category === "Todos" || item.category === category;
      const term = query.trim().toLowerCase();
      const matchesQuery = !term || item.label.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    }),
    [category, query]
  );

  if (!open) return null;
  const reachedLimit = editorState.layout.blocks.length >= 30;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border-t border-neutral-800 bg-neutral-950 p-5 sm:max-w-4xl sm:rounded-2xl sm:border sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Adicionar seção</h2>
            <p className="mt-1 text-sm text-neutral-500">Veja como cada estrutura funciona antes de adicioná-la ao catálogo.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-neutral-800 px-3 py-2 text-xs text-neutral-300">Fechar</button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-sm text-red-300">↓</span>
          <div>
            <p className="text-xs font-semibold text-neutral-200">Posição da nova seção</p>
            <p className="text-[10px] text-neutral-500">{afterInstanceId ? "Será adicionada exatamente abaixo da seção escolhida." : "Será adicionada no final do catálogo."}</p>
          </div>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar seção"
          className="mt-5 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(["Todos", ...BLOCK_CATEGORIES] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${category === item ? "bg-white text-neutral-950" : "bg-neutral-900 text-neutral-400"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {filtered.map((definition) => {
            const locked = definition.professional && !permiteRecursosPro;
            const availableCount = availability[definition.type];
            return (
              <button
                key={definition.type}
                type="button"
                disabled={locked || reachedLimit}
                onClick={() => {
                  const block = createDefaultBlock(definition.type);
                  dispatch({ type: "ADD_BLOCK", block, afterInstanceId });
                  onAdded?.(block.instanceId);
                  onClose();
                }}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 text-left transition hover:-translate-y-0.5 hover:border-neutral-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <SectionMiniature type={definition.type} />
                <span className="block p-4">
                  <span className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-base font-bold text-red-400 ring-1 ring-neutral-800">{definition.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        {definition.label}
                        {locked && <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-500">PRO</span>}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-neutral-500">{definition.description}</span>
                    </span>
                  </span>
                  <span className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3">
                    <span className={`text-[10px] ${availableCount === 0 ? "text-amber-400" : "text-neutral-500"}`}>
                      {availableCount === undefined ? "Edite o conteúdo aqui" : availableCount === 0 ? "Sem conteúdo cadastrado" : `${availableCount} item(ns) disponível(is)`}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-white">{locked ? "Plano PRO" : "Adicionar +"}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {reachedLimit && <p className="mt-4 text-center text-xs text-amber-400">Este catálogo atingiu o limite de 30 seções.</p>}
      </div>
    </div>
  );
}
