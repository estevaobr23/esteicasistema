import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";
import { toggleServicoAtivo, excluirServico, duplicarServico } from "./actions";
import { formatBRL } from "@/components/catalog/ServicePrice";

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*, service_prices(*)")
    .eq("business_id", business.id)
    .order("sort_order");

  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");
  const ativos = (services ?? []).filter((s) => s.active).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Meus Serviços</h1>
          <p className="text-sm text-neutral-500">
            {ativos} ativo(s){limites.maxServicosAtivos !== null && ` de ${limites.maxServicosAtivos} permitidos`}
          </p>
        </div>
        <Link
          href="/app/servicos/novo"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950"
        >
          Novo serviço
        </Link>
      </div>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      )}

      <div className="space-y-3">
        {(services ?? []).map((s) => (
          <div key={s.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-white">{s.name}</p>
                  {s.featured && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">Destaque</span>}
                  {!s.active && <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">Oculto</span>}
                </div>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {s.price_type === "vehicle"
                    ? `${(s.service_prices ?? []).length} preço(s) por veículo`
                    : s.base_price
                    ? formatBRL(s.base_price)
                    : "Sob consulta"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link href={`/app/servicos/${s.id}`} className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">
                Editar
              </Link>
              <form action={duplicarServico}>
                <input type="hidden" name="id" value={s.id} />
                <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">Duplicar</button>
              </form>
              <form action={toggleServicoAtivo}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="active" value={(!s.active).toString()} />
                <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">
                  {s.active ? "Ocultar" : "Ativar"}
                </button>
              </form>
              <form action={excluirServico}>
                <input type="hidden" name="id" value={s.id} />
                <button className="rounded-md border border-red-900 px-3 py-1.5 font-medium text-red-400">Excluir</button>
              </form>
            </div>
          </div>
        ))}

        {(services ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-500">Nenhum serviço cadastrado ainda.</p>
        )}
      </div>
    </main>
  );
}
