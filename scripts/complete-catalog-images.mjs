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
const demoSlugs = ["detail-teste", "clackcat"];
const faceSourceDir = path.join(
  process.env.USERPROFILE ?? "C:\\Users\\Usuário",
  ".claude",
  "skills",
  "padrao-lowticket",
  "assets",
  "padrao",
  "provas-sociais",
);

// "mulher 1.jpg" é um logo de outra marca, não uma foto de perfil.
// Ele é deliberadamente excluído para não contaminar os depoimentos.
const femaleFaces = ["mulher 2.jpg", "mulher 3.jpg", "mulher 4.jpg", "mulher 5.jpg", "mulher 6.jpg"];
const maleFaces = ["homem.jpg", "homem 1.jpg", "9 homem.jpg"];
const femaleFirstNames = new Set(["mariana", "camila", "juliana", "larissa", "amanda"]);

function assertResult(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

function xmlEscape(value) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character]);
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DT";
}

function safeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value ?? "") ? value : fallback;
}

function createLogoSvg(business) {
  const primary = safeColor(business.primary_color, "#ef233c");
  const secondary = safeColor(business.secondary_color, "#111827");
  const monogram = xmlEscape(initials(business.name));
  const label = xmlEscape(business.name);
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-labelledby="title description">
      <title id="title">Logo ${label}</title>
      <desc id="description">Monograma ${monogram} do catálogo de demonstração</desc>
      <defs>
        <linearGradient id="surface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${secondary}"/>
          <stop offset="1" stop-color="#090b0e"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="244" fill="url(#surface)" stroke="${primary}" stroke-width="16"/>
      <path d="M116 334c47 34 233 34 280 0" fill="none" stroke="${primary}" stroke-width="12" stroke-linecap="round" opacity=".85"/>
      <circle cx="142" cy="150" r="12" fill="${primary}"/>
      <circle cx="370" cy="150" r="12" fill="${primary}"/>
      <text x="256" y="300" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="152" font-weight="800" letter-spacing="-8">${monogram}</text>
    </svg>
  `);
}

async function upload(pathname, body, contentType) {
  assertResult(
    await supabase.storage.from(bucket).upload(pathname, body, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    }),
    `Upload ${pathname}`,
  );
  return supabase.storage.from(bucket).getPublicUrl(pathname).data.publicUrl;
}

const businesses = assertResult(
  await supabase.from("businesses").select("id,slug,name,primary_color,secondary_color,logo_url").in("slug", demoSlugs),
  "Consultar negócios de demonstração",
);

if (businesses.length !== demoSlugs.length) {
  const found = new Set(businesses.map((business) => business.slug));
  const missing = demoSlugs.filter((slug) => !found.has(slug));
  throw new Error(`Negócio(s) de demonstração não encontrado(s): ${missing.join(", ")}`);
}

const faceBuffers = new Map();
for (const filename of [...femaleFaces, ...maleFaces]) {
  faceBuffers.set(filename, await fs.readFile(path.join(faceSourceDir, filename)));
}

const summary = [];
for (const business of businesses) {
  let logoUrl = business.logo_url;
  if (!logoUrl) {
    logoUrl = await upload(`${business.id}/logo/demo-monogram.svg`, createLogoSvg(business), "image/svg+xml");
    assertResult(
      await supabase.from("businesses").update({ logo_url: logoUrl }).eq("id", business.id),
      `Salvar logo de ${business.slug}`,
    );
  }

  const reviews = assertResult(
    await supabase.from("reviews").select("id,customer_name,customer_photo_url").eq("business_id", business.id).order("created_at"),
    `Consultar avaliações de ${business.slug}`,
  );
  const missingReviews = reviews.filter((review) => !review.customer_photo_url);
  let femaleIndex = 0;
  let maleIndex = 0;
  let reviewsUpdated = 0;

  for (const review of missingReviews) {
    const firstName = review.customer_name.trim().split(/\s+/)[0].toLocaleLowerCase("pt-BR");
    const isFemale = femaleFirstNames.has(firstName);
    const sourceList = isFemale ? femaleFaces : maleFaces;
    const sourceIndex = isFemale ? femaleIndex++ : maleIndex++;
    const sourceFilename = sourceList[sourceIndex % sourceList.length];
    const genderFolder = isFemale ? "female" : "male";
    const storageFilename = `profile-${genderFolder}-${(sourceIndex % sourceList.length) + 1}.jpg`;
    const photoUrl = await upload(
      `${business.id}/reviews/${storageFilename}`,
      faceBuffers.get(sourceFilename),
      "image/jpeg",
    );
    assertResult(
      await supabase.from("reviews").update({ customer_photo_url: photoUrl }).eq("id", review.id),
      `Salvar foto de ${review.customer_name}`,
    );
    reviewsUpdated += 1;
  }

  summary.push({ slug: business.slug, logoFilled: Boolean(logoUrl), reviewsTotal: reviews.length, reviewsUpdated });
}

const verification = [];
for (const business of businesses) {
  const currentBusiness = assertResult(
    await supabase.from("businesses").select("logo_url,cover_url").eq("id", business.id).single(),
    `Verificar negócio ${business.slug}`,
  );
  const currentReviews = assertResult(
    await supabase.from("reviews").select("customer_photo_url").eq("business_id", business.id),
    `Verificar avaliações de ${business.slug}`,
  );
  verification.push({
    slug: business.slug,
    logo: Boolean(currentBusiness.logo_url),
    cover: Boolean(currentBusiness.cover_url),
    reviewPhotos: currentReviews.filter((review) => Boolean(review.customer_photo_url)).length,
    reviewsTotal: currentReviews.length,
  });
}

console.log(JSON.stringify({ summary, verification }, null, 2));
