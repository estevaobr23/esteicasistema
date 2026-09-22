export type Plano = "essencial" | "profissional";

export const PLAN_LIMITS = {
  essencial: {
    maxServicosAtivos: 3,
    permitePortfolio: false,
    permiteGaleriaFotos: false,
    permiteVideos: false,
    permitePacotes: false,
    permiteAvaliacoes: false,
    permiteAnalytics: false,
    permiteOcultarSecoes: false,
    marcaDagua: true,
  },
  profissional: {
    maxServicosAtivos: null as number | null, // null = ilimitado
    permitePortfolio: true,
    permiteGaleriaFotos: true,
    permiteVideos: true,
    permitePacotes: true,
    permiteAvaliacoes: true,
    permiteAnalytics: true,
    permiteOcultarSecoes: true,
    marcaDagua: false,
  },
} as const;

export function limitesDoPlano(plano: Plano) {
  return PLAN_LIMITS[plano];
}
