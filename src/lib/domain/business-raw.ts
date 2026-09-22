import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/domain/business";

/**
 * Variante de getCurrentBusiness() usada DENTRO do próprio fluxo de
 * onboarding: não exige onboarding_completo = true (senão criaria um loop de
 * redirect), só exige que o business exista.
 */
export async function getCurrentBusinessRaw(): Promise<Business> {
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

  return business;
}
