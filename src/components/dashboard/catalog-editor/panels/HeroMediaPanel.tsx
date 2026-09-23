"use client";

import { useState } from "react";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";
import { CATALOG_FONT_PAIRS, getCatalogFontPair } from "@/lib/domain/catalog-fonts";
import { CATALOG_FONT_VARIABLE_CLASSES } from "@/lib/domain/catalog-font-runtime";
import ColorPaletteWizard from "../ColorPaletteWizard";

export default function HeroMediaPanel({ campoFoco }: { campoFoco?: "logo_url" | "cover_url" }) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [uploading, setUploading] = useState<"logo" | "capa" | null>(null);
  const [showColorWizard, setShowColorWizard] = useState(false);

  async function handleUpload(pasta: "logo" | "capa", file: File) {
    setUploading(pasta);
    try {
      const url = await uploadBusinessMedia(state.businessId, pasta, file);
      if (pasta === "logo") dispatch({ type: "SET_LOGO_URL", url });
      else dispatch({ type: "SET_COVER_URL", url });
    } finally {
      setUploading(null);
    }
  }

  if (showColorWizard) {
    return <ColorPaletteWizard initialPrimary={state.business.primary_color} fontPairId={state.business.font_pair_id} onClose={() => setShowColorWizard(false)} onApply={(palette) => dispatch({ type: "APPLY_PALETTE", ...palette })} />;
  }

  return (
    <div className={`${CATALOG_FONT_VARIABLE_CLASSES} space-y-6`}>
      <div className={`grid grid-cols-2 gap-4 ${campoFoco === "logo_url" || campoFoco === "cover_url" ? "" : ""}`}>
        <UploadField
          label="Logo"
          previewUrl={state.business.logo_url}
          uploading={uploading === "logo"}
          onFile={(f) => handleUpload("logo", f)}
          highlighted={campoFoco === "logo_url"}
        />
        <UploadField
          label="Foto principal"
          previewUrl={state.business.cover_url}
          uploading={uploading === "capa"}
          onFile={(f) => handleUpload("capa", f)}
          highlighted={campoFoco === "cover_url"}
        />
      </div>

      <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><h4 className="text-sm font-semibold text-white">Cores da marca</h4><p className="mt-1 text-xs leading-5 text-neutral-500">Crie uma paleta completa ou faça um ajuste rápido.</p></div>
          <button type="button" onClick={() => setShowColorWizard(true)} className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Criar paleta</button>
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Cor principal</label>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
            <input
              type="color"
              value={state.business.primary_color}
              onChange={(e) => dispatch({ type: "SET_COLOR", key: "primary", value: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="text-sm text-neutral-400">{state.business.primary_color}</span>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Cor de destaque</label>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
            <input
              type="color"
              value={state.business.secondary_color}
              onChange={(e) => dispatch({ type: "SET_COLOR", key: "secondary", value: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="text-sm text-neutral-400">{state.business.secondary_color}</span>
          </div>
        </div>
      </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Fundo personalizado</label>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
            <input type="color" value={state.business.bg_color_override || "#111416"} onChange={(event) => dispatch({ type: "SET_BACKGROUND_COLOR", value: event.target.value })} className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent" />
            <span className="min-w-0 flex-1 text-sm text-neutral-400">{state.business.bg_color_override || "Automático do template"}</span>
            {state.business.bg_color_override && <button type="button" onClick={() => dispatch({ type: "SET_BACKGROUND_COLOR", value: "" })} className="text-[10px] text-neutral-500 underline">Restaurar</button>}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div><h4 className="text-sm font-semibold text-white">Combinação de fontes</h4><p className="mt-1 text-xs leading-5 text-neutral-500">Escolha um par curado. A prévia usa as fontes reais.</p></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {CATALOG_FONT_PAIRS.map((pair) => {
            const selected = getCatalogFontPair(state.business.font_pair_id).id === pair.id;
            return <button key={pair.id} type="button" onClick={() => dispatch({ type: "SET_FONT_PAIR", value: pair.id })} className={`rounded-xl border p-3 text-left transition ${selected ? "border-white bg-white/[0.08]" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"}`}>
              <span className="block text-lg leading-tight text-white" style={{ fontFamily: `var(${pair.headingFont.variable})`, fontWeight: 700 }}>{pair.nome}</span>
              <span className="mt-1 block text-xs leading-5 text-neutral-400" style={{ fontFamily: `var(${pair.bodyFont.variable})` }}>{pair.descricao}</span>
              <span className="mt-2 block text-[9px] uppercase tracking-wide text-neutral-600">{pair.headingFont.name} + {pair.bodyFont.name}</span>
            </button>;
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div><h4 className="text-sm font-semibold text-white">Animação das seções</h4><p className="mt-1 text-xs leading-5 text-neutral-500">Um único comportamento para todo o catálogo.</p></div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: "none", label: "Sem animação", offset: 0 },
            { value: "soft", label: "Suave", offset: 4 },
            { value: "dynamic", label: "Dinâmica", offset: 9 },
          ] as const).map((option) => <button key={option.value} type="button" onClick={() => dispatch({ type: "SET_ANIMATION_PRESET", value: option.value })} className={`rounded-xl border p-2 text-center transition ${state.business.animation_preset === option.value ? "border-white bg-white/[0.08]" : "border-neutral-800 bg-neutral-950"}`}>
            <span className="flex h-12 items-center justify-center overflow-hidden rounded-lg bg-neutral-900"><span className="grid w-4/5 gap-1 transition" style={{ transform: `translateY(${option.offset}px)`, opacity: option.value === "none" ? 1 : 0.72 }}><i className="h-2 rounded bg-white/70" /><i className="h-1.5 w-3/4 rounded bg-white/25" /></span></span>
            <span className="mt-2 block text-[10px] font-semibold text-neutral-300">{option.label}</span>
          </button>)}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Estilo dos botões</label>
        <div className="grid grid-cols-4 gap-2">
          {([
            { label: "Quadrado", value: 0 },
            { label: "Suave", value: 8 },
            { label: "Arredondado", value: 16 },
            { label: "Pill", value: 999 },
          ] as const).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => dispatch({ type: "SET_BUTTON_RADIUS", value: option.value })}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-center ${
                state.business.button_radius === option.value ? "border-white bg-neutral-900" : "border-neutral-800 bg-neutral-900/50"
              }`}
            >
              <span
                className="h-4 w-full bg-white/80"
                style={{ borderRadius: `${Math.min(option.value, 16)}px` }}
              />
              <span className="text-[10px] font-medium text-neutral-400">{option.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function UploadField({
  label,
  previewUrl,
  uploading,
  onFile,
  highlighted,
}: {
  label: string;
  previewUrl: string;
  uploading: boolean;
  onFile: (file: File) => void;
  highlighted?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</label>
      <label
        className={`flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed text-center ${
          highlighted ? "border-white bg-neutral-900" : "border-neutral-700 bg-neutral-900"
        }`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-xs text-neutral-500">{uploading ? "Enviando..." : "Toque para enviar"}</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
    </div>
  );
}
