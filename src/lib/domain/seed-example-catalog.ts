import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CatalogLayout } from "@/lib/catalog-builder/schema";
import { createTemplateLayout } from "@/lib/catalog-builder/template-layouts";
import type { TemplateId } from "@/lib/domain/catalog-templates";
import type { Database, Json, TablesInsert } from "@/lib/supabase/types";

const EXAMPLE_PREFIX = "onboarding-example";
const BUCKET = "business-media";
const PAINT_VIDEO = "https://www.youtube.com/watch?v=BvfiK99bx3Q";
const INTERIOR_VIDEO = "https://www.youtube.com/watch?v=0ZdXI0T_-AY";

type AdminClient = SupabaseClient<Database>;
type Plano = "essencial" | "profissional";

type SeedOptions = {
  supabase: AdminClient;
  businessId: string;
  businessName: string;
  plano: Plano;
  templateId?: TemplateId;
};

type ImageMap = Record<
  "wash" | "interior" | "polish" | "ceramic" | "plastics" | "engine" | "premium" | "polishBefore" | "polishAfter" | "interiorBefore" | "interiorAfter" | "woman" | "man" | "logo",
  string
>;

const imageFiles = {
  wash: "lavagem-tecnica.png",
  interior: "higienizacao-interna.png",
  polish: "polimento-tecnico.png",
  ceramic: "vitrificacao-ceramica.png",
  plastics: "revitalizacao-plasticos.png",
  engine: "limpeza-motor.png",
  premium: "detalhamento-premium.png",
  polishBefore: "portfolio-polimento-antes.png",
  polishAfter: "portfolio-polimento-depois.png",
  interiorBefore: "portfolio-interior-antes.png",
  interiorAfter: "portfolio-interior-depois.png",
  woman: "cliente-exemplo-mulher.jpg",
  man: "cliente-exemplo-homem.jpg",
} as const;

export function isExampleCatalogLayout(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const blocks = (value as { blocks?: unknown }).blocks;
  return Array.isArray(blocks) && blocks.some((block) => {
    if (!block || typeof block !== "object" || Array.isArray(block)) return false;
    return String((block as { instanceId?: unknown }).instanceId ?? "").startsWith(EXAMPLE_PREFIX);
  });
}

export function createExampleCatalogLayout(templateId: TemplateId): CatalogLayout {
  const layout = createTemplateLayout(templateId);
  return {
    ...layout,
    blocks: layout.blocks.map((block, index) => ({
      ...block,
      instanceId: `${EXAMPLE_PREFIX}-${index + 1}-${block.type}`,
    })),
  };
}

function assertNoError(result: { error: { message: string } | null }, label: string) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "SE";
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ?? character);
}

function createLogoSvg(name: string) {
  const monogram = escapeXml(initials(name));
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#252a31"/><stop offset="1" stop-color="#090b0e"/></linearGradient></defs><circle cx="256" cy="256" r="244" fill="url(#g)" stroke="#ef233c" stroke-width="16"/><path d="M116 334c47 34 233 34 280 0" fill="none" stroke="#ef233c" stroke-width="12" stroke-linecap="round"/><text x="256" y="300" text-anchor="middle" fill="#fff" font-family="Arial,sans-serif" font-size="150" font-weight="800">${monogram}</text></svg>`);
}

async function uploadExampleImages(supabase: AdminClient, businessId: string, businessName: string): Promise<ImageMap> {
  const sourceDir = path.join(process.cwd(), "public", "images", "demo-detail-teste");
  const entries = await Promise.all(Object.entries(imageFiles).map(async ([key, filename]) => {
    const body = await fs.readFile(path.join(sourceDir, filename));
    const storagePath = `${businessId}/onboarding-example/${filename}`;
    const contentType = filename.endsWith(".jpg") ? "image/jpeg" : "image/png";
    const result = await supabase.storage.from(BUCKET).upload(storagePath, body, { contentType, cacheControl: "31536000", upsert: true });
    assertNoError(result, `Enviar imagem de exemplo ${filename}`);
    return [key, supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl] as const;
  }));

  const logoPath = `${businessId}/onboarding-example/logo-monograma.svg`;
  const logoResult = await supabase.storage.from(BUCKET).upload(logoPath, createLogoSvg(businessName), { contentType: "image/svg+xml", cacheControl: "31536000", upsert: true });
  assertNoError(logoResult, "Enviar logo de exemplo");
  return { ...Object.fromEntries(entries), logo: supabase.storage.from(BUCKET).getPublicUrl(logoPath).data.publicUrl } as ImageMap;
}

