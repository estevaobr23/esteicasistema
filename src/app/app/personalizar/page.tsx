import { getCurrentBusiness } from "@/lib/domain/business";
import { salvarPersonalizacao } from "./actions";
import VisualForm from "@/components/dashboard/VisualForm";

export default async function PersonalizarPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;
  const business = await getCurrentBusiness();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Personalizar</h1>

      {salvo && (
        <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
          Personalização salva.
        </div>
      )}

      <VisualForm business={business} action={salvarPersonalizacao} submitLabel="Salvar alterações" />
    </main>
  );
}
