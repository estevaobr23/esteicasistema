"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";

async function assertPacotesPermitido() {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");
  if (!limites.permitePacotes) {
    redirect(
      "/app/pacotes?erro=" +
        encodeURIComponent("Pacotes estão disponíveis no plano Profissional. Faça upgrade para liberar.")
    );
  }
  return business;
}

export async function upsertPacote(formData: FormData) {
  const business = await assertPacotesPermitido();
  const supabase = await createClient();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = formData.get("image_url") ? String(formData.get("image_url")) : null;
  const price = Number(formData.get("price") ?? 0);
  const promotionalPrice = formData.get("promotional_price") ? Number(formData.get("promotional_price")) : null;
  const serviceIds = formData.getAll("service_id").map(String);

  if (!name || !price) {
    redirect("/app/pacotes?erro=" + encodeURIComponent("Informe nome e preço do pacote."));
  }

  const payload = {
    business_id: business.id,
    name,
    description: description || null,
    image_url: imageUrl,
    price,
    promotional_price: promotionalPrice,
  };

  let packageId: string | null = null;
  if (id) {
    const { data } = await supabase
      .from("packages")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business.id)
      .select("id")
      .single();
    packageId = data?.id ?? null;
    if (packageId) {
      await supabase.from("package_services").delete().eq("package_id", packageId);
    }
  } else {
    const { data } = await supabase.from("packages").insert(payload).select("id").single();
    packageId = data?.id ?? null;
  }

  if (packageId && serviceIds.length > 0) {
    await supabase
      .from("package_services")
      .insert(serviceIds.map((serviceId) => ({ package_id: packageId!, service_id: serviceId })));
  }

  revalidatePath("/app/pacotes");
  redirect("/app/pacotes");
}

export async function togglePacoteAtivo(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";

  await supabase.from("packages").update({ active }).eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/pacotes");
}

export async function excluirPacote(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("packages").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/pacotes");
}