export async function seedExampleCatalogContent({ supabase, businessId, businessName, plano, templateId = "classico_dark" }: SeedOptions) {
  const [servicesResult, packagesResult, portfolioResult, reviewsResult] = await Promise.all([
    supabase.from("services").select("id,name").eq("business_id", businessId),
    supabase.from("packages").select("id,name").eq("business_id", businessId),
    supabase.from("portfolio_items").select("id,title").eq("business_id", businessId),
    supabase.from("reviews").select("id,customer_name").eq("business_id", businessId),
  ]);
  [servicesResult, packagesResult, portfolioResult, reviewsResult].forEach((result, index) => assertNoError(result, `Consultar conteúdo existente ${index + 1}`));

  const exampleServiceNames = new Set(["Lavagem Detalhada", "Higienização Interna", "Polimento Técnico", "Vitrificação", "Revitalização de Plásticos", "Limpeza de Motor"]);
  const existingServices = servicesResult.data ?? [];
  const hasForeignContent = existingServices.some((service) => !exampleServiceNames.has(service.name)) || (packagesResult.data?.length ?? 0) > 0 || (portfolioResult.data?.length ?? 0) > 0 || (reviewsResult.data?.length ?? 0) > 0;
  if (hasForeignContent) return { seeded: false, reason: "business_has_content" as const };

  const images = await uploadExampleImages(supabase, businessId, businessName);
  const activeLimit = plano === "essencial" ? 3 : 6;
  const services = [
    { name: "Lavagem Detalhada", category: "lavagem", short_description: "Exemplo editável: lavagem completa com atenção aos detalhes.", description: "Edite esta descrição para explicar seu processo de lavagem, o tempo médio e o resultado entregue.", image_url: images.wash, gallery: [images.wash, images.ceramic, images.premium], video_url: null, media_mode: "gallery", before_image: null, after_image: null, duration_minutes: 150, price_type: "vehicle", base_price: 150, featured: true, cta_label: "Quero saber mais", features: ["Pré-lavagem", "Lavagem segura", "Rodas e caixas", "Aspiração", "Acabamento"], prices: { hatch: [150, 140], sedan: [170, 160], suv: [210, 195], pickup: [240, 225] } },
    { name: "Higienização Interna", category: "higienizacao", short_description: "Exemplo editável: limpeza profunda de bancos, carpetes e forros.", description: "Use este espaço para detalhar o que está incluso na higienização e quais resultados o cliente pode esperar.", image_url: images.interior, gallery: [images.interiorBefore, images.interiorAfter, images.interior], video_url: INTERIOR_VIDEO, media_mode: "before_after", before_image: images.interiorBefore, after_image: images.interiorAfter, duration_minutes: 300, price_type: "from", base_price: 320, featured: true, cta_label: "Quero renovar o interior", features: ["Aspiração profunda", "Extração de bancos", "Limpeza de carpetes", "Neutralização de odores"], prices: {} },
    { name: "Polimento Técnico", category: "polimento", short_description: "Exemplo editável: correção de marcas e recuperação do brilho.", description: "Substitua este texto pelo seu método de avaliação e pelas etapas reais do seu polimento.", image_url: images.polish, gallery: [images.polishBefore, images.polishAfter, images.polish], video_url: PAINT_VIDEO, media_mode: "before_after", before_image: images.polishBefore, after_image: images.polishAfter, duration_minutes: 600, price_type: "from", base_price: 550, featured: true, cta_label: "Quero avaliar a pintura", features: ["Diagnóstico da pintura", "Descontaminação", "Correção em etapas", "Refino de acabamento"], prices: {} },
    { name: "Vitrificação", category: "protecao", short_description: "Exemplo editável: proteção cerâmica e brilho prolongado.", description: "Edite a durabilidade, a preparação e os cuidados oferecidos na sua proteção de pintura.", image_url: images.ceramic, gallery: [images.ceramic, images.polishAfter, images.premium], video_url: PAINT_VIDEO, media_mode: "youtube", before_image: null, after_image: null, duration_minutes: 720, price_type: "from", base_price: 950, featured: true, cta_label: "Quero proteger meu carro", features: ["Preparação da pintura", "Aplicação controlada", "Alta repelência", "Orientação de manutenção"], prices: {} },
    { name: "Revitalização de Plásticos", category: "interior", short_description: "Exemplo editável: renovação visual com proteção UV.", description: "Explique aqui quais superfícies são tratadas e qual acabamento seu processo oferece.", image_url: images.plastics, gallery: [images.plastics, images.interiorAfter], video_url: null, media_mode: "single_photo", before_image: null, after_image: null, duration_minutes: 120, price_type: "fixed", base_price: 200, featured: false, cta_label: "Quero revitalizar", features: ["Limpeza profunda", "Restauração de cor", "Proteção UV"], prices: {} },
    { name: "Limpeza de Motor", category: "motor", short_description: "Exemplo editável: limpeza controlada do cofre do motor.", description: "Adapte este texto às proteções, produtos e cuidados usados pela sua equipe.", image_url: images.engine, gallery: [images.engine], video_url: null, media_mode: "single_photo", before_image: null, after_image: null, duration_minutes: 100, price_type: "fixed", base_price: 190, featured: false, cta_label: "Quero limpar o motor", features: ["Proteção de componentes", "Desengraxe controlado", "Acabamento técnico"], prices: {} },
  ];

  const serviceIds: Record<string, string> = {};
  for (const [index, seed] of services.entries()) {
    const { features, prices, ...serviceData } = seed;
    const existing = existingServices.find((service) => service.name === seed.name);
    const payload: TablesInsert<"services"> = { business_id: businessId, ...serviceData, gallery: serviceData.gallery as Json, active: index < activeLimit, sort_order: index + 1 };
    const savedResult = existing
      ? await supabase.from("services").update(payload).eq("id", existing.id).select("id").single()
      : await supabase.from("services").insert(payload).select("id").single();
    assertNoError(savedResult, `Salvar serviço de exemplo ${seed.name}`);
    const serviceId = savedResult.data?.id;
    if (!serviceId) throw new Error(`Serviço de exemplo sem id: ${seed.name}`);
    serviceIds[seed.name] = serviceId;
    await Promise.all([
      supabase.from("service_features").delete().eq("service_id", serviceId),
      supabase.from("service_prices").delete().eq("service_id", serviceId),
    ]);
    assertNoError(await supabase.from("service_features").insert(features.map((label, sort_order) => ({ service_id: serviceId, label, sort_order }))), `Criar itens de ${seed.name}`);
    const priceRows = Object.entries(prices).map(([vehicle_type, values]) => ({ service_id: serviceId, vehicle_type, price: values[0], promotional_price: values[1], active: true }));
    if (priceRows.length) assertNoError(await supabase.from("service_prices").insert(priceRows), `Criar preços de ${seed.name}`);
  }

  const packages = [
    { name: "Pacote Essencial — exemplo", description: "Exemplo editável de pacote para manutenção e acabamento.", image_url: images.wash, gallery: [images.wash, images.plastics], media_mode: "gallery", video_url: null, video_poster_url: null, duration_minutes: 240, price: 360, promotional_price: 310, featured: false, active: true, cta_label: "Quero este pacote", sort_order: 1, services: ["Lavagem Detalhada", "Revitalização de Plásticos"], benefits: [["Cuidado completo", "sparkles", "violet"], ["Acabamento protegido", "shield", "emerald"], ["Valor de exemplo", "car", "cyan"]] },
    { name: "Interior Completo — exemplo", description: "Exemplo editável de combo para limpeza e renovação interna.", image_url: images.interiorAfter, gallery: [images.interiorBefore, images.interiorAfter, images.plastics], media_mode: "gallery", video_url: INTERIOR_VIDEO, video_poster_url: images.interiorAfter, duration_minutes: 420, price: 560, promotional_price: 480, featured: false, active: true, cta_label: "Quero renovar o interior", sort_order: 2, services: ["Higienização Interna", "Revitalização de Plásticos"], benefits: [["Limpeza profunda", "sparkles", "violet"], ["Conforto renovado", "wand", "orange"], ["Acabamento natural", "shield", "emerald"]] },
    { name: "Proteção e Brilho — exemplo", description: "Exemplo editável de oferta premium com correção e proteção.", image_url: images.ceramic, gallery: [images.polishBefore, images.polishAfter, images.ceramic], media_mode: "gallery", video_url: PAINT_VIDEO, video_poster_url: images.ceramic, duration_minutes: 1320, price: 1690, promotional_price: 1420, featured: true, active: true, cta_label: "Quero proteção e brilho", sort_order: 3, services: ["Polimento Técnico", "Vitrificação"], benefits: [["Correção de pintura", "wand", "orange"], ["Proteção cerâmica", "shield", "emerald"], ["Brilho profundo", "sparkles", "violet"]] },
  ];
  const packageIds: Record<string, string> = {};
  for (const seed of packages) {
    const { services: serviceNames, benefits, ...packageData } = seed;
    const result = await supabase.from("packages").insert({ business_id: businessId, ...packageData, gallery: packageData.gallery as Json }).select("id").single();
    assertNoError(result, `Criar pacote ${seed.name}`);
    const packageId = result.data?.id;
    if (!packageId) throw new Error(`Pacote sem id: ${seed.name}`);
    packageIds[seed.name] = packageId;
    assertNoError(await supabase.from("package_services").insert(serviceNames.map((name) => ({ package_id: packageId, service_id: serviceIds[name] }))), `Vincular pacote ${seed.name}`);
    assertNoError(await supabase.from("package_benefits").insert(benefits.map(([label, icon_key, color_key], sort_order) => ({ package_id: packageId, label, icon_key, color_key, sort_order }))), `Criar benefícios ${seed.name}`);
  }

  const portfolio = [
    { title: "Resultado de exemplo — pintura", description: "Substitua por um trabalho real da sua empresa.", category: "Polimento", vehicle: "Sedan de exemplo", service_id: serviceIds["Polimento Técnico"], media_type: "before_after", before_image: images.polishBefore, after_image: images.polishAfter, image_url: images.polishAfter, gallery: [images.polishBefore, images.polishAfter], featured: true, active: true, sort_order: 1 },
    { title: "Resultado de exemplo — interior", description: "Use este espaço para contar o desafio e o resultado.", category: "Interior", vehicle: "SUV de exemplo", service_id: serviceIds["Higienização Interna"], media_type: "before_after", before_image: images.interiorBefore, after_image: images.interiorAfter, image_url: images.interiorAfter, gallery: [images.interiorBefore, images.interiorAfter], featured: true, active: true, sort_order: 2 },
    { title: "Resultado de exemplo — proteção", description: "Troque esta imagem por uma entrega real do seu negócio.", category: "Proteção", vehicle: "Hatch de exemplo", service_id: serviceIds.Vitrificação, media_type: "gallery", image_url: images.ceramic, gallery: [images.ceramic, images.premium], featured: true, active: true, sort_order: 3 },
    { title: "Vídeo de processo — exemplo", description: "Substitua pelo vídeo da sua equipe quando estiver pronto.", category: "Vídeo", vehicle: "Demonstração", service_id: serviceIds["Polimento Técnico"], media_type: "youtube", image_url: images.polishAfter, gallery: [], video_url: PAINT_VIDEO, featured: false, active: true, sort_order: 4 },
  ];
  const portfolioIds: Record<string, string> = {};
  for (const item of portfolio) {
    const result = await supabase.from("portfolio_items").insert({ business_id: businessId, ...item, gallery: item.gallery as Json }).select("id").single();
    assertNoError(result, `Criar portfólio ${item.title}`);
    if (result.data?.id) portfolioIds[item.title] = result.data.id;
  }

  const reviews: TablesInsert<"reviews">[] = [
    { business_id: businessId, customer_name: "Cliente Exemplo 1", customer_photo_url: images.woman, rating: 5, text: "Depoimento de exemplo: substitua este texto por uma avaliação real recebida de um cliente.", source: "manual", service_id: serviceIds["Higienização Interna"], portfolio_item_id: portfolioIds["Resultado de exemplo — interior"], active: true },
    { business_id: businessId, customer_name: "Cliente Exemplo 2", customer_photo_url: images.man, rating: 5, text: "Depoimento de exemplo: conte aqui qual problema foi resolvido e como foi a experiência.", source: "manual", package_id: packageIds["Proteção e Brilho — exemplo"], active: true },
  ];
  assertNoError(await supabase.from("reviews").insert(reviews), "Criar avaliações de exemplo");

  const slots = [1, 2, 3, 4, 5].flatMap((weekday) => ["09:00", "14:00", "16:30"].map((time) => ({ business_id: businessId, weekday, time, active: true })));
  assertNoError(await supabase.from("availability_slots").insert(slots), "Criar horários de exemplo");

  const layout = createExampleCatalogLayout(templateId);
  assertNoError(await supabase.from("businesses").update({
    logo_url: images.logo,
    cover_url: images.premium,
    headline: "Edite este texto: destaque o principal resultado do seu trabalho",
    about: "Exemplo: explique aqui como sua empresa trabalha, quais cuidados oferece e por que o cliente pode confiar no seu serviço.",
    highlights: ["Edite seus diferenciais", "Atendimento com hora marcada", "Produtos profissionais", "Resultados documentados"],
    branding_video_url: PAINT_VIDEO,
    sections_config: ["servicos", "destaques", "antes_depois", "branding_video", "pacotes", "horarios", "avaliacoes", "sobre", "localizacao"].map((id) => ({ id, visible: true })),
    template_id: templateId,
    catalog_layout: layout as unknown as Json,
    catalog_layout_version: 1,
    catalog_updated_at: new Date().toISOString(),
    published: false,
    onboarding_completo: false,
  }).eq("id", businessId), "Atualizar catálogo de exemplo");

  return { seeded: true, services: services.length, activeServices: activeLimit, packages: packages.length, portfolioItems: portfolio.length, reviews: reviews.length };
}
