"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";

export async function salvarPersonalizacao(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const theme = String(formData.get("theme") ?? business.theme);
  const primaryColor = String(formData.get("primary_color") ?? business.primary_color);
  const secondaryColor = String(formData.get("secondary_color") ?? business.secondary_color);
  const logoUrl = formData.get("logo_url") ? String(formData.get("logo_url")) : business.logo_url;
  const coverUrl = formData.get("cover_url") ? String(formData.get("cover_url")) : business.cover_url;

  await supabase
    .from("businesses")
    .update({
      theme,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
      cover_url: coverUrl,
    })
    .eq("id", business.id);

  revalidatePath("/app/personalizar");
  redirect("/app/personalizar?salvo=1");
}
