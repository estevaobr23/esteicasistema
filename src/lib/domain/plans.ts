export type Plano = "essencial" | "profissional";

export const PLAN_LIMITS = {
  essencial: {
    maxServicosAtivos: 3,
    permitePortfolio: false,
    permitePacotes: false,
    permiteAnalytics: false,
    marcaDagua: true,
  },
  profissional: {
    maxServicosAtivos: null as number | null, // null = ilimitado
    permitePortfolio: true,
    permitePacotes: true,
    permiteAnalytics: true,
    marcaDagua: false,
  },
} as const;

export function limitesDoPlano(plano: Plano) {
  return PLAN_LIMITS[plano];
}
