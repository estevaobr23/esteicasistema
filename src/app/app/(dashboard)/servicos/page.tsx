import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";
import { toggleServicoAtivo, excluirServico, duplicarServico } from "./actions";
import { formatBRL } from "@/lib/format";
import {
  DashboardPageHeader,
  EmptyState,
  MetricCard,
  StatusBadge,
  primaryButtonClass,
} from "@/components/dashboard/DashboardUI";
import AdaptiveSquareImage from "@/components/AdaptiveSquareImage";

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; q?: string; status?: string }>;
}) {
  const { erro, q = "", status = "todos" } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [{ data: services }, { data: events }] = await Promise.all([
    supabase.from("services").select("*, service_prices(*)").eq("business_id", business.id).order("sort_order"),
    supabase
      .from("analytics_events")
      .select("service_id")
      .eq("business_id", business.id)
      .eq("event_type", "service_view")
      .gte("created_at", since.toISOString()),
  ]);

  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");
  const allServices = services ?? [];
  const ativos = allServices.filter((service) => service.active).length;
  const ocultos = allServices.length - ativos;
  const destaques = allServices.filter((service) => service.featured).length;
  const incompletos = allServices.filter(
    (service) => !hasMedia(service) || (service.price_type !== "quote" && service.price_type !== "vehicle" && !service.base_price)
  ).length;
  const viewsByService = (events ?? []).reduce<Record<string, number>>((totals, event) => {
    if (event.service_id) totals[event.service_id] = (totals[event.service_id] ?? 0) + 1;
    return totals;
  }, {});

  const filtered = allServices.filter((service) => {
    const matchesQuery = service.name.toLowerCase().includes(q.trim().toLowerCase());
    const matchesStatus =
      status === "todos" ||
      (status === "ativos" && service.active) ||
      (status === "ocultos" && !service.active) ||
      (status === "destaques" && service.featured) ||
      (status === "incompletos" &&
        (!hasMedia(service) ||
          (service.price_type !== "quote" && service.price_type !== "vehicle" && !service.base_price)));
    return matchesQuery && matchesStatus;
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader
        eyebrow="Conteúdo"
        title="Serviços"
        description="Organize o que você oferece, mantenha os preços claros e veja quais serviços despertam mais interesse."
        action={<Link href="/app/servicos/novo" className={primaryButtonClass}>Novo serviço</Link>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Ativos" value={ativos} detail={limites.maxServicosAtivos === null ? "Sem limite" : `Limite de ${limites.maxServicosAtivos}`} tone="success" />
        <MetricCard label="Ocultos" value={ocultos} detail="Não aparecem no catálogo" />
        <MetricCard label="Em destaque" value={destaques} detail="Na seção Mais procurados" tone="attention" />
        <MetricCard label="Precisam de atenção" value={incompletos} detail="Sem imagem ou preço" tone={incompletos ? "attention" : "success"} />
      </div>

      {erro && <div className="mt-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>}

      <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar serviço"
          className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white focus:outline-none"
        >
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="ocultos">Ocultos</option>
          <option value="destaques">Em destaque</option>
          <option value="incompletos">Precisam de atenção</option>
        </select>
        <button className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <div className="mt-4 space-y-3">
        {filtered.map((service) => {
          const incomplete =
            !hasMedia(service) ||
            (service.price_type !== "quote" && service.price_type !== "vehicle" && !service.base_price);
          return (
            <article key={service.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex gap-4">
                <div className="w-24 shrink-0 sm:w-28">
                  {service.image_url ? (
                    <AdaptiveSquareImage src={service.image_url} alt={service.name} className="rounded-xl" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-950 text-[10px] text-neutral-600">Sem imagem</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-medium text-white">{service.name}</h2>
                    {service.featured && <StatusBadge tone="attention">Destaque</StatusBadge>}
                    {!service.active && <StatusBadge>Oculto</StatusBadge>}
                    {incomplete && <StatusBadge tone="danger">Incompleto</StatusBadge>}
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {service.price_type === "vehicle"
                      ? `${(service.service_prices ?? []).length} preço(s) por veículo`
                      : service.base_price
                        ? formatBRL(service.base_price)
                        : "Sob consulta"}
                  </p>
                  <p className="mt-2 text-xs text-neutral-600">{viewsByService[service.id] ?? 0} visualização(ões) nos últimos 30 dias</p>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-neutral-500">{service.image_url && <span className="rounded bg-neutral-950 px-2 py-1">Foto</span>}{service.before_image && service.after_image && <span className="rounded bg-neutral-950 px-2 py-1">Antes/depois</span>}{Array.isArray(service.gallery) && service.gallery.length > 0 && <span className="rounded bg-neutral-950 px-2 py-1">{service.gallery.length} fotos</span>}{service.video_url && <span className="rounded bg-neutral-950 px-2 py-1">Vídeo</span>}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link href={`/app/servicos/${service.id}`} className="rounded-md bg-white px-3 py-1.5 font-semibold text-neutral-950">Editar</Link>
                <form action={duplicarServico}>
                  <input type="hidden" name="id" value={service.id} />
                  <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">Duplicar</button>
                </form>
                <form action={toggleServicoAtivo}>
                  <input type="hidden" name="id" value={service.id} />
                  <input type="hidden" name="active" value={(!service.active).toString()} />
                  <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">{service.active ? "Ocultar" : "Ativar"}</button>
                </form>
                <form action={excluirServico}>
                  <input type="hidden" name="id" value={service.id} />
                  <button className="rounded-md border border-red-900 px-3 py-1.5 font-medium text-red-400">Excluir</button>
                </form>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            title={allServices.length === 0 ? "Nenhum serviço cadastrado" : "Nenhum serviço encontrado"}
            description={allServices.length === 0 ? "Crie seu primeiro serviço para começar a montar a vitrine." : "Tente outro nome ou ajuste o filtro selecionado."}
            action={allServices.length === 0 ? <Link href="/app/servicos/novo" className={primaryButtonClass}>Criar primeiro serviço</Link> : undefined}
          />
        )}
      </div>
    </main>
  );
}

function hasMedia(service: { image_url: string | null; before_image: string | null; after_image: string | null; gallery: unknown; video_url: string | null }) {
  return !!service.image_url || (!!service.before_image && !!service.after_image) || (Array.isArray(service.gallery) && service.gallery.length > 0) || !!service.video_url;
}
