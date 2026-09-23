import { notFound } from "next/navigation";
import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import PacoteForm from "@/components/dashboard/PacoteForm";

export default async function EditarPacotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ data: pacote }, { data: servicos }] = await Promise.all([
    supabase
      .from("packages")
      .select("*, package_services(service_id), package_benefits(*)")
      .eq("id", id)
      .eq("business_id", business.id)
      .maybeSingle(),
    supabase.from("services").select("id, name").eq("business_id", business.id).eq("active", true),
  ]);

  if (!pacote) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Editar pacote</h1>
      <PacoteForm businessId={business.id} servicos={servicos ?? []} initial={pacote} />
    </main>
  );
}
