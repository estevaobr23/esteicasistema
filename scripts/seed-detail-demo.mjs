import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

async function loadLocalEnv() {
  const contents = await fs.readFile(path.join(projectRoot, ".env.local"), "utf8");
  for (const line of contents.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

await loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios em .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function assertResult(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

const targetSlug = process.argv[2] || "detail-teste";
const business = assertResult(
  await supabase.from("businesses").select("*").eq("slug", targetSlug).single(),
  `Negócio ${targetSlug}`,
);

const bucket = "business-media";
const bucketResult = await supabase.storage.getBucket(bucket);
if (bucketResult.error) {
  assertResult(
    await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: "10MB",
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    }),
    `Criar bucket ${bucket}`,
  );
}

const imageFiles = {
  wash: "lavagem-tecnica.png",
  interior: "higienizacao-interna.png",
  polish: "polimento-tecnico.png",
  ceramic: "vitrificacao-ceramica.png",
  plastics: "revitalizacao-plasticos.png",
  engine: "limpeza-motor.png",
  glass: "cristalizacao-vidros.png",
  premium: "detalhamento-premium.png",
  polishBefore: "portfolio-polimento-antes.png",
  polishAfter: "portfolio-polimento-depois.png",
  interiorBefore: "portfolio-interior-antes.png",
  interiorAfter: "portfolio-interior-depois.png",
};

const images = {};
for (const [key, filename] of Object.entries(imageFiles)) {
  const localPath = path.join(projectRoot, "public", "images", "demo-detail-teste", filename);
  const storagePath = `${business.id}/demo-detail-teste/${filename}`;
  const body = await fs.readFile(localPath);
  assertResult(
    await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType: "image/png",
      cacheControl: "3600",
      upsert: true,
    }),
    `Upload ${filename}`,
  );
  images[key] = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
}

const paintVideo = "https://www.youtube.com/watch?v=BvfiK99bx3Q";
const interiorVideo = "https://www.youtube.com/watch?v=0ZdXI0T_-AY";

