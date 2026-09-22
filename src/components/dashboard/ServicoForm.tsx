"use client";

import { useState } from "react";
import { upsertServico } from "@/app/app/(dashboard)/servicos/actions";
import { uploadBusinessMedia } from "@/lib/storage/upload";

type ServicePriceRow = { vehicle_type: string; price: number };

type ServiceInitial = {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  price_type: string;
  base_price: number | null;
  featured: boolean;
  service_prices?: ServicePriceRow[];
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
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);

  function precoVeiculo(vt: string) {
    return initial?.service_prices?.find((p) => p.vehicle_type === vt)?.price ?? "";
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadBusinessMedia(businessId, "servicos", file);
      setImageUrl(url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={upsertServico} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Nome</label>
        <input
          name="name"
          defaultValue={initial?.name}
          required
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
        />
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-300">Foto</label>
        <label className="flex aspect-video max-w-xs cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-500">{uploading ? "Enviando..." : "Toque para enviar"}</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </label>
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

      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 disabled:opacity-50"
      >
        Salvar
      </button>
    </form>
  );
}
