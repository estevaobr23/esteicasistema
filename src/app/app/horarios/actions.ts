"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/domain/business";

export async function adicionarHorario(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const weekday = Number(formData.get("weekday"));
  const time = String(formData.get("time"));

  if (Number.isNaN(weekday) || !time) return;

  await supabase.from("availability_slots").insert({ business_id: business.id, weekday, time });
  revalidatePath("/app/horarios");
}

export async function removerHorario(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("availability_slots").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/horarios");
}
