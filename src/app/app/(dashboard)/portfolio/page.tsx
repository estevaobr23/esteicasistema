import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { limitesDoPlano } from "@/lib/domain/plans";
import { excluirItemPortfolio, toggleItemPortfolioAtivo } from "./actions";
import PortfolioForm from "@/components/dashboard/PortfolioForm";

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  if (!limites.permitePortfolio) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <h1 className="mb-2 text-xl font-semibold text-white">Antes/Depois</h1>
        <p className="text-sm text-neutral-400">
          Esse recurso está disponível no plano Profissional. Faça upgrade para mostrar seus resultados no catálogo.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("business_id", business.id)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Resultados (antes/depois)</h1>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>
      )}

      <div className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <PortfolioForm businessId={business.id} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(items ?? []).map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            <div className="grid grid-cols-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.before_image} alt="Antes" className="aspect-square object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.after_image} alt="Depois" className="aspect-square object-cover" />
            </div>
            <div className="p-2">
              {item.title && <p className="truncate text-xs font-medium text-white">{item.title}</p>}
              <div className="mt-2 flex gap-1 text-[11px]">
                <form action={toggleItemPortfolioAtivo}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="active" value={(!item.active).toString()} />
                  <button className="rounded border border-neutral-700 px-2 py-1 text-white">
                    {item.active ? "Ocultar" : "Ativar"}
                  </button>
                </form>
                <form action={excluirItemPortfolio}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded border border-red-900 px-2 py-1 text-red-400">Excluir</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