const serviceSeed = [
  {
    name: "Lavagem Detalhada",
    category: "Lavagem",
    short_description: "Lavagem segura, detalhada e finalizada para devolver brilho sem agredir a pintura.",
    description: "Processo completo com pré-lavagem, técnica de dois baldes, limpeza de rodas e caixas, aspiração e acabamento dos pneus. Ideal para a manutenção periódica do veículo.",
    image_url: images.wash,
    gallery: [images.wash, images.glass, images.premium],
    video_url: null,
    media_mode: "gallery",
    duration_minutes: 150,
    price_type: "vehicle",
    base_price: 179,
    featured: true,
    active: true,
    sort_order: 1,
    cta_label: "Quero agendar a lavagem",
    features: ["Pré-lavagem com snow foam", "Lavagem técnica de baixo contato", "Rodas e caixas de roda", "Aspiração interna", "Vidros internos e externos", "Acabamento de pneus"],
    prices: { hatch: [179, 159], sedan: [199, 179], suv: [239, 219], pickup: [279, 249] },
  },
  {
    name: "Higienização Interna Completa",
    category: "Interior",
    short_description: "Limpeza profunda de bancos, carpetes, forros e detalhes internos.",
    description: "Extração profissional para remover sujeira impregnada, manchas moderadas e odores. O serviço inclui atenção aos trilhos, cantos, console e superfícies de contato.",
    image_url: images.interior,
    gallery: [images.interiorBefore, images.interiorAfter, images.interior],
    video_url: interiorVideo,
    media_mode: "before_after",
    before_image: images.interiorBefore,
    after_image: images.interiorAfter,
    duration_minutes: 300,
    price_type: "from",
    base_price: 289,
    featured: true,
    active: true,
    sort_order: 2,
    cta_label: "Quero renovar o interior",
    features: ["Aspiração técnica", "Extração de bancos e carpetes", "Limpeza de forro e cintos", "Higienização de painel e console", "Neutralização de odores", "Acabamento sem brilho artificial"],
    prices: {},
  },
  {
    name: "Polimento Técnico",
    category: "Correção de pintura",
    short_description: "Correção de riscos, hologramas e marcas de lavagem com acabamento de alto brilho.",
    description: "Após diagnóstico da pintura, fazemos descontaminação e correção em etapas para recuperar profundidade e reflexo, respeitando a espessura do verniz.",
    image_url: images.polish,
    gallery: [images.polishBefore, images.polishAfter, images.polish],
    video_url: paintVideo,
    media_mode: "before_after",
    before_image: images.polishBefore,
    after_image: images.polishAfter,
    duration_minutes: 600,
    price_type: "from",
    base_price: 499,
    featured: true,
    active: true,
    sort_order: 3,
    cta_label: "Quero avaliar a pintura",
    features: ["Inspeção com luz técnica", "Descontaminação química e clay bar", "Correção em múltiplas etapas", "Refino de acabamento", "Proteção final da pintura", "Orientação de manutenção"],
    prices: {},
  },
  {
    name: "Vitrificação Premium",
    category: "Proteção",
    short_description: "Revestimento cerâmico para brilho intenso, repelência e proteção prolongada.",
    description: "Preparação minuciosa da superfície e aplicação controlada de coating cerâmico com cura técnica. Indicado para quem deseja facilitar a manutenção e preservar o acabamento.",
    image_url: images.ceramic,
    gallery: [images.ceramic, images.glass, images.premium],
    video_url: paintVideo,
    media_mode: "gallery",
    duration_minutes: 720,
    price_type: "from",
    base_price: 899,
    featured: true,
    active: true,
    sort_order: 4,
    cta_label: "Quero proteger meu carro",
    features: ["Lavagem técnica e descontaminação", "Preparação da pintura", "Coating cerâmico profissional", "Proteção de até 3 anos", "Alta repelência à água", "Inspeção pós-cura"],
    prices: {},
  },
  {
    name: "Revitalização de Plásticos",
    category: "Acabamento",
    short_description: "Recuperação visual de plásticos externos e internos ressecados ou desbotados.",
    description: "Limpeza profunda e aplicação de produto específico para devolver cor uniforme e proteção UV, sem deixar aspecto oleoso.",
    image_url: images.plastics,
    gallery: [images.plastics, images.interior],
    video_url: null,
    media_mode: "single_photo",
    duration_minutes: 120,
    price_type: "from",
    base_price: 189,
    featured: false,
    active: true,
    sort_order: 5,
    cta_label: "Quero revitalizar os plásticos",
    features: ["Limpeza e descontaminação", "Restauração de cor", "Proteção contra raios UV", "Acabamento seco ao toque"],
    prices: {},
  },
  {
    name: "Limpeza Técnica de Motor",
    category: "Motor",
    short_description: "Limpeza controlada do cofre do motor com proteção dos componentes sensíveis.",
    description: "Desengraxe localizado, limpeza manual e acabamento dos plásticos com processo seguro para o compartimento do motor.",
    image_url: images.engine,
    gallery: [images.engine, images.plastics],
    video_url: null,
    media_mode: "single_photo",
    duration_minutes: 100,
    price_type: "fixed",
    base_price: 179,
    featured: false,
    active: true,
    sort_order: 6,
    cta_label: "Quero limpar o motor",
    features: ["Proteção de pontos sensíveis", "Desengraxe controlado", "Limpeza manual detalhada", "Acabamento de mangueiras e plásticos"],
    prices: {},
  },
  {
    name: "Cristalização de Vidros",
    category: "Proteção",
    short_description: "Tratamento hidrofóbico para melhor visibilidade e manutenção mais fácil.",
    description: "Descontaminação do para-brisa e aplicação de proteção repelente de água, melhorando a visibilidade em dias de chuva.",
    image_url: images.glass,
    gallery: [images.glass, images.wash],
    video_url: null,
    media_mode: "single_photo",
    duration_minutes: 75,
    price_type: "fixed",
    base_price: 149,
    featured: false,
    active: true,
    sort_order: 7,
    cta_label: "Quero proteger os vidros",
    features: ["Limpeza técnica", "Descontaminação do para-brisa", "Aplicação hidrofóbica", "Teste de repelência"],
    prices: {},
  },
  {
    name: "Detailing Premium Completo",
    category: "Detailing",
    short_description: "Transformação completa de exterior, interior e proteção em um único serviço.",
    description: "Nosso atendimento mais completo: lavagem detalhada, correção de pintura, proteção cerâmica, renovação interna e acabamento minucioso.",
    image_url: images.premium,
    gallery: [images.premium, images.polishAfter, images.interiorAfter, images.ceramic, images.engine],
    video_url: paintVideo,
    media_mode: "youtube",
    duration_minutes: 960,
    price_type: "from",
    base_price: 1290,
    featured: true,
    active: true,
    sort_order: 8,
    cta_label: "Quero o detailing completo",
    features: ["Diagnóstico completo do veículo", "Lavagem detalhada", "Correção de pintura", "Proteção cerâmica", "Higienização interna", "Entrega técnica e cuidados pós-serviço"],
    prices: {},
  },
];

