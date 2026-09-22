"use client";

import { useState } from "react";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import type { Business } from "@/lib/domain/business";
import { CATALOG_TEMPLATES, TEMPLATE_IDS, type TemplateId } from "@/lib/domain/catalog-templates";

function defaultTemplateId(business: Business): TemplateId {
  const current = business.template_id as TemplateId;
  return TEMPLATE_IDS.includes(current) ? current : "classico_dark";
}

export default function VisualForm({
  business,
  action,
  submitLabel = "Continuar",
}: {
  business: Business;
  action: (formData: FormData) => void;
  submitLabel?: string;
}) {
  const [templateId, setTemplateId] = useState<TemplateId>(defaultTemplateId(business));
  const [primaryColor, setPrimaryColor] = useState(business.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(business.secondary_color);
  const [logoUrl, setLogoUrl] = useState(business.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState(business.cover_url ?? "");
  const [uploading, setUploading] = useState<"logo" | "capa" | null>(null);

  async function handleUpload(pasta: "logo" | "capa", file: File) {
    setUploading(pasta);
    try {
      const url = await uploadBusinessMedia(business.id, pasta, file);
      if (pasta === "logo") setLogoUrl(url);
      else setCoverUrl(url);
    } finally {
      setUploading(null);
    }
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="catalog_template_id" value={templateId} />
      <input type="hidden" name="primary_color" value={primaryColor} />
      <input type="hidden" name="secondary_color" value={secondaryColor} />
      <input type="hidden" name="logo_url" value={logoUrl} />
      <input type="hidden" name="cover_url" value={coverUrl} />

      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-300">Template</span>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATE_IDS.map((id) => {
            const t = CATALOG_TEMPLATES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTemplateId(id);
                  setPrimaryColor(t.palette.primaryColorDefault);
                  setSecondaryColor(t.palette.secondaryColorDefault);
                }}
                className={`rounded-lg border p-3 text-left transition ${
                  templateId === id ? "border-white bg-neutral-900" : "border-neutral-800 bg-neutral-950"
                }`}
              >
                <div
                  className="mb-2 h-10 w-full rounded"
                  style={{ backgroundColor: t.palette.bg, border: "1px solid rgba(255,255,255,0.1)" }}
                />
                <p className="text-xs font-semibold text-white">{t.nome}</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">{t.descricao}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Cor principal</label>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="text-sm text-neutral-400">{primaryColor}</span>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Cor de destaque</label>
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="text-sm text-neutral-400">{secondaryColor}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <UploadField
          label="Logo"
          previewUrl={logoUrl}
          uploading={uploading === "logo"}
          onFile={(f) => handleUpload("logo", f)}
        />
        <UploadField
          label="Foto principal"
          previewUrl={coverUrl}
          uploading={uploading === "capa"}
          onFile={(f) => handleUpload("capa", f)}
        />
      </div>

      <button
        type="submit"
        disabled={uploading !== null}
        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
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
          <span className="px-2 text-xs text-neutral-500">
            {uploading ? "Enviando..." : "Toque para enviar"}
          </span>
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
