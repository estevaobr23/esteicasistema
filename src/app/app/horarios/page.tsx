import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { adicionarHorario, removerHorario } from "./actions";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function HorariosPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("business_id", business.id)
    .order("weekday")
    .order("time");

  const porDia = DIAS.map((_, weekday) => ({
    weekday,
    slots: (slots ?? []).filter((s) => s.weekday === weekday),
  }));

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-2 text-xl font-semibold text-white">Horários disponíveis</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Configure os horários que você costuma ter livres. Isso aparece no seu catálogo como sugestão — o cliente
        confirma com você pelo WhatsApp.
      </p>

      <form action={adicionarHorario} className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div>
          <label className="mb-1.5 block text-xs text-neutral-500">Dia</label>
          <select name="weekday" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white">
            {DIAS.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-neutral-500">Horário</label>
          <input type="time" name="time" required className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white" />
        </div>
        <button type="submit" className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950">
          Adicionar
        </button>
      </form>

      <div className="space-y-4">
        {porDia.map(({ weekday, slots: daySlots }) => (
          <div key={weekday}>
            <p className="mb-2 text-sm font-semibold text-neutral-300">{DIAS[weekday]}</p>
            {daySlots.length === 0 ? (
              <p className="text-xs text-neutral-600">Sem horários</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {daySlots.map((s) => (
                  <form key={s.id} action={removerHorario} className="flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 py-1 pl-3 pr-1 text-sm text-white">
                    {s.time.slice(0, 5)}
                    <input type="hidden" name="id" value={s.id} />
                    <button className="ml-1 rounded-full px-2 text-neutral-500 hover:text-red-400">×</button>
                  </form>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
