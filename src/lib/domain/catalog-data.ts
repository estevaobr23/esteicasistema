import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getPublishedBusinessBySlug(slug: string) {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!business) return null;

  const [
    { data: services },
    { data: packages },
    { data: portfolioItems },
    { data: availabilitySlots },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*, service_features(*), service_prices(*)")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("packages")
      .select("*, package_services(service_id), package_benefits(*)")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("portfolio_items")
      .select("*")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("availability_slots")
      .select("*")
      .eq("business_id", business.id)
      .eq("active", true),
    supabase
      .from("reviews")
      .select("*")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("created_at", { ascending: false }),
  ]);

  return {
    business,
    services: services ?? [],
    packages: packages ?? [],
    portfolioItems: portfolioItems ?? [],
    availabilitySlots: availabilitySlots ?? [],
    reviews: reviews ?? [],
  };
}

export type CatalogData = NonNullable<Awaited<ReturnType<typeof getPublishedBusinessBySlug>>>;
