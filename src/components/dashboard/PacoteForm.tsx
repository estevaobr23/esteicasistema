"use client";

import { useState } from "react";
import { upsertPacote } from "@/app/app/(dashboard)/pacotes/actions";
import { uploadBusinessMedia } from "@/lib/storage/upload";
import AdaptiveSquareImage from "@/components/AdaptiveSquareImage";
import { inspectImageShape } from "@/lib/image-shape";

type ServiceOption = { id: string; name: string };

type PacoteInitial = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  promotional_price: number | null;
  package_services?: { service_id: string }[];
  package_benefits?: { id: string; label: string; icon_key: string; color_key: string; sort_order: number }[];
  media_mode: string;
  gallery: unknown;
  video_url: string | null;
  video_poster_url: string | null;
  duration_minutes: number | null;
  featured: boolean;
  cta_label: string | null;
};

type Benefit = { label: string; icon_key: "check"; color_key: "emerald" };

export default function PacoteForm({
  businessId,
  servicos,
  initial,
}: {
  businessId: string;
  servicos: ServiceOption[];
  initial?: PacoteInitial;
}) {
  const initialSelectedServiceIds = initial?.package_services?.map((service) => service.service_id) ?? [];
  const selectedServiceNames = new Set(
    servicos
      .filter((service) => initialSelectedServiceIds.includes(service.id))
      .map((service) => service.name.trim().toLocaleLowerCase("pt-BR"))
  );
  const [mediaMode, setMediaMode] = useState(initial?.media_mode ?? "single_photo");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [posterUrl, setPosterUrl] = useState(initial?.video_poster_url ?? "");
  const [gallery, setGallery] = useState<string[]>(Array.isArray(initial?.gallery) ? initial.gallery as string[] : []);
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? "");
  const [benefits, setBenefits] = useState<Benefit[]>(
    initial?.package_benefits
      ? [...initial.package_benefits]
          .sort((a, b) => a.sort_order - b.sort_order)
          .filter(({ label }) => !selectedServiceNames.has(label.trim().toLocaleLowerCase("pt-BR")))
          .slice(0, 3)
          .map(({ label }) => ({ label, icon_key: "check", color_key: "emerald" }))
      : []
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialSelectedServiceIds
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState("");

  async function handleUpload(target: "image" | "poster" | "gallery", file: File) {
    setUploading(target);
    try {
      const imageInfo = await inspectImageShape(file);
      setImageWarning(
        imageInfo.shape === "landscape"
          ? `A imagem ${imageInfo.width}×${imageInfo.height} é horizontal. Ela será exibida inteira, mas imagens quadradas ou verticais ocupam melhor o card 1:1.`
          : ""
      );
      const url = await uploadBusinessMedia(businessId, target === "gallery" ? "galeria" : "pacotes", file);
      if (target === "image") setImageUrl(url);
      if (target === "poster") setPosterUrl(url);
      if (target === "gallery") setGallery((current) => [...current, url]);
    } finally {
      setUploading(null);
    }
  }

  return (
    <form action={upsertPacote} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />
      <input type="hidden" name="video_poster_url" value={posterUrl} />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
      <input type="hidden" name="video_url" value={videoUrl} />
      <input type="hidden" name="benefits" value={JSON.stringify(benefits)} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Nome do pacote</label>
        <input
          name="name"
          defaultValue={initial?.name}
          required
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Descrição</label>
        <textarea
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <h2 className="text-sm font-semibold text-white">Apresentação do pacote</h2>
        <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2.5 text-xs leading-5 text-sky-200">
          Formato recomendado: <strong>quadrado 1:1</strong>. Fotos verticais também funcionam bem. Evite imagens horizontais para aproveitar melhor a área promocional.
        </div>
        {imageWarning && <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200">{imageWarning}</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-neutral-500">Apresentação padrão</label>
            <select name="media_mode" value={mediaMode} onChange={(event) => setMediaMode(event.target.value)} className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white">
              <option value="single_photo">Foto principal</option><option value="gallery">Galeria</option><option value="youtube">Vídeo</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-neutral-500">Duração estimada</label>
            <input type="number" min={0} name="duration_minutes" defaultValue={initial?.duration_minutes ?? ""} placeholder="Minutos" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white" />
          </div>
        </div>
        {mediaMode === "single_photo" && <div className="mt-4 max-w-xs">
          <UploadBox label="Imagem principal" url={imageUrl} loading={uploading === "image"} onFile={(file) => handleUpload("image", file)} />
        </div>}
        {mediaMode === "youtube" && <div className="mt-4 grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
          <UploadBox label="Capa do vídeo" url={posterUrl} loading={uploading === "poster"} onFile={(file) => handleUpload("poster", file)} />
          <div>
            <label className="mb-1.5 block text-xs text-neutral-500">Vídeo explicativo</label>
            <input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Link do YouTube" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600" />
            <p className="mt-1.5 text-xs leading-5 text-neutral-500">Cole o link público do vídeo e adicione uma capa quadrada para o card.</p>
          </div>
        </div>}
        {mediaMode === "gallery" && <div className="mt-4">
          <label className="inline-flex cursor-pointer rounded-md border border-neutral-700 px-3 py-2 text-xs text-white">{uploading === "gallery" ? "Enviando..." : "+ Foto para galeria"}<input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && handleUpload("gallery", event.target.files[0])} /></label>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{gallery.map((url) => <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => setGallery((current) => current.filter((item) => item !== url))} className="absolute right-0 top-0 h-5 w-5 bg-black/70 text-xs">×</button>
          </div>)}</div>
          {!gallery.length && <p className="mt-3 text-xs text-neutral-600">Nenhuma foto adicionada à galeria.</p>}
        </div>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Preço</label>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={initial?.price}
            required
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Preço promocional</label>
          <input
            type="number"
            name="promotional_price"
            min={0}
            step="0.01"
            defaultValue={initial?.promotional_price ?? ""}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">O que está incluído no pacote</h2>
          <p className="mt-1 text-xs leading-5 text-neutral-500">Marque os serviços abaixo. Eles aparecem automaticamente no catálogo com um check verde.</p>
        </div>
        <div className="mt-4 space-y-2">
          {servicos.map((s) => (
            <label key={s.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${selectedServiceIds.includes(s.id) ? "border-emerald-500/50 bg-emerald-500/10" : "border-neutral-800 bg-neutral-900"}`}>
              <input
                type="checkbox"
                name="service_id"
                value={s.id}
                checked={selectedServiceIds.includes(s.id)}
                onChange={(event) => setSelectedServiceIds((current) => event.target.checked ? [...current, s.id] : current.filter((id) => id !== s.id))}
                className="h-4 w-4 accent-emerald-500"
              />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">✓</span>
              <span className="min-w-0 text-sm text-white">{s.name}</span>
            </label>
          ))}
          {!servicos.length && <p className="rounded-xl border border-dashed border-neutral-800 px-3 py-4 text-center text-xs leading-5 text-neutral-500">Cadastre serviços primeiro para poder incluí-los neste pacote.</p>}
        </div>

        <div className="my-5 h-px bg-neutral-800" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-white">Itens extras <span className="font-normal text-neutral-500">(opcional)</span></h3>
            <p className="mt-1 text-xs leading-5 text-neutral-500">Adicione até 3 vantagens que não são serviços cadastrados.</p>
          </div>
          <button type="button" disabled={benefits.length >= 3} onClick={() => setBenefits((current) => [...current, { label: "", icon_key: "check", color_key: "emerald" }])} className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40">+ Item extra</button>
        </div>
        <div className="mt-4 space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">✓</span>
              <input aria-label={`Item extra ${index + 1}`} value={benefit.label} onChange={(event) => setBenefits((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="Ex: Prioridade no agendamento" className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600" />
              <button type="button" aria-label={`Remover item extra ${index + 1}`} onClick={() => setBenefits((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-800 text-red-400">×</button>
            </div>
          ))}
          {!benefits.length && <p className="text-xs text-neutral-600">Nenhum item extra. Os serviços marcados já são suficientes.</p>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" name="featured" defaultChecked={initial?.featured} className="h-4 w-4 accent-white" />Destacar pacote</label>
        <input name="cta_label" defaultValue={initial?.cta_label ?? ""} placeholder="Texto do botão" className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white" />
      </div>

      <button type="submit" disabled={uploading !== null} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50">
        Salvar
      </button>
    </form>
  );
}

function UploadBox({ label, url, loading, onFile }: { label: string; url: string; loading: boolean; onFile: (file: File) => void }) {
  return <div><p className="mb-1.5 text-xs text-neutral-500">{label}</p><label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">{url ? <>
    <AdaptiveSquareImage src={url} alt={label} className="h-full w-full rounded-none" />
  </> : <span className="text-xs text-neutral-600">{loading ? "Enviando..." : "Enviar"}</span>}<input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} /></label></div>;
}
