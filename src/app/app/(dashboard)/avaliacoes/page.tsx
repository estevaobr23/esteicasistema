import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";
import { adicionarAvaliacao, removerAvaliacao, toggleAvaliacaoAtiva } from "./actions";
import { DashboardPageHeader, EmptyState, MetricCard, SectionCard, StatusBadge } from "@/components/dashboard/DashboardUI";

export default async function AvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; nota?: string }>;
}) {
  const { q = "", nota = "todas" } = await searchParams;
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  if (!limites.permiteAvaliacoes) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-2 text-xl font-semibold text-white">Avaliações</h1>
        <p className="text-sm text-neutral-400">Avaliações estão disponíveis no plano Profissional. Faça upgrade para mostrar o que seus clientes dizem.</p>
      </main>
    );
  }

  const supabase = await createClient();
  const [{ data: reviews }, { data: services }, { data: packages }, { data: portfolio }] = await Promise.all([
    supabase.from("reviews").select("*").eq("business_id", business.id).order("created_at", { ascending: false }),
    supabase.from("services").select("id, name").eq("business_id", business.id).eq("active", true).order("sort_order"),
    supabase.from("packages").select("id, name").eq("business_id", business.id).eq("active", true).order("sort_order"),
    supabase.from("portfolio_items").select("id, title").eq("business_id", business.id).eq("active", true).order("sort_order"),
  ]);
  const allReviews = reviews ?? [];
  const published = allReviews.filter((review) => review.active).length;
  const hidden = allReviews.length - published;
  const average = allReviews.length
    ? (allReviews.reduce((total, review) => total + review.rating, 0) / allReviews.length).toFixed(1)
    : "0,0";
  const fiveStars = allReviews.filter((review) => review.rating === 5).length;
  const filtered = allReviews.filter((review) => {
    const matchesQuery = review.customer_name.toLowerCase().includes(q.trim().toLowerCase());
    const matchesRating = nota === "todas" || review.rating === Number(nota);
    return matchesQuery && matchesRating;
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader eyebrow="Confiança" title="Avaliações" description="Organize os depoimentos que ajudam novos clientes a confiar no seu trabalho." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Nota média" value={`${average} ★`} detail={`${allReviews.length} avaliação(ões)`} tone="attention" />
        <MetricCard label="Publicadas" value={published} detail="Visíveis no catálogo" tone="success" />
        <MetricCard label="Ocultas" value={hidden} detail="Guardadas no painel" />
        <MetricCard label="Cinco estrelas" value={fiveStars} detail="Avaliações com nota máxima" tone="brand" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <SectionCard title="Adicionar avaliação" description="Cadastre um depoimento recebido e escolha quando ele ficará visível.">
          <form action={adicionarAvaliacao} className="space-y-3">
            <input name="customer_name" placeholder="Nome do cliente" required className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" />
            <select name="rating" defaultValue={5} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white">
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{"★".repeat(value)} ({value})</option>)}
            </select>
            <textarea name="text" placeholder="Comentário" rows={4} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" />
            <select name="source" defaultValue="manual" className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white"><option value="manual">Recebida manualmente</option><option value="whatsapp">WhatsApp</option><option value="google">Google</option><option value="instagram">Instagram</option></select>
            <select name="service_id" className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white"><option value="">Relacionar a um serviço</option>{(services ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select name="package_id" className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white"><option value="">Relacionar a um pacote</option>{(packages ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select name="portfolio_item_id" className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white"><option value="">Relacionar a um projeto</option>{(portfolio ?? []).map((item) => <option key={item.id} value={item.id}>{item.title ?? "Projeto sem título"}</option>)}</select>
            <input type="date" name="review_date" className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white" />
            <button type="submit" className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-950">Adicionar avaliação</button>
          </form>
          <div className="mt-4 rounded-lg bg-neutral-950 px-3 py-3">
            <p className="text-xs font-medium text-neutral-300">Mensagem sugerida</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">“Olá! Seu feedback é muito importante. Poderia me enviar uma nota de 1 a 5 e contar como foi o atendimento?”</p>
          </div>
        </SectionCard>

        <div>
          <form className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input name="q" defaultValue={q} placeholder="Buscar cliente" className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none" />
            <select name="nota" defaultValue={nota} className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm text-white focus:outline-none">
              <option value="todas">Todas as notas</option>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrelas</option>)}
            </select>
            <button className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
          </form>

          <div className="space-y-3">
            {filtered.map((review) => (
              <article key={review.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">{review.customer_name}</p>
                      {!review.active && <StatusBadge>Oculta</StatusBadge>}
                    </div>
                    <p className="mt-1 text-amber-400">{"★".repeat(review.rating)}<span className="text-neutral-700">{"★".repeat(5 - review.rating)}</span></p>
                    {review.text && <p className="mt-2 text-sm leading-6 text-neutral-400">{review.text}</p>}
                    <p className="mt-2 text-[11px] text-neutral-600">Adicionada em {new Date(review.created_at).toLocaleDateString("pt-BR")}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-neutral-700">Fonte: {review.source}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <form action={toggleAvaliacaoAtiva}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="active" value={(!review.active).toString()} />
                    <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">{review.active ? "Ocultar" : "Ativar"}</button>
                  </form>
                  <form action={removerAvaliacao}>
                    <input type="hidden" name="id" value={review.id} />
                    <button className="rounded-md border border-red-900 px-3 py-1.5 font-medium text-red-400">Excluir</button>
                  </form>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <EmptyState title="Nenhuma avaliação encontrada" description="Adicione um depoimento ou ajuste os filtros." />}
          </div>
        </div>
      </div>
    </main>
  );
}
