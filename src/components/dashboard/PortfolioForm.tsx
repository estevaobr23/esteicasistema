"use client";

import { useState } from "react";
import { criarItemPortfolio } from "@/app/app/(dashboard)/portfolio/actions";
import { uploadBusinessMedia } from "@/lib/storage/upload";

type MediaType = "before_after" | "single_photo" | "gallery" | "youtube" | "instagram";

export default function PortfolioForm({ businessId, services }: { businessId: string; services: { id: string; name: string }[] }) {
  const [mediaType, setMediaType] = useState<MediaType>("before_after");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  async function upload(target: "before" | "after" | "image" | "gallery", file: File) {
    setUploading(target);
    try {
      const url = await uploadBusinessMedia(businessId, target === "gallery" ? "galeria" : "portfolio", file);
      if (target === "before") setBeforeImage(url);
      if (target === "after") setAfterImage(url);
      if (target === "image") setImageUrl(url);
      if (target === "gallery") setGallery((current) => [...current, url]);
    } finally { setUploading(null); }
  }

  return (
    <form action={criarItemPortfolio} className="space-y-5">
      <input type="hidden" name="before_image" value={beforeImage} />
      <input type="hidden" name="after_image" value={afterImage} />
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
      <input type="hidden" name="media_type" value={mediaType} />

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-300">Tipo de resultado</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {([{ key: "before_after", label: "Antes/depois" }, { key: "single_photo", label: "Foto" }, { key: "gallery", label: "Galeria" }, { key: "youtube", label: "Vídeo" }, { key: "instagram", label: "Instagram" }] as const).map((option) => <button key={option.key} type="button" onClick={() => setMediaType(option.key)} className={`rounded-lg border px-2 py-2 text-xs ${mediaType === option.key ? "border-white bg-neutral-800 text-white" : "border-neutral-800 text-neutral-500"}`}>{option.label}</button>)}
        </div>
      </div>

      {mediaType === "before_after" && <div className="grid grid-cols-2 gap-3"><ImageField label="Antes" url={beforeImage} loading={uploading === "before"} onFile={(file) => upload("before", file)} /><ImageField label="Depois" url={afterImage} loading={uploading === "after"} onFile={(file) => upload("after", file)} /></div>}
      {mediaType === "single_photo" && <ImageField label="Foto do resultado" url={imageUrl} loading={uploading === "image"} onFile={(file) => upload("image", file)} />}
      {mediaType === "gallery" && <div><label className="inline-flex cursor-pointer rounded-lg border border-dashed border-neutral-700 px-3 py-2 text-xs text-neutral-300">{uploading === "gallery" ? "Enviando..." : "+ Adicionar foto"}<input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && upload("gallery", event.target.files[0])} /></label><div className="mt-3 flex flex-wrap gap-2">{gallery.map((url) => <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="h-full w-full object-cover" />
        <button type="button" onClick={() => setGallery((current) => current.filter((item) => item !== url))} className="absolute right-0 top-0 h-6 w-6 bg-black/75 text-white">×</button>
      </div>)}</div></div>}
      {mediaType === "youtube" && <input name="video_url" placeholder="Link do vídeo no YouTube" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" />}
      {mediaType === "instagram" && <div><input name="instagram_url" placeholder="Link de um post ou Reel público" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" /><p className="mt-2 text-xs text-neutral-600">Use o endereço completo de uma publicação pública.</p></div>}

      <input name="title" placeholder="Título do projeto" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" />
      <select name="service_id" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white"><option value="">Relacionar a um serviço</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
      <div className="grid grid-cols-2 gap-3">
        <input name="vehicle_make" placeholder="Marca: Honda" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-white placeholder:text-neutral-600" />
        <input name="vehicle_model" placeholder="Modelo: Civic" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-white placeholder:text-neutral-600" />
        <input type="number" name="vehicle_year" placeholder="Ano" min={1900} max={2100} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-white placeholder:text-neutral-600" />
        <input name="category" placeholder="Categoria" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-white placeholder:text-neutral-600" />
      </div>
      <textarea name="description" rows={3} placeholder="Conte o que foi feito neste veículo" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" />
      <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" name="featured" className="h-4 w-4 accent-white" />Destacar este projeto</label>
      <button type="submit" disabled={uploading !== null} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50">Salvar projeto</button>
    </form>
  );
}

function ImageField({ label, url, loading, onFile }: { label: string; url: string; loading: boolean; onFile: (file: File) => void }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</label><label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">{url ? <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={url} alt={label} className="h-full w-full object-cover" />
  </> : <span className="px-2 text-center text-xs text-neutral-500">{loading ? "Enviando..." : "Toque para enviar"}</span>}<input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} /></label></div>;
}
