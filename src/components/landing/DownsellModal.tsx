"use client";

import { useEffect, useState } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";

const PRIMARY = "#e11d2a";

export default function DownsellModal({
  label,
  iniciantLink,
  downsellLink,
}: {
  label: string;
  iniciantLink: string;
  downsellLink: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full rounded-lg bg-white/10 py-3 text-center text-sm font-semibold text-white/50 transition hover:bg-white/15 hover:text-white/70"
        >
          {label}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Oferta especial antes de continuar"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              ✕
            </button>

            <p
              className="mx-auto mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              Espere! Uma oferta só pra você
            </p>

            <h3 className="text-lg font-bold text-neutral-900">
              Leve o Profissional completo com 10% de desconto
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Antes de ir pro plano Iniciante, veja isso: por menos de R$8 a mais, você libera portfólio, vídeos,
              pacotes, avaliações e analytics — sem marca d&rsquo;água.
            </p>

            <div className="mt-5 border-y border-black/5 py-4">
              <p className="text-sm text-neutral-400 line-through">R$67</p>
              <p className="text-3xl font-black tracking-tight text-neutral-900">
                R$59<span className="text-lg">,90</span>
              </p>
              <p className="mt-1 text-xs text-neutral-400">Pagamento único · acesso vitalício</p>
            </div>

            <a
              href={downsellLink}
              onClick={() =>
                trackMetaEvent("InitiateCheckout", {
                  value: 59.9,
                  currency: "BRL",
                  content_name: "Profissional (downsell)",
                })
              }
              className="mt-5 block w-full rounded-lg py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#06a742" }}
            >
              Quero o Profissional com desconto
            </a>

            <a
              href={iniciantLink}
              onClick={() =>
                trackMetaEvent("InitiateCheckout", {
                  value: 37,
                  currency: "BRL",
                  content_name: "Iniciante",
                })
              }
              className="mt-3 block text-xs text-neutral-400 underline hover:text-neutral-600"
            >
              Não, quero continuar só com o Iniciante
            </a>
          </div>
        </div>
      )}
    </>
  );
}
