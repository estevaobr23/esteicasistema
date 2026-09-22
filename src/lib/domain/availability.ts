export type AvailabilitySlot = {
  weekday: number; // 0 = domingo .. 6 = sábado
  time: string; // "HH:MM:SS"
};

export type NextSlot = {
  weekday: number;
  time: string;
  label: string; // "Hoje", "Amanhã", "Terça-feira"
  dateLabel: string; // "terça-feira às 14h"
};

const WEEKDAY_NAMES = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

function formatHour(time: string): string {
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/**
 * Calcula os próximos horários disponíveis a partir de uma agenda recorrente
 * semanal. Não bloqueia nada — é só disponibilidade exibida + intenção via
 * WhatsApp, como definido no brief (não é uma agenda real).
 */
export function proximosHorarios(
  slots: AvailabilitySlot[],
  now: Date = new Date(),
  limite = 5
): NextSlot[] {
  const ativos = [...slots].sort((a, b) => a.time.localeCompare(b.time));
  if (ativos.length === 0) return [];

  const resultado: NextSlot[] = [];
  const hoje = now.getDay();
  const horaAtual = now.toTimeString().slice(0, 8);

  for (let diasNoFuturo = 0; diasNoFuturo < 8 && resultado.length < limite; diasNoFuturo++) {
    const weekday = (hoje + diasNoFuturo) % 7;
    const doDia = ativos.filter((s) => s.weekday === weekday);

    for (const slot of doDia) {
      if (diasNoFuturo === 0 && slot.time <= horaAtual) continue;

      const label = diasNoFuturo === 0 ? "Hoje" : diasNoFuturo === 1 ? "Amanhã" : WEEKDAY_NAMES[weekday];
      const dateLabel = diasNoFuturo <= 1 ? formatHour(slot.time) : `${WEEKDAY_NAMES[weekday]} às ${formatHour(slot.time)}`;

      resultado.push({ weekday: slot.weekday, time: slot.time, label, dateLabel });
      if (resultado.length >= limite) break;
    }
  }

  return resultado;
}