const existingServices = assertResult(
  await supabase.from("services").select("id,name").eq("business_id", business.id),
  "Listar serviços",
);
const serviceIds = {};

for (const { features, prices, ...service } of serviceSeed) {
  const existing = existingServices.find((item) => item.name === service.name);
  const result = existing
    ? await supabase.from("services").update(service).eq("id", existing.id).select("id").single()
    : await supabase.from("services").insert({ business_id: business.id, ...service }).select("id").single();
  const saved = assertResult(result, `Salvar serviço ${service.name}`);
  serviceIds[service.name] = saved.id;

  assertResult(await supabase.from("service_features").delete().eq("service_id", saved.id), `Limpar itens de ${service.name}`);
  assertResult(await supabase.from("service_prices").delete().eq("service_id", saved.id), `Limpar preços de ${service.name}`);

  assertResult(
    await supabase.from("service_features").insert(
      features.map((label, sort_order) => ({ service_id: saved.id, label, sort_order })),
    ),
    `Criar itens de ${service.name}`,
  );

  const priceRows = Object.entries(prices).map(([vehicle_type, [price, promotional_price]]) => ({
    service_id: saved.id,
    vehicle_type,
    price,
    promotional_price,
    active: true,
  }));
  if (priceRows.length) {
    assertResult(await supabase.from("service_prices").insert(priceRows), `Criar preços de ${service.name}`);
  }
}

const packageSeed = [
  {
    name: "Essencial Bem Cuidado",
    description: "Manutenção completa para o carro ficar limpo, protegido e pronto para a rotina.",
    image_url: images.wash,
    gallery: [images.wash, images.glass],
    media_mode: "single_photo",
    video_url: null,
    video_poster_url: null,
    duration_minutes: 210,
    price: 328,
    promotional_price: 279,
    featured: false,
    active: true,
    cta_label: "Quero o Essencial",
    sort_order: 1,
    services: ["Lavagem Detalhada", "Cristalização de Vidros"],
    benefits: [["Lavagem segura", "droplets", "cyan"], ["Vidros protegidos", "shield", "violet"], ["Economia no combo", "sparkles", "emerald"]],
  },
  {
    name: "Interior Renovado",
    description: "Pacote para recuperar conforto, higiene e acabamento do habitáculo.",
    image_url: images.interiorAfter,
    gallery: [images.interiorBefore, images.interiorAfter, images.plastics],
    media_mode: "gallery",
    video_url: interiorVideo,
    video_poster_url: images.interiorAfter,
    duration_minutes: 390,
    price: 478,
    promotional_price: 429,
    featured: false,
    active: true,
    cta_label: "Quero renovar o interior",
    sort_order: 2,
    services: ["Higienização Interna Completa", "Revitalização de Plásticos"],
    benefits: [["Higienização profunda", "sparkles", "violet"], ["Plásticos revitalizados", "wand", "orange"], ["Interior mais saudável", "shield", "emerald"]],
  },
  {
    name: "Proteção Total 3 Anos",
    description: "Correção e proteção premium para preservar a pintura e multiplicar o brilho.",
    image_url: images.ceramic,
    gallery: [images.polishBefore, images.polishAfter, images.ceramic, images.glass],
    media_mode: "gallery",
    video_url: paintVideo,
    video_poster_url: images.ceramic,
    duration_minutes: 1320,
    price: 1547,
    promotional_price: 1290,
    featured: true,
    active: true,
    cta_label: "Quero a Proteção Total",
    sort_order: 3,
    services: ["Polimento Técnico", "Vitrificação Premium", "Cristalização de Vidros"],
    benefits: [["Correção de pintura", "wand", "orange"], ["Coating de até 3 anos", "shield", "emerald"], ["Brilho profundo", "sparkles", "violet"], ["Alta repelência", "droplets", "cyan"]],
  },
  {
    name: "Detail Signature",
    description: "Experiência completa, do motor ao acabamento final, para uma transformação de alto padrão.",
    image_url: images.premium,
    gallery: [images.premium, images.polishAfter, images.interiorAfter, images.engine, images.ceramic],
    media_mode: "youtube",
    video_url: paintVideo,
    video_poster_url: images.premium,
    duration_minutes: 1800,
    price: 2186,
    promotional_price: 1790,
    featured: true,
    active: true,
    cta_label: "Quero o Detail Signature",
    sort_order: 4,
    services: ["Lavagem Detalhada", "Higienização Interna Completa", "Polimento Técnico", "Vitrificação Premium", "Limpeza Técnica de Motor"],
    benefits: [["Transformação completa", "car", "violet"], ["Exterior protegido", "shield", "emerald"], ["Interior renovado", "wand", "orange"], ["Condição exclusiva", "sparkles", "amber"]],
  },
];

