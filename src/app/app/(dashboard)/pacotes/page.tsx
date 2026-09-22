import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { togglePacoteAtivo, excluirPacote } from "./actions";
import { formatBRL } from "@/lib/format";
import {
  DashboardPageHeader,
  EmptyState,
  MetricCard,
  StatusBadge,
  primaryButtonClass,
} from "@/components/dashboard/DashboardUI";

export default async function PacotesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; q?: string; status?: string }>;
}) {
  const { erro, q = "", status = "todos" } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("packages")
    .select("*, package_services(service_id)")
    .eq("business_id", business.id)
    .order("sort_order");

  const allPackages = packages ?? [];
  const active = allPackages.filter((item) => item.active).length;
  const hidden = allPackages.length - active;
  const onSale = allPackages.filter((item) => item.promotional_price && item.promotional_price < item.price).length;
  const averageSaving = onSale
    ? Math.round(
        allPackages
          .filter((item) => item.promotional_price && item.promotional_price < item.price)
          .reduce((total, item) => total + ((item.price - item.promotional_price!) / item.price) * 100, 0) / onSale
      )
    : 0;
  const filtered = allPackages.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(q.trim().toLowerCase());
    const matchesStatus =
      status === "todos" ||
      (status === "ativos" && item.active) ||
      (status === "ocultos" && !item.active) ||
      (status === "promocao" && item.promotional_price && item.promotional_price < item.price);
    return matchesQuery && matchesStatus;
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader
        eyebrow="Conteúdo"
        title="Pacotes"
        description="Combine serviços, deixe a economia clara e apresente ofertas de maior valor no seu catálogo."
        action={<Link href="/app/pacotes/novo" className={primaryButtonClass}>Novo pacote</Link>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Ativos" value={active} detail="Visíveis no catálogo" tone="success" />
        <MetricCard label="Ocultos" value={hidden} detail="Fora da vitrine" />
        <MetricCard label="Em promoção" value={onSale} detail="Com preço promocional" tone="brand" />
        <MetricCard label="Economia média" value={`${averageSaving}%`} detail="Entre pacotes em promoção" tone="attention" />
      </div>

      {erro && <div className="mt-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>}

      <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Buscar pacote" className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" />
        <select name="status" defaultValue={status} className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white focus:outline-none">
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="ocultos">Ocultos</option>
          <option value="promocao">Em promoção</option>
        </select>
        <button className="rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {filtered.map((item) => {
          const promotional = item.promotional_price && item.promotional_price < item.price;
          const saving = promotional ? Math.round(((item.price - item.promotional_price!) / item.price) * 100) : 0;
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image_url} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-28 items-center justify-center bg-neutral-950 text-xs text-neutral-600">Sem imagem</div>
              )}
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-white">{item.name}</h2>
                  {!item.active && <StatusBadge>Oculto</StatusBadge>}
                  {promotional && <StatusBadge tone="brand">Economize {saving}%</StatusBadge>}
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-500">{item.description || "Adicione uma descrição para valorizar esta oferta."}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    {promotional && <p className="text-xs text-neutral-600 line-through">{formatBRL(item.price)}</p>}
                    <p className="text-xl font-semibold text-white">{formatBRL(item.promotional_price ?? item.price)}</p>
                  </div>
                  <p className="text-xs text-neutral-500">{item.package_services?.length ?? 0} serviço(s)</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <Link href={`/app/pacotes/${item.id}`} className="rounded-md bg-white px-3 py-1.5 font-semibold text-neutral-950">Editar</Link>
                  <form action={togglePacoteAtivo}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="active" value={(!item.active).toString()} />
                    <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">{item.active ? "Ocultar" : "Ativar"}</button>
                  </form>
                  <form action={excluirPacote}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="rounded-md border border-red-900 px-3 py-1.5 font-medium text-red-400">Excluir</button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title={allPackages.length ? "Nenhum pacote encontrado" : "Nenhum pacote cadastrado"}
            description={allPackages.length ? "Tente outro nome ou ajuste o filtro." : "Combine serviços para criar uma oferta de maior valor."}
            action={!allPackages.length ? <Link href="/app/pacotes/novo" className={primaryButtonClass}>Criar primeiro pacote</Link> : undefined}
          />
        </div>
      )}
    </main>
  );
}
