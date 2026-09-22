import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { togglePacoteAtivo, excluirPacote } from "./actions";
import { formatBRL } from "@/lib/format";

export default async function PacotesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("business_id", business.id)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Pacotes</h1>
        <Link href="/app/pacotes/novo" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-950">
          Novo pacote
        </Link>
      </div>

      {erro && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>
      )}

      <div className="space-y-3">
        {(packages ?? []).map((p) => (
          <div key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">{p.name}</p>
                <p className="mt-0.5 text-sm text-neutral-500">{formatBRL(p.promotional_price ?? p.price)}</p>
              </div>
              {!p.active && <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">Oculto</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Link href={`/app/pacotes/${p.id}`} className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">
                Editar
              </Link>
              <form action={togglePacoteAtivo}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="active" value={(!p.active).toString()} />
                <button className="rounded-md border border-neutral-700 px-3 py-1.5 font-medium text-white">
                  {p.active ? "Ocultar" : "Ativar"}
                </button>
              </form>
              <form action={excluirPacote}>
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded-md border border-red-900 px-3 py-1.5 font-medium text-red-400">Excluir</button>
              </form>
            </div>
          </div>
        ))}

        {(packages ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-500">Nenhum pacote cadastrado ainda.</p>
        )}
      </div>
    </main>
  );
}