const existingPackages = assertResult(
  await supabase.from("packages").select("id,name").eq("business_id", business.id),
  "Listar pacotes",
);
const packageIds = {};

for (const { services, benefits, ...packageData } of packageSeed) {
  const existing = existingPackages.find((item) => item.name === packageData.name);
  const result = existing
    ? await supabase.from("packages").update(packageData).eq("id", existing.id).select("id").single()
    : await supabase.from("packages").insert({ business_id: business.id, ...packageData }).select("id").single();
  const saved = assertResult(result, `Salvar pacote ${packageData.name}`);
  packageIds[packageData.name] = saved.id;

  assertResult(await supabase.from("package_services").delete().eq("package_id", saved.id), `Limpar serviços do pacote ${packageData.name}`);
  assertResult(await supabase.from("package_benefits").delete().eq("package_id", saved.id), `Limpar benefícios do pacote ${packageData.name}`);

  assertResult(
    await supabase.from("package_services").insert(
      services.map((name) => ({ package_id: saved.id, service_id: serviceIds[name] })),
    ),
    `Vincular serviços do pacote ${packageData.name}`,
  );
  assertResult(
    await supabase.from("package_benefits").insert(
      benefits.map(([label, icon_key, color_key], sort_order) => ({ package_id: saved.id, label, icon_key, color_key, sort_order })),
    ),
    `Criar benefícios do pacote ${packageData.name}`,
  );
}

