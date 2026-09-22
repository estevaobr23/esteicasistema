"use client";

import { useState } from "react";
import { upsertPacote } from "@/app/app/(dashboard)/pacotes/actions";
import { uploadBusinessMedia } from "@/lib/storage/upload";

type ServiceOption = { id: string; name: string };

type PacoteInitial = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  promotional_price: number | null;
  package_services?: { service_id: string }[];
};

export default function PacoteForm({
  businessId,
  servicos,
  initial,
}: {
  businessId: string;
  servicos: ServiceOption[];
  initial?: PacoteInitial;
}) {
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const selecionados = new Set(initial?.package_services?.map((s) => s.service_id) ?? []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      setImageUrl(await uploadBusinessMedia(businessId, "pacotes", file));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={upsertPacote} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Imagem</label>
        <label className="flex aspect-video max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-500">{uploading ? "Enviando..." : "Toque para enviar"}</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
        </label>
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

      <div>
        <span className="mb-2 block text-sm font-medium text-neutral-300">Serviços incluídos</span>
        <div className="space-y-2">
          {servicos.map((s) => (
            <label key={s.id} className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
              <input
                type="checkbox"
                name="service_id"
                value={s.id}
                defaultChecked={selecionados.has(s.id)}
                className="h-4 w-4 accent-white"
              />
              <span className="text-sm text-white">{s.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" disabled={uploading} className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50">
        Salvar
      </button>
    </form>
  );
}
