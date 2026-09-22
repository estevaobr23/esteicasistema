import { getCurrentBusiness } from "@/lib/domain/business";
import ServicoForm from "@/components/dashboard/ServicoForm";

export default async function NovoServicoPage() {
  const business = await getCurrentBusiness();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Novo serviço</h1>
      <ServicoForm businessId={business.id} />
    </main>
  );
}
