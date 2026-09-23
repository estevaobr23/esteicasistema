"use client";

import { useState } from "react";
import { upsertServico } from "@/app/app/(dashboard)/servicos/actions";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import AdaptiveSquareImage from "@/components/AdaptiveSquareImage";
import { inspectImageShape } from "@/lib/image-shape";

type ServicePriceRow = { vehicle_type: string; price: number };

type ServiceInitial = {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  before_image: string | null;
  after_image: string | null;
  gallery: unknown;
  video_url: string | null;
  media_mode: string;
  category: string | null;
  duration_minutes: number | null;
  cta_label: string | null;
  price_type: string;
  base_price: number | null;
  featured: boolean;
  service_prices?: ServicePriceRow[];
  service_features?: { label: string; sort_order: number }[];
};

const VEHICLES = [
  { key: "hatch", label: "Hatch" },
  { key: "sedan", label: "Sedan" },
  { key: "suv", label: "SUV" },
  { key: "pickup", label: "Picape" },
] as const;

export default function ServicoForm({
  businessId,
  initial,
}: {
  businessId: string;
  initial?: ServiceInitial;
}) {
  const [priceType, setPriceType] = useState(initial?.price_type ?? "quote");
  const [mediaMode, setMediaMode] = useState(initial?.media_mode ?? "single_photo");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [beforeImage, setBeforeImage] = useState(initial?.before_image ?? "");
  const [afterImage, setAfterImage] = useState(initial?.after_image ?? "");
  const [gallery, setGallery] = useState<string[]>(Array.isArray(initial?.gallery) ? initial.gallery as string[] : []);
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? "");
  const [uploading, setUploading] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState("");

  function precoVeiculo(vt: string) {
    return initial?.service_prices?.find((p) => p.vehicle_type === vt)?.price ?? "";
  }

  async function handleUpload(target: "image" | "before" | "after" | "gallery", file: File) {
    setUploading(target);
    try {
      const imageInfo = await inspectImageShape(file);
      setImageWarning(
        imageInfo.shape === "landscape"
          ? `A imagem ${imageInfo.width}×${imageInfo.height} é horizontal. Ela será exibida inteira, mas imagens quadradas ou verticais ocupam melhor o card 1:1.`
          : ""
      );
      const url = await uploadBusinessMedia(businessId, target === "gallery" ? "galeria" : "servicos", file);
      if (target === "image") setImageUrl(url);
      if (target === "before") setBeforeImage(url);
      if (target === "after") setAfterImage(url);
      if (target === "gallery") setGallery((current) => [...current, url]);
    } finally {
      setUploading(null);
    }
  }

  return (
    <form action={upsertServico} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="before_image" value={beforeImage} />
      <input type="hidden" name="after_image" value={afterImage} />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
      <input type="hidden" name="video_url" value={videoUrl} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Nome</label>
        <input
          name="name"
          defaultValue={initial?.name}
          required
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Categoria</label>
          <input name="category" defaultValue={initial?.category ?? ""} placeholder="Ex: Proteção" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Duração estimada</label>
          <input type="number" min={0} name="duration_minutes" defaultValue={initial?.duration_minutes ?? ""} placeholder="Minutos" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Descrição curta</label>
        <input
          name="short_description"
          defaultValue={initial?.short_description ?? ""}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Descrição completa</label>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-white">Fotos e vídeo</h2>
        <p className="mt-1 text-xs text-neutral-500">Escolha como este serviço deve aparecer por padrão. Você pode trocar o formato sem perder o que já preencheu.</p>
        <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2.5 text-xs leading-5 text-sky-200">
          Formato recomendado: <strong>quadrado 1:1</strong>. Fotos verticais também funcionam bem. Evite imagens horizontais para aproveitar melhor a área do card.
        </div>
        {imageWarning && <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200">{imageWarning}</p>}

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Apresentação padrão</label>
          <select name="media_mode" value={mediaMode} onChange={(event) => setMediaMode(event.target.value)} className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white">
            <option value="single_photo">Foto única</option>
            <option value="before_after">Antes e depois</option>
            <option value="gallery">Galeria</option>
            <option value="youtube">Vídeo do YouTube</option>
          </select>
        </div>

        {mediaMode === "single_photo" && (
          <div className="mt-4 max-w-xs">
            <MediaField label="Foto principal" url={imageUrl} loading={uploading === "image"} onFile={(file) => handleUpload("image", file)} />
          </div>
        )}

        {mediaMode === "before_after" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MediaField label="Antes" url={beforeImage} loading={uploading === "before"} onFile={(file) => handleUpload("before", file)} />
            <MediaField label="Depois" url={afterImage} loading={uploading === "after"} onFile={(file) => handleUpload("after", file)} />
          </div>
        )}

        {mediaMode === "youtube" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">Vídeo demonstrativo</label>
            <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" />
            <p className="mt-1.5 text-xs text-neutral-500">Cole o link público do vídeo no YouTube.</p>
          </div>
        )}

        {mediaMode === "gallery" && <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-neutral-300">Galeria</label>
            <label className="cursor-pointer rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-white">
              {uploading === "gallery" ? "Enviando..." : "+ Adicionar foto"}
              <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleUpload("gallery", event.target.files[0])} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {gallery.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setGallery((current) => current.filter((item) => item !== url))} className="absolute right-0 top-0 h-6 w-6 bg-black/75 text-xs text-white">×</button>
              </div>
            ))}
            {!gallery.length && <p className="text-xs text-neutral-600">Nenhuma foto adicional.</p>}
          </div>
        </div>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Benefícios incluídos</label>
        <textarea name="features" rows={5} defaultValue={initial?.service_features?.sort((a, b) => a.sort_order - b.sort_order).map((feature) => feature.label).join("\n") ?? ""} placeholder={"Um benefício por linha\nEx: Proteção UV"} className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-300">Preço</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { key: "fixed", label: "Fixo" },
              { key: "from", label: "A partir de" },
              { key: "vehicle", label: "Por veículo" },
              { key: "quote", label: "Sob consulta" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.key}
              className={`cursor-pointer rounded-md border px-2 py-2 text-center text-xs font-medium ${
                priceType === opt.key ? "border-white bg-neutral-800 text-white" : "border-neutral-800 text-neutral-500"
              }`}
            >
              <input
                type="radio"
                name="price_type"
                value={opt.key}
                checked={priceType === opt.key}
                onChange={() => setPriceType(opt.key)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {(priceType === "fixed" || priceType === "from") && (
        <input
          type="number"
          name="base_price"
          min={0}
          step="0.01"
          defaultValue={initial?.base_price ?? ""}
          placeholder="R$ 0,00"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      )}

      {priceType === "vehicle" && (
        <div className="grid grid-cols-2 gap-3">
          {VEHICLES.map((v) => (
            <div key={v.key}>
              <label className="mb-1 block text-xs text-neutral-500">{v.label}</label>
              <input
                type="number"
                name={`price__${v.key}`}
                min={0}
                step="0.01"
                defaultValue={precoVeiculo(v.key)}
                placeholder="R$ 0,00"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="h-4 w-4 accent-white" />
        Destacar como &ldquo;mais procurado&rdquo;
      </label>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Texto do botão</label>
        <input name="cta_label" defaultValue={initial?.cta_label ?? ""} placeholder="Solicitar orçamento" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600" />
      </div>

      <button
        type="submit"
        disabled={uploading !== null}
        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  );
}

function MediaField({ label, url, loading, onFile }: { label: string; url: string; loading: boolean; onFile: (file: File) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-neutral-500">{label}</p>
      <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">
        {url ? (
          <AdaptiveSquareImage src={url} alt={label} className="h-full w-full rounded-none" />
        ) : <span className="px-2 text-center text-[11px] text-neutral-600">{loading ? "Enviando..." : "Enviar"}</span>}
        <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
      </label>
    </div>
  );
}
