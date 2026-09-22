"use client";

import { useState } from "react";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

const TEMPLATES = [
  { id: "premium_dark", nome: "Premium Dark", desc: "Preto, grafite, elegante.", swatch: "#0a0a0a" },
  { id: "clean_detail", nome: "Clean Detail", desc: "Claro, clean, premium.", swatch: "#f5f5f4" },
  { id: "performance", nome: "Performance", desc: "Esportivo, mais agressivo.", swatch: "#dc2626" },
] as const;

export default function TemplatePanel() {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [uploading, setUploading] = useState<"logo" | "capa" | null>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-300">Template</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => dispatch({ type: "SET_THEME", theme: t.id })}
              className={`rounded-lg border p-3 text-left transition ${
                state.business.theme === t.id ? "border-white bg-neutral-900" : "border-neutral-800 bg-neutral-950"
              }`}
            >
              <div
                className="mb-2 h-10 w-full rounded"
                style={{ backgroundColor: t.swatch, border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <p className="text-xs font-semibold text-white">{t.nome}</p>
              <p className="mt-0.5 text-[11px] text-neutral-500">{t.desc}</p>
            </button>
          ))}
        </div>
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

      <div className="grid grid-cols-2 gap-4">
        <UploadField
          label="Logo"
          previewUrl={state.business.logo_url}
          uploading={uploading === "logo"}
          onFile={(f) => handleUpload("logo", f)}
        />
        <UploadField
          label="Foto principal"
          previewUrl={state.business.cover_url}
          uploading={uploading === "capa"}
          onFile={(f) => handleUpload("capa", f)}
        />
      </div>
    </div>
  );
}

function UploadField({
  label,
  previewUrl,
  uploading,
  onFile,
}: {
  label: string;
  previewUrl: string;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</label>
      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-center">
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
