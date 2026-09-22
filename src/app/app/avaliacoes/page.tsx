import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { adicionarAvaliacao, removerAvaliacao, toggleAvaliacaoAtiva } from "./actions";

export default async function AvaliacoesPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Avaliações</h1>

      <form action={adicionarAvaliacao} className="mb-8 space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <input
          name="customer_name"
          placeholder="Nome do cliente"
          required
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
        />
        <select name="rating" defaultValue={5} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
        <textarea
          name="text"
          placeholder="Comentário"
          rows={2}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white focus:border-neutral-600 focus:outline-none"
        />
        <button type="submit" className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950">
          Adicionar avaliação
        </button>
      </form>

      <div className="space-y-3">
        {(reviews ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">{r.customer_name}</p>
                <p className="text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                {r.text && <p className="mt-1 text-sm text-neutral-400">{r.text}</p>}
              </div>
              {!r.active && <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">Oculta</span>}
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              <form action={toggleAvaliacaoAtiva}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="active" value={(!r.active).toString()} />
                <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">
                  {r.active ? "Ocultar" : "Ativar"}
                </button>
              </form>
              <form action={removerAvaliacao}>
                <input type="hidden" name="id" value={r.id} />
                <button className="rounded-md border border-red-900 px-3 py-1.5 font-medium text-red-400">Excluir</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