const portfolioSeed = [
  { title: "Sedan preto — correção de pintura", description: "Remoção de marcas circulares e recuperação da profundidade do verniz.", category: "Polimento", vehicle: "Sedan preto", vehicle_make: "Honda", vehicle_model: "Accord", vehicle_year: 2019, service_id: serviceIds["Polimento Técnico"], media_type: "before_after", before_image: images.polishBefore, after_image: images.polishAfter, image_url: images.polishAfter, gallery: [images.polishBefore, images.polishAfter], video_url: null, instagram_url: null, featured: true, active: true, sort_order: 1 },
  { title: "SUV familiar — interior renovado", description: "Bancos claros e piso recuperados com extração e acabamento natural.", category: "Interior", vehicle: "SUV cinza-claro", vehicle_make: "Kia", vehicle_model: "Sorento", vehicle_year: 2020, service_id: serviceIds["Higienização Interna Completa"], media_type: "before_after", before_image: images.interiorBefore, after_image: images.interiorAfter, image_url: images.interiorAfter, gallery: [images.interiorBefore, images.interiorAfter], video_url: null, instagram_url: null, featured: true, active: true, sort_order: 2 },
  { title: "Sedan vermelho — Detail Signature", description: "Entrega completa com acabamento de alto brilho e presença de carro novo.", category: "Detailing", vehicle: "Sedan vermelho", vehicle_make: "Mazda", vehicle_model: "3", vehicle_year: 2023, service_id: serviceIds["Detailing Premium Completo"], media_type: "single_photo", before_image: null, after_image: null, image_url: images.premium, gallery: [images.premium], video_url: null, instagram_url: null, featured: true, active: true, sort_order: 3 },
  { title: "Proteção cerâmica em azul metálico", description: "Preparação, aplicação de coating e controle de cura em ambiente técnico.", category: "Vitrificação", vehicle: "Hatch azul", vehicle_make: "Volkswagen", vehicle_model: "Golf", vehicle_year: 2022, service_id: serviceIds["Vitrificação Premium"], media_type: "gallery", before_image: null, after_image: null, image_url: images.ceramic, gallery: [images.ceramic, images.glass, images.premium], video_url: null, instagram_url: null, featured: true, active: true, sort_order: 4 },
  { title: "Cofre do motor recuperado", description: "Limpeza controlada e acabamento uniforme de plásticos e mangueiras.", category: "Motor", vehicle: "Sedan médio", vehicle_make: "Toyota", vehicle_model: "Corolla", vehicle_year: 2018, service_id: serviceIds["Limpeza Técnica de Motor"], media_type: "single_photo", before_image: null, after_image: null, image_url: images.engine, gallery: [images.engine], video_url: null, instagram_url: null, featured: false, active: true, sort_order: 5 },
  { title: "Processo real de correção e proteção", description: "Vídeo demonstrativo usado para apresentar o nível de cuidado de um processo completo.", category: "Vídeo", vehicle: "Demonstração técnica", vehicle_make: null, vehicle_model: null, vehicle_year: null, service_id: serviceIds["Polimento Técnico"], media_type: "youtube", before_image: null, after_image: null, image_url: images.polishAfter, gallery: [], video_url: paintVideo, instagram_url: null, featured: false, active: true, sort_order: 6 },
];

const existingPortfolio = assertResult(
  await supabase.from("portfolio_items").select("id,title").eq("business_id", business.id),
  "Listar portfólio",
);
const portfolioIds = {};
for (const item of portfolioSeed) {
  const existing = existingPortfolio.find((entry) => entry.title === item.title);
  const result = existing
    ? await supabase.from("portfolio_items").update(item).eq("id", existing.id).select("id").single()
    : await supabase.from("portfolio_items").insert({ business_id: business.id, ...item }).select("id").single();
  const saved = assertResult(result, `Salvar portfólio ${item.title}`);
  portfolioIds[item.title] = saved.id;
}

const schedule = {
  1: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
  2: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
  3: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
  4: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
  5: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
  6: ["08:00", "10:00", "12:00", "14:00"],
};
const currentSlots = assertResult(
  await supabase.from("availability_slots").select("weekday,time").eq("business_id", business.id),
  "Listar horários",
);
const slotKeys = new Set(currentSlots.map((slot) => `${slot.weekday}-${slot.time.slice(0, 5)}`));
const missingSlots = Object.entries(schedule).flatMap(([weekday, times]) =>
  times
    .filter((time) => !slotKeys.has(`${weekday}-${time}`))
    .map((time) => ({ business_id: business.id, weekday: Number(weekday), time, active: true })),
);
if (missingSlots.length) assertResult(await supabase.from("availability_slots").insert(missingSlots), "Criar horários");

