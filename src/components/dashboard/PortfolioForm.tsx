"use client";

import { useState } from "react";
import { criarItemPortfolio } from "@/app/app/(dashboard)/portfolio/actions";
import { uploadBusinessMedia } from "@/lib/storage/upload";

export default function PortfolioForm({ businessId }: { businessId: string }) {
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [uploading, setUploading] = useState<"before" | "after" | null>(null);

  async function handleUpload(which: "before" | "after", file: File) {
    setUploading(which);
    try {
      const url = await uploadBusinessMedia(businessId, "portfolio", file);
      if (which === "before") setBeforeImage(url);
      else setAfterImage(url);
    } finally {
      setUploading(null);
    }
  }

  return (
    <form action={criarItemPortfolio} className="space-y-5">
      <input type="hidden" name="before_image" value={beforeImage} />
      <input type="hidden" name="after_image" value={afterImage} />

      <div className="grid grid-cols-2 gap-3">
        <ImageField label="Antes" url={beforeImage} uploading={uploading === "before"} onFile={(f) => handleUpload("before", f)} />
        <ImageField label="Depois" url={afterImage} uploading={uploading === "after"} onFile={(f) => handleUpload("after", f)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Título</label>
        <input name="title" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Veículo</label>
          <input name="vehicle" placeholder="Ex: Civic 2022" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Categoria</label>
          <input name="category" placeholder="Ex: Polimento" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Descrição</label>
        <textarea name="description" rows={2} className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
      </div>

      <button type="submit" disabled={uploading !== null} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50">
        Salvar
      </button>
    </form>
  );
}

function ImageField({
  label,
  url,
  uploading,
  onFile,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</label>
      <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-xs text-neutral-500">{uploading ? "Enviando..." : "Toque para enviar"}</span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
    </div>
  );
}
