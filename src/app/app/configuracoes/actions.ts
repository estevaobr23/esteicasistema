"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness, slugify } from "@/lib/domain/business";

export async function salvarConfiguracoes(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw) || business.slug;
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const mapUrl = String(formData.get("map_url") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();

  if (slug !== business.slug) {
    const { data: existente } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle();
    if (existente) {
      redirect("/app/configuracoes?erro=" + encodeURIComponent("Esse link já está em uso. Escolha outro."));
    }
  }

  await supabase
    .from("businesses")
    .update({
      name: name || business.name,
      slug,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      email: email || null,
      phone: phone || null,
      city: city || null,
      address: address || null,
      map_url: mapUrl || null,
      about: about || null,
    })
    .eq("id", business.id);

  revalidatePath("/app/configuracoes");
  redirect("/app/configuracoes?salvo=1");
}

export async function togglePublicado(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const published = formData.get("published") === "true";

  await supabase.from("businesses").update({ published }).eq("id", business.id);

  revalidatePath("/app/configuracoes");
  revalidatePath("/app/dashboard");
}