const reviewSeed = [
  { customer_name: "Mariana Alves", rating: 5, text: "O interior ficou irreconhecível. As manchas dos bancos saíram e o acabamento ficou muito natural.", source: "whatsapp", review_date: "2026-08-28", service_id: serviceIds["Higienização Interna Completa"] },
  { customer_name: "Rafael Moreira", rating: 5, text: "Explicaram cada etapa do polimento e entregaram o carro com um reflexo absurdo. Atendimento muito profissional.", source: "manual", review_date: "2026-08-21", service_id: serviceIds["Polimento Técnico"], portfolio_item_id: portfolioIds["Sedan preto — correção de pintura"] },
  { customer_name: "Camila Torres", rating: 5, text: "A lavagem detalhada vale cada minuto. Rodas, cantos e vidros ficaram impecáveis.", source: "whatsapp", review_date: "2026-08-12", service_id: serviceIds["Lavagem Detalhada"] },
  { customer_name: "Bruno Nascimento", rating: 5, text: "Fechei a Proteção Total e gostei da organização, do prazo e principalmente do resultado na pintura.", source: "manual", review_date: "2026-07-30", package_id: packageIds["Proteção Total 3 Anos"] },
  { customer_name: "Juliana Prado", rating: 5, text: "Meu SUV voltou limpo de verdade, inclusive nos trilhos e cantos onde ninguém costuma alcançar.", source: "whatsapp", review_date: "2026-07-18", service_id: serviceIds["Higienização Interna Completa"], portfolio_item_id: portfolioIds["SUV familiar — interior renovado"] },
  { customer_name: "Felipe Costa", rating: 5, text: "A vitrificação facilitou demais as lavagens. A água escorre e o brilho permanece por muito mais tempo.", source: "manual", review_date: "2026-07-09", service_id: serviceIds["Vitrificação Premium"] },
  { customer_name: "Larissa Mendes", rating: 5, text: "Gostei porque os plásticos recuperaram a cor sem aquele aspecto engordurado.", source: "instagram", review_date: "2026-06-26", service_id: serviceIds["Revitalização de Plásticos"] },
  { customer_name: "Diego Martins", rating: 5, text: "Motor limpo com muito cuidado. Ficou claro que a equipe sabe proteger os componentes antes do serviço.", source: "whatsapp", review_date: "2026-06-14", service_id: serviceIds["Limpeza Técnica de Motor"] },
  { customer_name: "Paulo Henrique", rating: 4, text: "Ótimo resultado e comunicação durante todo o processo. Voltarei para a manutenção.", source: "manual", review_date: "2026-05-29", package_id: packageIds["Essencial Bem Cuidado"] },
  { customer_name: "Amanda Ribeiro", rating: 5, text: "O Detail Signature entregou exatamente o que eu esperava: carro impecável por dentro e por fora.", source: "whatsapp", review_date: "2026-05-17", package_id: packageIds["Detail Signature"], portfolio_item_id: portfolioIds["Sedan vermelho — Detail Signature"] },
];
const demoNames = reviewSeed.map((review) => review.customer_name);
assertResult(
  await supabase.from("reviews").delete().eq("business_id", business.id).in("customer_name", demoNames),
  "Limpar avaliações da demonstração",
);
assertResult(
  await supabase.from("reviews").insert(reviewSeed.map((review) => ({ business_id: business.id, active: true, ...review }))),
  "Criar avaliações",
);

const sectionIds = ["servicos", "destaques", "antes_depois", "branding_video", "pacotes", "horarios", "avaliacoes", "sobre", "localizacao"];
const baseBlock = (instanceId, type, patch = {}) => ({
  instanceId,
  type,
  visible: true,
  variant: "default",
  content: {},
  dataSource: { mode: "all", items: [], limit: 12 },
  style: { width: "standard", spacing: "comfortable", align: "center", background: "auto" },
  responsive: { columns: { mobile: 1, tablet: 2, desktop: 3 }, hideOnMobile: false, hideOnDesktop: false },
  ...patch,
});

