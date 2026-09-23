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
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

export async function removerHorario(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  await supabase.from("availability_slots").delete().eq("id", id).eq("business_id", business.id);
  revalidatePath("/app/horarios");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}

function intervalSlots(start: string, end: string, interval: number) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const result: string[] = [];
  const first = startHour * 60 + startMinute;
  const last = endHour * 60 + endMinute;
  for (let minute = first; minute < last && result.length < 30; minute += interval) {
    result.push(`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}:00`);
  }
  return result;
}

export async function configurarSemanaRapida(formData: FormData) {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const interval = Math.max(15, Math.min(240, Number(formData.get("interval") ?? 60)));
  const rows: { business_id: string; weekday: number; time: string }[] = [];

  const groups = [
    { enabled: formData.get("weekdays") === "on", days: [1, 2, 3, 4, 5], start: String(formData.get("weekday_start") ?? "08:00"), end: String(formData.get("weekday_end") ?? "18:00") },
    { enabled: formData.get("saturday") === "on", days: [6], start: String(formData.get("saturday_start") ?? "08:00"), end: String(formData.get("saturday_end") ?? "13:00") },
    { enabled: formData.get("sunday") === "on", days: [0], start: String(formData.get("sunday_start") ?? "08:00"), end: String(formData.get("sunday_end") ?? "12:00") },
  ];
  for (const group of groups) {
    if (!group.enabled) continue;
    for (const day of group.days) for (const time of intervalSlots(group.start, group.end, interval)) rows.push({ business_id: business.id, weekday: day, time });
  }

  await supabase.from("availability_slots").delete().eq("business_id", business.id);
  if (rows.length) await supabase.from("availability_slots").insert(rows);
  revalidatePath("/app/horarios");
  revalidatePath("/app/catalogo");
  revalidatePath(`/${business.slug}`);
}
