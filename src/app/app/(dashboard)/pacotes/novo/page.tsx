import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import PacoteForm from "@/components/dashboard/PacoteForm";

export default async function NovoPacotePage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: servicos } = await supabase
    .from("services")
    .select("id, name")
    .eq("business_id", business.id)
    .eq("active", true);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Novo pacote</h1>
      <PacoteForm businessId={business.id} servicos={servicos ?? []} />
    </main>
  );
}
