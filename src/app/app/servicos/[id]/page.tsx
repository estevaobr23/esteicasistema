import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import ServicoForm from "@/components/dashboard/ServicoForm";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select("*, service_prices(*)")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!service) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Editar serviço</h1>
      <ServicoForm businessId={business.id} initial={service} />
    </main>
  );
}
