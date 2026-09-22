import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedBusinessBySlug } from "@/lib/domain/catalog-data";
import { normalizeSectionsConfig } from "@/lib/domain/catalog-sections";
import CatalogPresentation from "@/components/catalog/CatalogPresentation";
import PageViewTracker from "@/components/catalog/PageViewTracker";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedBusinessBySlug(slug);
  if (!data) return {};

  return {
    title: `${data.business.name} — Catálogo de Serviços`,
    description: data.business.about ?? `Conheça os serviços de estética automotiva de ${data.business.name}.`,
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublishedBusinessBySlug(slug);
  if (!data) notFound();

  const sectionsConfig = normalizeSectionsConfig(data.business.sections_config);

  return (
    <>
      <PageViewTracker businessId={data.business.id} />
      <CatalogPresentation
        business={data.business}
        services={data.services}
        packages={data.packages}
        portfolioItems={data.portfolioItems}
        availabilitySlots={data.availabilitySlots}
        reviews={data.reviews}
        sectionsConfig={sectionsConfig}
      />
    </>
  );
}
