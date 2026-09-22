"use client";

import { useState } from "react";

const VEHICLES = [
  { key: "hatch", label: "Hatch" },
  { key: "sedan", label: "Sedan" },
  { key: "suv", label: "SUV" },
  { key: "pickup", label: "Picape" },
] as const;

type PriceType = "fixed" | "from" | "vehicle" | "quote";

export default function PrecoServicoForm({
  serviceId,
  serviceName,
}: {
  serviceId: string;
  serviceName: string;
}) {
  const [priceType, setPriceType] = useState<PriceType>("quote");

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <p className="mb-3 text-sm font-semibold text-white">{serviceName}</p>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            { key: "fixed", label: "Preço fixo" },
            { key: "from", label: "A partir de" },
            { key: "vehicle", label: "Por veículo" },
            { key: "quote", label: "Sob consulta" },
          ] as const
        ).map((opt) => (
          <label
            key={opt.key}
            className={`cursor-pointer rounded-md border px-2 py-2 text-center text-xs font-medium transition ${
              priceType === opt.key
                ? "border-white bg-neutral-800 text-white"
                : "border-neutral-800 text-neutral-500"
            }`}
          >
            <input
              type="radio"
              name={`price_type__${serviceId}`}
              value={opt.key}
              checked={priceType === opt.key}
              onChange={() => setPriceType(opt.key)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {(priceType === "fixed" || priceType === "from") && (
        <input
          type="number"
          name={`base_price__${serviceId}`}
          min={0}
          step="0.01"
          placeholder="R$ 0,00"
          className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
      )}

      {priceType === "vehicle" && (
        <div className="grid grid-cols-2 gap-2">
          {VEHICLES.map((v) => (
            <div key={v.key}>
              <label className="mb-1 block text-[11px] text-neutral-500">{v.label}</label>
              <input
                type="number"
                name={`price__${serviceId}__${v.key}`}
                min={0}
                step="0.01"
                placeholder="R$ 0,00"
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
