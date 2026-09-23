import { createClient } from "@/lib/supabase/server";
import { savePrecos } from "@/app/app/onboarding/steps-actions";
import type { Business } from "@/lib/domain/business";
import PrecoServicoForm from "./PrecoServicoForm";

export default async function StepPrecos({ business }: { business: Business }) {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*,service_prices(vehicle_type,price,promotional_price)")
    .eq("business_id", business.id)
    .eq("active", true)
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Preços</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Defina como cada serviço será precificado. Você pode alterar depois.
      </p>

      <form action={savePrecos} className="mt-8 space-y-4">
        {(services ?? []).map((s) => (
          <PrecoServicoForm
            key={s.id}
            serviceId={s.id}
            serviceName={s.name}
            initialPriceType={s.price_type as "fixed" | "from" | "vehicle" | "quote"}
            initialBasePrice={s.base_price}
            vehiclePrices={s.service_prices}
          />
        ))}

        <button
          type="submit"
          className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}
