"use client";

import { createContext, useContext, useState } from "react";

export type VehicleType = "hatch" | "sedan" | "suv" | "pickup";

const VEHICLE_LABELS: Record<VehicleType, string> = {
  hatch: "Hatch",
  sedan: "Sedan",
  suv: "SUV",
  pickup: "Picape",
};

const VehicleContext = createContext<{
  vehicle: VehicleType;
  setVehicle: (v: VehicleType) => void;
}>({ vehicle: "hatch", setVehicle: () => {} });

export function useVehicle() {
  return useContext(VehicleContext);
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicle, setVehicle] = useState<VehicleType>("hatch");
  return <VehicleContext.Provider value={{ vehicle, setVehicle }}>{children}</VehicleContext.Provider>;
}

export function VehicleSelector() {
  const { vehicle, setVehicle } = useVehicle();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((v) => (
        <button
          key={v}
          onClick={() => setVehicle(v)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            vehicle === v
              ? "border-[var(--catalog-primary)] bg-[var(--catalog-primary)] text-white"
              : "border-white/15 text-white/70 hover:border-white/30"
          }`}
        >
          {VEHICLE_LABELS[v]}
        </button>
      ))}
    </div>
  );
}

export { VEHICLE_LABELS };
