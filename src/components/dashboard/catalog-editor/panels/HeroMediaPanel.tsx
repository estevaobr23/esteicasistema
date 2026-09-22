"use client";

import { useState } from "react";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

export default function HeroMediaPanel({ campoFoco }: { campoFoco?: "logo_url" | "cover_url" }) {
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
    <div className="space-y-4">
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
