import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Business = Tables<"businesses">;

/**
 * Guard chamado em toda página server do dashboard.
 * Responde: "esse usuário tem negócio e terminou o onboarding?"
 */
export async function getCurrentBusiness(): Promise<Business> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/app/onboarding");
  if (!business.onboarding_completo) redirect("/app/onboarding");

  return business;
}

/**
 * Slugify simples: minúsculas, sem acento, só [a-z0-9-].
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function gerarSlugDisponivel(nome: string): Promise<string> {
  const supabase = await createClient();
  const base = slugify(nome) || "estetica";

  let slug = base;
  let tentativa = 1;

  while (true) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    tentativa += 1;
    slug = `${base}-${tentativa}`;
  }
}
