import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";

const EVENT_LABELS: Record<string, string> = {
  page_view: "Visualizações do catálogo",
  service_view: "Cliques em serviços",
  package_view: "Cliques em pacotes",
  whatsapp_click: "Cliques no WhatsApp",
  schedule_click: "Cliques em horários",
  portfolio_view: "Visualizações do portfólio",
};

export default async function AnalyticsPage() {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  if (!limites.permiteAnalytics) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-2 text-xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-neutral-400">
          Analytics está disponível no plano Profissional. Faça upgrade para acompanhar seus visitantes.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, service_id")
    .eq("business_id", business.id)
    .gte("created_at", desde.toISOString());

  const rows = events ?? [];
  const porTipo = rows.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1;
    return acc;
  }, {});

  const porServico = rows
    .filter((e) => e.service_id && e.event_type === "service_view")
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.service_id!] = (acc[e.service_id!] ?? 0) + 1;
      return acc;
    }, {});

  const serviceIds = Object.keys(porServico);
  const { data: services } = serviceIds.length
    ? await supabase.from("services").select("id, name").in("id", serviceIds)
    : { data: [] };

  const servicoMaisAcessado = Object.entries(porServico).sort((a, b) => b[1] - a[1])[0];
  const nomeServicoMaisAcessado = services?.find((s) => s.id === servicoMaisAcessado?.[0])?.name;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="mb-1 text-xl font-semibold text-white">Analytics</h1>
      <p className="mb-6 text-sm text-neutral-500">Últimos 30 dias</p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(EVENT_LABELS).map(([key, label]) => (
          <div key={key} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-2xl font-bold text-white">{porTipo[key] ?? 0}</p>
            <p className="mt-1 text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {nomeServicoMaisAcessado && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">Serviço mais acessado</p>
          <p className="mt-1 text-lg font-semibold text-white">{nomeServicoMaisAcessado}</p>
        </div>
      )}
    </main>
  );
}
