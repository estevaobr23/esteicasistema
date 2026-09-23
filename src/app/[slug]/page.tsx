import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedBusinessBySlug } from "@/lib/domain/catalog-data";
import { normalizeSectionsConfig } from "@/lib/domain/catalog-sections";
import CatalogPresentation from "@/components/catalog/CatalogPresentation";
import PageViewTracker from "@/components/catalog/PageViewTracker";

// Catálogo público: sempre busca os dados atuais do banco, sem cache.
// Necessário porque revalidatePath() ao salvar no editor só invalida o
// cache do processo Next.js onde a Server Action rodou — se o lead salva
// localmente, a produção (Vercel) nunca fica sabendo e serviria dados
// desatualizados indefinidamente sem esta diretiva.
export const dynamic = "force-dynamic";

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
