import { createClient } from "@/lib/supabase/server";
import { saveServicos } from "@/app/app/onboarding/steps-actions";
import { limitesDoPlano } from "@/lib/domain/plans";
import type { Business } from "@/lib/domain/business";

export default async function StepServicos({ business }: { business: Business }) {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("service_templates")
    .select("*")
    .order("sort_order");
  const { data: currentServices } = await supabase
    .from("services")
    .select("name,active")
    .eq("business_id", business.id);
  const activeNames = new Set((currentServices ?? []).filter((service) => service.active).map((service) => service.name));

  const limite = limitesDoPlano(business.plano as "essencial" | "profissional").maxServicosAtivos;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Seus serviços</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Marque os serviços que você oferece.
        {limite !== null && (
          <> Seu plano Essencial permite até <strong className="text-white">{limite}</strong>.</>
        )}
      </p>

      <form action={saveServicos} className="mt-8 space-y-6">
        <fieldset className="space-y-2">
          {(templates ?? []).map((t) => (
            <label
              key={t.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 has-[:checked]:border-white"
            >
              <input
                type="checkbox"
                name="template_id"
                value={t.id}
                defaultChecked={activeNames.has(t.name)}
                className="mt-1 h-4 w-4 accent-white"
              />
              <span>
                <span className="block text-sm font-medium text-white">{t.name}</span>
                <span className="block text-xs text-neutral-500">{t.short_description}</span>
              </span>
            </label>
          ))}
        </fieldset>

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
