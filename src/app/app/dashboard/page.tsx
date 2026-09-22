import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import CatalogLinkCard from "@/components/dashboard/CatalogLinkCard";
import ChecklistCard from "@/components/dashboard/ChecklistCard";

export default async function DashboardPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [
    { count: servicesCount },
    { count: portfolioCount },
    { count: availabilityCount },
    { count: reviewsCount },
  ] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("business_id", business.id).eq("active", true),
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("availability_slots").select("id", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", business.id),
  ]);

  const checklist = [
    { label: "Logo adicionada", done: !!business.logo_url },
    { label: "WhatsApp configurado", done: !!business.whatsapp },
    { label: `${servicesCount ?? 0} serviço(s) cadastrado(s)`, done: (servicesCount ?? 0) > 0 },
    { label: "Antes/depois adicionado", done: (portfolioCount ?? 0) > 0 },
    { label: "Horários configurados", done: (availabilityCount ?? 0) > 0 },
    { label: "Avaliações adicionadas", done: (reviewsCount ?? 0) > 0 },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold">Início</h1>

      <CatalogLinkCard business={business} />
      <div className="mt-6">
        <ChecklistCard items={checklist} />
      </div>
    </main>
  );
}
