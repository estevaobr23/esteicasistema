import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { getCatalogTemplate } from "@/lib/domain/catalog-templates";
import { limitesDoPlano } from "@/lib/domain/plans";
import CatalogLinkCard from "@/components/dashboard/CatalogLinkCard";
import ChecklistCard from "@/components/dashboard/ChecklistCard";
import {
  DashboardPageHeader,
  MetricCard,
  QuickAction,
  SectionCard,
  StatusBadge,
  primaryButtonClass,
} from "@/components/dashboard/DashboardUI";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function comparisonLabel(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "Primeiros acessos registrados" : "Sem acessos no período anterior";
  const variation = Math.round(((current - previous) / previous) * 100);
  return `${variation >= 0 ? "+" : ""}${variation}% vs. 7 dias anteriores`;
}

export default async function DashboardPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const fourteenDaysAgo = daysAgo(14);
  const sevenDaysAgo = daysAgo(7);
  const today = startOfToday();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  const [
    { data: services },
    { count: portfolioCount },
    { count: availabilityCount },
    { count: reviewsCount },
    { data: events },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, active, image_url, base_price, price_type")
      .eq("business_id", business.id),
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("availability_slots").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase
      .from("analytics_events")
      .select("event_type, service_id, created_at")
      .eq("business_id", business.id)
      .gte("created_at", fourteenDaysAgo.toISOString()),
  ]);

  const rows = events ?? [];
  const activeServices = (services ?? []).filter((service) => service.active);
  const currentEvents = rows.filter((event) => new Date(event.created_at) >= sevenDaysAgo);
  const previousEvents = rows.filter((event) => {
    const createdAt = new Date(event.created_at);
    return createdAt >= fourteenDaysAgo && createdAt < sevenDaysAgo;
  });
  const viewsToday = rows.filter(
    (event) => event.event_type === "page_view" && new Date(event.created_at) >= today
  ).length;
  const viewsCurrent = currentEvents.filter((event) => event.event_type === "page_view").length;
  const viewsPrevious = previousEvents.filter((event) => event.event_type === "page_view").length;
  const whatsappClicks = currentEvents.filter((event) => event.event_type === "whatsapp_click").length;
  const conversion = viewsCurrent > 0 ? Math.round((whatsappClicks / viewsCurrent) * 100) : 0;

  const serviceViews = currentEvents
    .filter((event) => event.event_type === "service_view" && event.service_id)
    .reduce<Record<string, number>>((totals, event) => {
      totals[event.service_id!] = (totals[event.service_id!] ?? 0) + 1;
      return totals;
    }, {});
  const topServiceEntry = Object.entries(serviceViews).sort((a, b) => b[1] - a[1])[0];
  const topService = (services ?? []).find((service) => service.id === topServiceEntry?.[0]);
  const incompleteServices = activeServices.filter(
    (service) => !service.image_url || (service.price_type !== "quote" && service.price_type !== "vehicle" && !service.base_price)
  );
  const template = getCatalogTemplate(business.template_id);

  const checklist = [
    { label: "Catálogo publicado", done: business.published },
    { label: "Logo adicionada", done: !!business.logo_url },
    { label: "Foto principal adicionada", done: !!business.cover_url },
    { label: "WhatsApp configurado", done: !!business.whatsapp },
    { label: `${activeServices.length} serviço(s) ativo(s)`, done: activeServices.length > 0 },
    { label: "Horários configurados", done: (availabilityCount ?? 0) > 0 },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader
        eyebrow="Central de controle"
        title={`Olá, ${business.name}`}
        description="Acompanhe seu catálogo, veja o que está trazendo interesse e encontre a próxima ação importante."
        action={
          <a
            href={`${process.env.NEXT_PUBLIC_APP_URL}/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClass}
          >
            Ver meu catálogo ↗
          </a>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge tone={business.published ? "success" : "attention"}>
          {business.published ? "Catálogo publicado" : "Catálogo em rascunho"}
        </StatusBadge>
        <StatusBadge tone="brand">Plano {business.plano}</StatusBadge>
        <span className="text-xs text-neutral-600">Atualizado em {new Date(business.updated_at).toLocaleDateString("pt-BR")}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Visualizações hoje" value={viewsToday} detail="Acessos ao catálogo" tone="brand" />
        <MetricCard
          label="Últimos 7 dias"
          value={viewsCurrent}
          detail={comparisonLabel(viewsCurrent, viewsPrevious)}
          tone="neutral"
        />
        <MetricCard
          label="Cliques no WhatsApp"
          value={whatsappClicks}
          detail={`${conversion}% das visualizações`}
          tone="success"
        />
        <MetricCard
          label="Serviço mais acessado"
          value={<span className="block truncate text-lg">{topService?.name ?? "Ainda sem dados"}</span>}
          detail={topServiceEntry ? `${topServiceEntry[1]} clique(s) em 7 dias` : "Divulgue o catálogo para começar"}
          tone="attention"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <CatalogLinkCard business={business} />

          <SectionCard title="Ações rápidas" description="Os caminhos mais usados para manter sua vitrine atualizada.">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction href="/app/servicos/novo" icon="+" title="Novo serviço" description="Cadastre preço, imagem e descrição." />
              <QuickAction href="/app/catalogo" icon="✦" title="Personalizar catálogo" description="Ajuste template, textos e seções." />
              <QuickAction href="/app/horarios" icon="◷" title="Atualizar horários" description="Mostre quando você pode atender." />
              {limites.permitePortfolio ? (
                <QuickAction href="/app/portfolio" icon="◫" title="Adicionar resultado" description="Publique um novo antes e depois." />
              ) : (
                <QuickAction href="/app/configuracoes" icon="↑" title="Conhecer o Profissional" description="Libere portfólio, analytics e pacotes." />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Resumo do conteúdo" description="Uma leitura rápida do que já está disponível no catálogo.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link href="/app/servicos" className="rounded-xl bg-neutral-950 p-4 hover:bg-black">
                <p className="text-xl font-semibold text-white">{activeServices.length}</p>
                <p className="mt-1 text-xs text-neutral-500">Serviços ativos</p>
              </Link>
              <Link href="/app/portfolio" className="rounded-xl bg-neutral-950 p-4 hover:bg-black">
                <p className="text-xl font-semibold text-white">{portfolioCount ?? 0}</p>
                <p className="mt-1 text-xs text-neutral-500">Resultados</p>
              </Link>
              <Link href="/app/horarios" className="rounded-xl bg-neutral-950 p-4 hover:bg-black">
                <p className="text-xl font-semibold text-white">{availabilityCount ?? 0}</p>
                <p className="mt-1 text-xs text-neutral-500">Horários</p>
              </Link>
              <Link href="/app/avaliacoes" className="rounded-xl bg-neutral-950 p-4 hover:bg-black">
                <p className="text-xl font-semibold text-white">{reviewsCount ?? 0}</p>
                <p className="mt-1 text-xs text-neutral-500">Avaliações</p>
              </Link>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Template atual"
            description={template.descricao}
            action={
              <Link href="/app/catalogo" className="text-xs font-semibold text-red-400 hover:text-red-300">
                Personalizar →
              </Link>
            }
          >
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
              <div
                className="h-24 p-4"
                style={{ backgroundColor: template.palette.bg, color: template.palette.textColor }}
              >
                <div className="h-2 w-20 rounded-full" style={{ backgroundColor: template.palette.primaryColorDefault }} />
                <div className="mt-4 h-3 w-36 rounded-full bg-current opacity-90" />
                <div className="mt-2 h-2 w-48 rounded-full bg-current opacity-30" />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-semibold text-white">{template.nome}</p>
                <div className="flex gap-1.5">
                  <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: business.primary_color }} />
                  <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: business.secondary_color }} />
                </div>
              </div>
            </div>
          </SectionCard>

          <ChecklistCard items={checklist} />

          {incompleteServices.length > 0 && (
            <SectionCard title="Precisa de atenção">
              <p className="text-sm text-amber-200">
                {incompleteServices.length} serviço(s) ativo(s) ainda estão sem imagem ou preço completo.
              </p>
              <Link href="/app/servicos" className="mt-3 inline-flex text-xs font-semibold text-amber-400 hover:text-amber-300">
                Revisar serviços →
              </Link>
            </SectionCard>
          )}
        </div>
      </div>
    </main>
  );
}
