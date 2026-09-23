import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ServiceSalesPage from "@/components/catalog/ServiceSalesPage";

// Mesma razão da página de catálogo: revalidatePath() só afeta o processo
// onde a Server Action rodou, então esta rota precisa buscar sempre fresco.
export const dynamic = "force-dynamic";

async function getData(slug: string, serviceSlug: string) {
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!business) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceSlug);
  const filter = isUuid ? `slug.eq.${serviceSlug},id.eq.${serviceSlug}` : `slug.eq.${serviceSlug}`;

  const { data: service } = await supabase
    .from("services")
    .select("*, service_prices(*)")
    .eq("business_id", business.id)
    .or(filter)
    .eq("active", true)
    .maybeSingle();

  if (!service) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("service_id", service.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  return { business, service, reviews: reviews ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; serviceSlug: string }>;
}): Promise<Metadata> {
  const { slug, serviceSlug } = await params;
  const data = await getData(slug, serviceSlug);
  if (!data) return {};

  return {
    title: `${data.service.sales_headline?.trim() || data.service.name} — ${data.business.name}`,
    description: data.service.sales_subheadline?.trim() || data.service.short_description || undefined,
  };
}

export default async function ServiceSalesRoute({
  params,
}: {
  params: Promise<{ slug: string; serviceSlug: string }>;
}) {
  const { slug, serviceSlug } = await params;
  const data = await getData(slug, serviceSlug);
  if (!data) notFound();

  return <ServiceSalesPage business={data.business} service={data.service} reviews={data.reviews} />;
}
