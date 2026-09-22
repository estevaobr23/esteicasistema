import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";
import { excluirItemPortfolio, toggleItemPortfolioAtivo } from "./actions";
import PortfolioForm from "@/components/dashboard/PortfolioForm";
import { DashboardPageHeader, EmptyState, MetricCard, SectionCard, StatusBadge } from "@/components/dashboard/DashboardUI";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; categoria?: string }>;
}) {
  const { erro, categoria = "todas" } = await searchParams;
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  if (!limites.permitePortfolio) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-2 text-xl font-semibold text-white">Portfólio</h1>
        <p className="text-sm text-neutral-400">Esse recurso está disponível no plano Profissional. Faça upgrade para mostrar seus resultados no catálogo.</p>
      </main>
    );
  }

  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [{ data: items }, { count: portfolioViews }] = await Promise.all([
    supabase.from("portfolio_items").select("*").eq("business_id", business.id).order("sort_order"),
    supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("event_type", "portfolio_view")
      .gte("created_at", since.toISOString()),
  ]);

  const allItems = items ?? [];
  const active = allItems.filter((item) => item.active).length;
  const hidden = allItems.length - active;
  const incomplete = allItems.filter((item) => !item.title || !item.category || !item.service_id).length;
  const categories = Array.from(new Set(allItems.map((item) => item.category).filter(Boolean))) as string[];
  const filtered = categoria === "todas" ? allItems : allItems.filter((item) => item.category === categoria);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader eyebrow="Conteúdo" title="Portfólio" description="Organize seus resultados e use o antes e depois como prova da qualidade do seu trabalho." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Publicados" value={active} detail="Visíveis no catálogo" tone="success" />
        <MetricCard label="Ocultos" value={hidden} detail="Fora da vitrine" />
        <MetricCard label="Visualizações" value={portfolioViews ?? 0} detail="Nos últimos 30 dias" tone="brand" />
        <MetricCard label="Precisam de atenção" value={incomplete} detail="Sem título, categoria ou serviço" tone={incomplete ? "attention" : "success"} />
      </div>

      {erro && <div className="mt-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Adicionar resultado" description="Use duas fotos com enquadramento parecido para valorizar a comparação.">
          <PortfolioForm businessId={business.id} />
        </SectionCard>

        <div>
          <form className="mb-4 flex justify-end">
            <select name="categoria" defaultValue={categoria} className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white focus:outline-none">
              <option value="todas">Todas as categorias</option>
              {categories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </form>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="grid grid-cols-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.before_image} alt="Antes" className="aspect-square object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.after_image} alt="Depois" className="aspect-square object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-white">{item.title || "Resultado sem título"}</h2>
                    {!item.active && <StatusBadge>Oculto</StatusBadge>}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{item.vehicle || "Veículo não informado"}{item.category ? ` · ${item.category}` : ""}</p>
                  <div className="mt-3 flex gap-2 text-[11px]">
                    <form action={toggleItemPortfolioAtivo}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="active" value={(!item.active).toString()} />
                      <button className="rounded border border-neutral-700 px-2.5 py-1.5 text-white">{item.active ? "Ocultar" : "Ativar"}</button>
                    </form>
                    <form action={excluirItemPortfolio}>
                      <input type="hidden" name="id" value={item.id} />
                      <button className="rounded border border-red-900 px-2.5 py-1.5 text-red-400">Excluir</button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && <EmptyState title="Nenhum resultado nesta seleção" description="Adicione um antes e depois ou escolha outra categoria." />}
        </div>
      </div>
    </main>
  );
}
