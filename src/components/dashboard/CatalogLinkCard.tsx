"use client";

import { useState } from "react";
import type { Business } from "@/lib/domain/business";

export default function CatalogLinkCard({ business }: { business: Business }) {
  const [copiado, setCopiado] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${business.slug}`;

  async function copiarLink() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const mensagemCompartilhar = encodeURIComponent(
    `Conheça os serviços da ${business.name}: ${url}`
  );

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${business.published ? "bg-emerald-500" : "bg-neutral-600"}`}
        />
        <span className="text-sm font-medium text-neutral-300">
          {business.published ? "Publicado" : "Rascunho"}
        </span>
      </div>

      <p className="mb-4 break-all font-mono text-sm text-white">{url}</p>

      <div className="flex flex-wrap gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Abrir catálogo
        </a>
        <button
          onClick={copiarLink}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-white"
        >
          {copiado ? "Copiado!" : "Copiar link"}
        </button>
        <a
          href={`https://wa.me/?text=${mensagemCompartilhar}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Compartilhar
        </a>
      </div>
    </div>
  );
}