const catalogLayout = {
  schemaVersion: 1,
  templateId: business.template_id || "classico_dark",
  blocks: [
    baseBlock("demo-destaques", "destaques", { variant: "cards", content: { eyebrow: "Mais escolhidos", title: "Comece por aqui", description: "Os serviços que mais entregam transformação, proteção e praticidade." }, dataSource: { mode: "featured", items: [], limit: 3 } }),
    baseBlock("demo-resultados", "antes_depois", { variant: "featured", content: { eyebrow: "Resultados reais", title: "Veja a transformação", description: "Compare o estado inicial com o acabamento depois do nosso processo." }, dataSource: { mode: "featured", items: [], limit: 2 }, responsive: { columns: { mobile: 1, tablet: 2, desktop: 2 }, hideOnMobile: false, hideOnDesktop: false } }),
    baseBlock("demo-servicos", "servicos", { variant: "grid", content: { eyebrow: "Escolha seu cuidado", title: "Serviços", description: "Compare opções, benefícios e valores para encontrar o cuidado ideal." }, dataSource: { mode: "all", items: [], limit: 12 } }),
    baseBlock("demo-processo", "text", { variant: "card", content: { eyebrow: "Escolha com segurança", title: "Tudo explicado antes do serviço", body: "Veja o que está incluído, compare os formatos e peça uma recomendação para o seu veículo.", buttonLabel: "", buttonUrl: "" }, style: { width: "compact", spacing: "comfortable", align: "center", background: "alternate" } }),
    baseBlock("demo-pacotes", "pacotes", { variant: "cards", content: { eyebrow: "Melhor custo-benefício", title: "Pacotes completos", description: "Combinações prontas para economizar e cuidar do veículo por inteiro." }, dataSource: { mode: "all", items: [], limit: 8 }, responsive: { columns: { mobile: 1, tablet: 2, desktop: 2 }, hideOnMobile: false, hideOnDesktop: false } }),
    baseBlock("demo-video", "video", { variant: "wide", content: { title: "Veja o nível do processo", description: "Uma demonstração completa de correção de pintura e acabamento profissional.", videoUrl: paintVideo, aspectRatio: "16:9" }, style: { width: "wide", spacing: "comfortable", align: "center", background: "alternate" } }),
    baseBlock("demo-avaliacoes", "avaliacoes", { variant: "carousel", content: { eyebrow: "Confiança", title: "Quem fez, recomenda", description: "Experiências de clientes que já cuidaram do carro com a gente." }, dataSource: { mode: "all", items: [], limit: 10 } }),
    baseBlock("demo-sobre", "sobre", { variant: "split", content: { eyebrow: "Nossa forma de trabalhar", title: "Cuidado que aparece no resultado", description: "" }, style: { width: "compact", spacing: "comfortable", align: "center", background: "alternate" } }),
    baseBlock("demo-horarios", "horarios", { variant: "chips", content: { eyebrow: "Agenda", title: "Próximos horários", description: "Escolha uma opção e fale com a equipe para confirmar." }, style: { width: "compact", spacing: "comfortable", align: "center", background: "auto" }, responsive: { columns: { mobile: 1, tablet: 2, desktop: 2 }, hideOnMobile: false, hideOnDesktop: false } }),
    baseBlock("demo-localizacao", "localizacao", { variant: "contact", content: { eyebrow: "Atendimento", title: "Onde estamos", description: "Consulte a localização e planeje sua visita." }, responsive: { columns: { mobile: 1, tablet: 2, desktop: 2 }, hideOnMobile: false, hideOnDesktop: false } }),
    baseBlock("demo-cta", "cta", { variant: "full", content: { title: "Pronto para transformar seu carro?", description: "Conte para a nossa equipe o modelo e o resultado que você procura.", buttonLabel: "Pedir avaliação no WhatsApp", message: "Olá! Vi o catálogo e gostaria de uma avaliação para o meu carro." }, style: { width: "full", spacing: "spacious", align: "center", background: "auto" } }),
  ],
};

assertResult(
  await supabase
    .from("businesses")
    .update({
      cover_url: images.premium,
      headline: "Detalhamento automotivo com resultado que aparece",
      about: "Cuidamos de cada veículo com diagnóstico, técnica e acabamento minucioso. Da manutenção semanal à proteção cerâmica, você acompanha as opções com clareza e escolhe o nível de cuidado ideal para o seu carro.",
      highlights: ["Atendimento com hora marcada", "Produtos profissionais", "Fotos reais dos resultados", "Garantia de acabamento"],
      branding_video_url: paintVideo,
      sections_config: sectionIds.map((id) => ({ id, visible: true })),
      catalog_layout: catalogLayout,
      catalog_layout_version: 1,
      catalog_updated_at: new Date().toISOString(),
      published: true,
      onboarding_completo: true,
    })
    .eq("id", business.id),
  "Atualizar catálogo",
);

console.log(JSON.stringify({
  business: { id: business.id, name: business.name, slug: business.slug },
  uploadedImages: Object.keys(images).length,
  services: serviceSeed.length,
  packages: packageSeed.length,
  portfolioItems: portfolioSeed.length,
  reviews: reviewSeed.length,
  addedAvailabilitySlots: missingSlots.length,
  catalogUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/${business.slug}`,
}, null, 2));
