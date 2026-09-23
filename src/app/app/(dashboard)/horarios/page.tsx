import { getCurrentBusiness } from "@/lib/domain/business";
import { createClient } from "@/lib/supabase/server";
import { adicionarHorario, configurarSemanaRapida, removerHorario } from "./actions";
import { DashboardPageHeader, MetricCard, SectionCard } from "@/components/dashboard/DashboardUI";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default async function HorariosPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [{ data: slots }, { count: scheduleClicks }] = await Promise.all([
    supabase.from("availability_slots").select("*").eq("business_id", business.id).order("weekday").order("time"),
    supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("event_type", "schedule_click")
      .gte("created_at", since.toISOString()),
  ]);

  const allSlots = slots ?? [];
  const activeSlots = allSlots.filter((slot) => slot.active);
  const porDia = DIAS.map((_, weekday) => ({ weekday, slots: allSlots.filter((slot) => slot.weekday === weekday) }));
  const daysWithAvailability = porDia.filter((day) => day.slots.some((slot) => slot.active)).length;
  const nextSlot = [...activeSlots].sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time))[0];
  const mostAvailableDay = [...porDia].sort((a, b) => b.slots.length - a.slots.length)[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader
        eyebrow="Operação"
        title="Horários"
        description="Mostre sua disponibilidade recorrente. O cliente escolhe uma sugestão e confirma o atendimento pelo WhatsApp."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Horários ativos" value={activeSlots.length} detail="Disponibilidades cadastradas" tone="success" />
        <MetricCard label="Dias disponíveis" value={daysWithAvailability} detail="De 7 dias da semana" />
        <MetricCard label="Cliques em horários" value={scheduleClicks ?? 0} detail="Nos últimos 30 dias" tone="brand" />
        <MetricCard
          label="Maior disponibilidade"
          value={<span className="text-lg">{mostAvailableDay?.slots.length ? DIAS[mostAvailableDay.weekday] : "Sem dados"}</span>}
          detail={nextSlot ? `Primeiro horário configurado: ${nextSlot.time.slice(0, 5)}` : "Cadastre um horário"}
          tone="attention"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Configuração rápida" description="Monte a semana inteira de uma vez e depois ajuste dias específicos.">
          <form action={configurarSemanaRapida} className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" name="weekdays" defaultChecked className="accent-white" />Segunda a sexta</label>
            <div className="grid grid-cols-2 gap-2"><input type="time" name="weekday_start" defaultValue="08:00" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /><input type="time" name="weekday_end" defaultValue="18:00" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /></div>
            <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" name="saturday" defaultChecked className="accent-white" />Sábado</label>
            <div className="grid grid-cols-2 gap-2"><input type="time" name="saturday_start" defaultValue="08:00" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /><input type="time" name="saturday_end" defaultValue="13:00" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /></div>
            <label className="flex items-center gap-2 text-sm text-neutral-300"><input type="checkbox" name="sunday" className="accent-white" />Domingo</label>
            <div className="grid grid-cols-2 gap-2"><input type="time" name="sunday_start" defaultValue="08:00" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /><input type="time" name="sunday_end" defaultValue="12:00" className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white" /></div>
            <label className="block text-xs text-neutral-500">Intervalo<select name="interval" defaultValue="60" className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-white"><option value="30">30 minutos</option><option value="60">1 hora</option><option value="90">1h30</option><option value="120">2 horas</option></select></label>
            <button className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-950">Aplicar à semana</button>
            <p className="text-[11px] leading-5 text-amber-300/70">Ao aplicar, a configuração semanal substitui os horários atuais. Depois você pode personalizar individualmente abaixo.</p>
          </form>
        </SectionCard>

        <SectionCard title="Adicionar disponibilidade" description="Você pode cadastrar mais de um horário no mesmo dia.">
          <form action={adicionarHorario} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-neutral-500">Dia da semana</label>
              <select name="weekday" className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm text-white">
                {DIAS.map((day, index) => <option key={day} value={index}>{day}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-neutral-500">Horário</label>
              <input type="time" name="time" required className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm text-white" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-950">Adicionar horário</button>
          </form>
          <p className="mt-4 rounded-lg bg-neutral-950 px-3 py-2 text-xs leading-5 text-neutral-500">
            Esta disponibilidade é uma sugestão. O horário só fica confirmado depois da conversa no WhatsApp.
          </p>
        </SectionCard>

        <div className="lg:col-span-2"><SectionCard title="Sua semana" description="Confira rapidamente os dias cobertos e remova horários que não deseja mais mostrar.">
          <div className="grid gap-3 sm:grid-cols-2">
            {porDia.map(({ weekday, slots: daySlots }) => (
              <div key={weekday} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-300">{DIAS[weekday]}</p>
                  <span className="text-[11px] text-neutral-600">{daySlots.length} horário(s)</span>
                </div>
                {daySlots.length === 0 ? (
                  <p className="text-xs text-neutral-700">Sem disponibilidade</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <form key={slot.id} action={removerHorario} className="flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 py-1 pl-3 pr-1 text-sm text-white">
                        {slot.time.slice(0, 5)}
                        <input type="hidden" name="id" value={slot.id} />
                        <button aria-label={`Remover ${slot.time.slice(0, 5)}`} className="ml-1 rounded-full px-2 text-neutral-500 hover:text-red-400">×</button>
                      </form>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard></div>
      </div>
    </main>
  );
}
