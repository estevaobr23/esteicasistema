import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { normalizeSectionsConfig } from "@/lib/domain/catalog-sections";
import { buildInitialState } from "@/components/dashboard/catalog-editor/editor-state";
import { CatalogEditorProvider } from "@/components/dashboard/catalog-editor/CatalogEditorContext";
import CatalogEditorShell from "@/components/dashboard/catalog-editor/CatalogEditorShell";

export default async function CatalogoPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const [{ data: services }, { data: packages }, { data: portfolioItems }, { data: availabilitySlots }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("services")
        .select("*, service_features(*), service_prices(*)")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("packages")
        .select("*, package_services(service_id)")
        .eq("business_id", business.id)
        .eq("active", true)
        .order("sort_order"),
      supabase.from("portfolio_items").select("*").eq("business_id", business.id).eq("active", true).order("sort_order"),
      supabase.from("availability_slots").select("*").eq("business_id", business.id).eq("active", true),
      supabase.from("reviews").select("*").eq("business_id", business.id).eq("active", true).order("created_at", { ascending: false }),
    ]);

  const sectionsConfig = normalizeSectionsConfig(business.sections_config);
  const initialState = buildInitialState(business, services ?? [], sectionsConfig);

  return (
    <CatalogEditorProvider initialState={initialState}>
      <CatalogEditorShell
        business={business}
        services={services ?? []}
        packages={packages ?? []}
        portfolioItems={portfolioItems ?? []}
        availabilitySlots={availabilitySlots ?? []}
        reviews={reviews ?? []}
      />
    </CatalogEditorProvider>
  );
}
