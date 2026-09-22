"use client";

import { useVehicle, VEHICLE_LABELS } from "./VehicleSelector";
import { formatBRL } from "@/lib/format";

type ServicePriceRow = {
  vehicle_type: string;
  price: number;
  promotional_price: number | null;
  active: boolean;
};

export function useServicePriceLabel(
  priceType: string,
  basePrice: number | null,
  prices: ServicePriceRow[]
): string {
  const { vehicle } = useVehicle();

  if (priceType === "vehicle") {
    const row = prices.find((p) => p.vehicle_type === vehicle && p.active);
    if (!row) return "Sob consulta";
    const valor = row.promotional_price ?? row.price;
    return formatBRL(valor);
  }

  if (priceType === "from" && basePrice) return `A partir de ${formatBRL(basePrice)}`;
  if (priceType === "fixed" && basePrice) return formatBRL(basePrice);
  return "Sob consulta";
}

export default function ServicePrice({
  priceType,
  basePrice,
  prices,
}: {
  priceType: string;
  basePrice: number | null;
  prices: ServicePriceRow[];
}) {
  const label = useServicePriceLabel(priceType, basePrice, prices);
  const { vehicle } = useVehicle();

  return (
    <div className="flex items-baseline justify-between">
      <span className="text-lg font-bold text-white">{label}</span>
      {priceType === "vehicle" && (
        <span className="text-xs text-white/50">{VEHICLE_LABELS[vehicle]}</span>
      )}
    </div>
  );
}
