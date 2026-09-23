import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const projectRoot = path.resolve(import.meta.dirname, "..");
const envContents = await fs.readFile(path.join(projectRoot, ".env.local"), "utf8");

for (const line of envContents.split(/\r?\n/)) {
  if (!line || line.trimStart().startsWith("#")) continue;
  const separator = line.indexOf("=");
  if (separator < 1) continue;
  const key = line.slice(0, separator).trim();
  let value = line.slice(separator + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] ??= value;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios em .env.local.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const bucket = "business-media";
const banners = {
  "detail-teste": {
    filename: "banner-protecao-ceramica.png",
    eyebrow: "Proteção premium",
    title: "Brilho intenso e proteção por até 3 anos",
    description: "Conheça a Vitrificação Premium e preserve a pintura contra sol, chuva e contaminação.",
    buttonLabel: "Ver proteção cerâmica",
  },
  clackcat: {
    filename: "banner-higienizacao-interna.png",
    eyebrow: "Interior renovado",
    title: "Seu carro limpo, confortável e pronto para a rotina",
    description: "Higienização profunda de bancos, carpetes e detalhes internos com acabamento natural.",
    buttonLabel: "Conhecer higienização",
  },
};

function assertResult(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

function createBannerBlock(slug, imageUrl, content) {
  return {
    instanceId: `demo-banner-${slug}`,
    type: "banner",
    visible: true,
    variant: "offer",
    content: {
      eyebrow: content.eyebrow,
      title: content.title,
      description: content.description,
      imageUrl,
      buttonLabel: content.buttonLabel,
      buttonUrl: "#servicos",
    },
    dataSource: { mode: "all", items: [], limit: 12 },
    style: {
      width: "wide",
      spacing: "comfortable",
      align: "left",
      background: "auto",
    },
    responsive: {
      columns: { mobile: 1, tablet: 2, desktop: 2 },
      hideOnMobile: false,
      hideOnDesktop: false,
    },
  };
}

const businesses = assertResult(
  await supabase
    .from("businesses")
    .select("id,slug,catalog_layout,catalog_layout_version")
    .in("slug", Object.keys(banners)),
  "Consultar catálogos de demonstração",
);

if (businesses.length !== Object.keys(banners).length) {
  throw new Error("Nem todos os catálogos de demonstração foram encontrados.");
}

const summary = [];
for (const business of businesses) {
  const config = banners[business.slug];
  const localPath = path.join(projectRoot, "public", "images", "demo-detail-teste", "banners", config.filename);
  const body = await fs.readFile(localPath);
  const storagePath = `${business.id}/banners/${config.filename}`;
  assertResult(
    await supabase.storage.from(bucket).upload(storagePath, body, {
      contentType: "image/png",
      cacheControl: "31536000",
      upsert: true,
    }),
    `Upload do banner ${business.slug}`,
  );
  const imageUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  const currentLayout = business.catalog_layout && typeof business.catalog_layout === "object" && !Array.isArray(business.catalog_layout)
    ? business.catalog_layout
    : { schemaVersion: 1, templateId: "classico_dark", blocks: [] };
  const currentBlocks = Array.isArray(currentLayout.blocks) ? [...currentLayout.blocks] : [];
  const bannerBlock = createBannerBlock(business.slug, imageUrl, config);
  const existingIndex = currentBlocks.findIndex((block) => block?.instanceId === bannerBlock.instanceId);

  if (existingIndex >= 0) {
    currentBlocks[existingIndex] = bannerBlock;
  } else {
    const packagesIndex = currentBlocks.findIndex((block) => block?.type === "pacotes");
    currentBlocks.splice(packagesIndex >= 0 ? packagesIndex + 1 : currentBlocks.length, 0, bannerBlock);
  }

  const nextLayout = { ...currentLayout, schemaVersion: 1, blocks: currentBlocks };
  assertResult(
    await supabase
      .from("businesses")
      .update({
        catalog_layout: nextLayout,
        catalog_layout_version: Math.max(1, Number(business.catalog_layout_version) || 1),
        catalog_updated_at: new Date().toISOString(),
      })
      .eq("id", business.id),
    `Salvar widget de banner ${business.slug}`,
  );

  summary.push({ slug: business.slug, instanceId: bannerBlock.instanceId, imageUrl, blocks: currentBlocks.length });
}

console.log(JSON.stringify(summary.map(({ imageUrl: _imageUrl, ...item }) => item), null, 2));
