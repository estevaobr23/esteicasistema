import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";
import { DashboardPageHeader, MetricCard, SectionCard } from "@/components/dashboard/DashboardUI";

const EVENT_LABELS: Record<string, string> = {
  page_view: "Visualizações do catálogo",
  service_view: "Cliques em serviços",
  package_view: "Cliques em pacotes",
  whatsapp_click: "Cliques no WhatsApp",
  schedule_click: "Cliques em horários",
  portfolio_view: "Visualizações do portfólio",
};

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function variation(current: number, previous: number) {
  if (!previous) return current ? "Primeiros dados registrados" : "Sem dados no período";
  const value = Math.round(((current - previous) / previous) * 100);
  return `${value >= 0 ? "+" : ""}${value}% vs. período anterior`;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo = "30" } = await searchParams;
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  if (!limites.permiteAnalytics) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-2 text-xl font-semibold text-white">Analytics</h1>
        <p className="text-sm text-neutral-400">Analytics está disponível no plano Profissional. Faça upgrade para acompanhar seus visitantes.</p>
      </main>
    );
  }

  const days = [7, 30, 90].includes(Number(periodo)) ? Number(periodo) : 30;
  const currentStart = dateDaysAgo(days);
  const previousStart = dateDaysAgo(days * 2);
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type, service_id, created_at")
    .eq("business_id", business.id)
    .gte("created_at", previousStart.toISOString())
    .order("created_at");

  const rows = events ?? [];
  const currentRows = rows.filter((event) => new Date(event.created_at) >= currentStart);
  const previousRows = rows.filter((event) => new Date(event.created_at) < currentStart);
  const totals = currentRows.reduce<Record<string, number>>((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] ?? 0) + 1;
    return acc;
  }, {});
  const previousTotals = previousRows.reduce<Record<string, number>>((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] ?? 0) + 1;
    return acc;
  }, {});

  const views = totals.page_view ?? 0;
  const serviceClicks = totals.service_view ?? 0;
  const whatsappClicks = totals.whatsapp_click ?? 0;
  const conversion = views ? Math.round((whatsappClicks / views) * 100) : 0;
  const serviceTotals = currentRows
    .filter((event) => event.event_type === "service_view" && event.service_id)
    .reduce<Record<string, number>>((acc, event) => {
      acc[event.service_id!] = (acc[event.service_id!] ?? 0) + 1;
      return acc;
    }, {});
  const serviceIds = Object.keys(serviceTotals);
  const { data: services } = serviceIds.length
    ? await supabase.from("services").select("id, name").in("id", serviceIds)
    : { data: [] as { id: string; name: string }[] };
  const topServices = Object.entries(serviceTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, total]) => ({ id, total, name: services?.find((service) => service.id === id)?.name ?? "Serviço removido" }));

  const dailyViews = currentRows
    .filter((event) => event.event_type === "page_view")
    .reduce<Record<string, number>>((acc, event) => {
      const key = new Date(event.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  const chartRows = Object.entries(dailyViews).slice(-14);
  const maxDaily = Math.max(1, ...chartRows.map(([, total]) => total));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader
        eyebrow="Desempenho"
        title="Analytics"
        description="Entenda o caminho entre a visita ao catálogo e o contato pelo WhatsApp."
        action={
          <form>
            <select name="periodo" defaultValue={String(days)} className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white">
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
            <button className="ml-2 rounded-lg border border-neutral-700 px-3 py-2.5 text-sm text-white">Aplicar</button>
          </form>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Visualizações" value={views} detail={variation(views, previousTotals.page_view ?? 0)} tone="brand" />
        <MetricCard label="Cliques em serviços" value={serviceClicks} detail={variation(serviceClicks, previousTotals.service_view ?? 0)} />
        <MetricCard label="Cliques no WhatsApp" value={whatsappClicks} detail={variation(whatsappClicks, previousTotals.whatsapp_click ?? 0)} tone="success" />
        <MetricCard label="Taxa de contato" value={`${conversion}%`} detail="Cliques no WhatsApp ÷ visualizações" tone="attention" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <SectionCard title="Evolução de visualizações" description="Últimos dias com acessos registrados dentro do período.">
          {chartRows.length ? (
            <div className="flex h-56 items-end gap-2 overflow-x-auto pt-4">
              {chartRows.map(([date, total]) => (
                <div key={date} className="flex min-w-8 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] text-neutral-500">{total}</span>
                  <div className="w-full min-w-5 rounded-t bg-red-500/80" style={{ height: `${Math.max(8, (total / maxDaily) * 150)}px` }} />
                  <span className="text-[9px] text-neutral-600">{date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-neutral-600">As visualizações aparecerão aqui quando o catálogo receber acessos.</p>
          )}
        </SectionCard>

        <SectionCard title="Funil de interesse" description="Como as pessoas avançam pelo catálogo.">
          <div className="space-y-3">
            {[
              { label: "Abriram o catálogo", value: views, width: 100 },
              { label: "Clicaram em serviços", value: serviceClicks, width: views ? Math.min(100, (serviceClicks / views) * 100) : 0 },
              { label: "Chamaram no WhatsApp", value: whatsappClicks, width: views ? Math.min(100, (whatsappClicks / views) * 100) : 0 },
            ].map((step) => (
              <div key={step.label}>
                <div className="mb-1 flex items-center justify-between text-xs"><span className="text-neutral-400">{step.label}</span><strong className="text-white">{step.value}</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-800"><div className="h-full rounded-full bg-red-500" style={{ width: `${step.width}%` }} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Serviços mais acessados" description="Ranking por cliques dentro do período selecionado.">
          {topServices.length ? (
            <ol className="space-y-3">
              {topServices.map((service, index) => (
                <li key={service.id} className="flex items-center gap-3 rounded-xl bg-neutral-950 px-4 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-400">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{service.name}</span>
                  <strong className="text-sm text-neutral-300">{service.total}</strong>
                </li>
              ))}
            </ol>
          ) : <p className="py-8 text-center text-sm text-neutral-600">Ainda não há cliques em serviços.</p>}
        </SectionCard>

        <SectionCard title="Todos os eventos" description="Resumo das interações registradas pelo catálogo.">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(EVENT_LABELS).map(([key, label]) => (
              <div key={key} className="rounded-xl bg-neutral-950 p-3">
                <p className="text-lg font-semibold text-white">{totals[key] ?? 0}</p>
                <p className="mt-1 text-[11px] leading-4 text-neutral-500">{label}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <p className="mt-6 text-xs leading-5 text-neutral-600">
        O sistema atual registra interações sem identificar pessoas. Visitantes únicos, origem do tráfego e presença em tempo real serão adicionados em uma evolução do rastreamento, preservando a privacidade.
      </p>
    </main>
  );
}
