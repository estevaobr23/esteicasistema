"use client";

import Link from "next/link";
import { limitesDoPlano, type Plano } from "@/lib/domain/plans";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

export default function AvaliacoesPanel({ plano }: { plano: Plano }) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const permiteAvaliacoes = limitesDoPlano(plano).permiteAvaliacoes;
  const visible = state.sectionsConfig.find((section) => section.id === "avaliacoes")?.visible ?? true;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-200">Mostrar avaliações no catálogo</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Exiba comentários e estrelas para reforçar a confiança antes do primeiro contato.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            aria-label="Mostrar avaliações no catálogo"
            disabled={!permiteAvaliacoes}
            onClick={() => dispatch({ type: "TOGGLE_SECTION", id: "avaliacoes", visible: !visible })}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50 ${
              visible && permiteAvaliacoes ? "bg-white" : "bg-neutral-700"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-neutral-950 transition-transform ${
                visible ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {!permiteAvaliacoes && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
            <span aria-hidden>🔒</span>
            Disponível no plano Profissional
          </p>
        )}
      </div>

      <Link
        href="/app/avaliacoes"
        className="flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
      >
        Gerenciar avaliações
      </Link>
    </div>
  );
}
