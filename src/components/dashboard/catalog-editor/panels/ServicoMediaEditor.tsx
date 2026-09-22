"use client";

import { useState } from "react";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import type { MediaMode, ServiceDraft } from "../CatalogEditorContext";
import { useCatalogEditorDispatch, useCatalogEditorState } from "../CatalogEditorContext";

const MODES: { key: MediaMode; label: string; requiresGaleria?: boolean; requiresVideo?: boolean }[] = [
  { key: "single_photo", label: "Foto única" },
  { key: "before_after", label: "Antes/depois" },
  { key: "gallery", label: "Galeria", requiresGaleria: true },
  { key: "youtube", label: "Vídeo (YouTube)", requiresVideo: true },
];

export default function ServicoMediaEditor({
  service,
  permiteGaleriaFotos,
  permiteVideos,
  onClose,
}: {
  service: ServiceDraft;
  permiteGaleriaFotos: boolean;
  permiteVideos: boolean;
  onClose: () => void;
}) {
  const state = useCatalogEditorState();
  const dispatch = useCatalogEditorDispatch();
  const [uploading, setUploading] = useState<string | null>(null);

  async function handleUpload(
    field: "image_url" | "before_image" | "after_image",
    pasta: "servicos" | "galeria",
    file: File
  ) {
    setUploading(field);
    try {
      const url = await uploadBusinessMedia(state.businessId, pasta, file);
      dispatch({ type: "SET_SERVICE_MEDIA_FIELD", serviceId: service.id, field, value: url });
    } finally {
      setUploading(null);
    }
  }

  async function handleGalleryUpload(file: File) {
    setUploading("gallery");
    try {
      const url = await uploadBusinessMedia(state.businessId, "galeria", file);
      dispatch({ type: "SET_SERVICE_GALLERY", serviceId: service.id, urls: [...service.gallery, url] });
    } finally {
      setUploading(null);
    }
  }

  function removeGalleryImage(url: string) {
    dispatch({ type: "SET_SERVICE_GALLERY", serviceId: service.id, urls: service.gallery.filter((u) => u !== url) });
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{service.name}</h3>
        <button type="button" onClick={onClose} className="text-xs text-neutral-400 underline">
          Fechar
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MODES.map((m) => {
          const blocked = (m.requiresGaleria && !permiteGaleriaFotos) || (m.requiresVideo && !permiteVideos);
          return (
            <button
              key={m.key}
              type="button"
              disabled={blocked}
              onClick={() => dispatch({ type: "SET_SERVICE_MEDIA_MODE", serviceId: service.id, mode: m.key })}
              className={`rounded-md border px-2 py-2 text-center text-xs font-medium disabled:opacity-40 ${
                service.media_mode === m.key ? "border-white bg-neutral-900 text-white" : "border-neutral-800 text-neutral-500"
              }`}
            >
              {blocked ? `🔒 ${m.label}` : m.label}
            </button>
          );
        })}
      </div>

      {service.media_mode === "single_photo" && (
        <MediaUploadField
          label="Foto"
          previewUrl={service.image_url}
          uploading={uploading === "image_url"}
          onFile={(f) => handleUpload("image_url", "servicos", f)}
        />
      )}

      {service.media_mode === "before_after" && (
        <div className="grid grid-cols-2 gap-3">
          <MediaUploadField
            label="Antes"
            previewUrl={service.before_image}
            uploading={uploading === "before_image"}
            onFile={(f) => handleUpload("before_image", "servicos", f)}
          />
          <MediaUploadField
            label="Depois"
            previewUrl={service.after_image}
            uploading={uploading === "after_image"}
            onFile={(f) => handleUpload("after_image", "servicos", f)}
          />
        </div>
      )}

      {service.media_mode === "gallery" && permiteGaleriaFotos && (
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {service.gallery.map((url) => (
              <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(url)}
                  className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-black/70 text-[10px] text-white"
                  aria-label="Remover foto"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-[10px] text-neutral-500">
              {uploading === "gallery" ? "..." : "+ foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGalleryUpload(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {service.media_mode === "youtube" && permiteVideos && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Link do YouTube</label>
          <input
            value={service.video_url ?? ""}
            onChange={(e) =>
              dispatch({ type: "SET_SERVICE_MEDIA_FIELD", serviceId: service.id, field: "video_url", value: e.target.value })
            }
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

function MediaUploadField({
  label,
  previewUrl,
  uploading,
  onFile,
}: {
  label: string;
  previewUrl: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-500">{label}</label>
      <label className="flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900 text-center">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-[11px] text-neutral-500">{uploading ? "Enviando..." : "Toque para enviar"}</span>
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
