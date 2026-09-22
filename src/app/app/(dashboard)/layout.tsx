import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";
import { signOut } from "@/app/(auth)/actions";
import BottomNav from "@/components/dashboard/BottomNav";
import { BottomNavVisibilityProvider } from "@/components/dashboard/BottomNavVisibilityProvider";

const NAV_GROUPS = [
  {
    label: "Visão geral",
    items: [
      { href: "/app/dashboard", label: "Início", navLabel: "Início", icon: "home" as const },
      { href: "/app/analytics", label: "Analytics", navLabel: "Analytics", icon: "chart" as const, plano: "profissional" as const },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { href: "/app/servicos", label: "Serviços", navLabel: "Serviços", icon: "wrench" as const },
      { href: "/app/pacotes", label: "Pacotes", navLabel: "Pacotes", icon: "box" as const, plano: "profissional" as const },
      { href: "/app/portfolio", label: "Portfólio", navLabel: "Portfólio", icon: "image" as const, plano: "profissional" as const },
    ],
  },
  {
    label: "Operação",
    items: [
      { href: "/app/horarios", label: "Horários", navLabel: "Horários", icon: "clock" as const },
      { href: "/app/avaliacoes", label: "Avaliações", navLabel: "Avaliações", icon: "star" as const, plano: "profissional" as const },
    ],
  },
  {
    label: "Aparência",
    items: [{ href: "/app/catalogo", label: "Catálogo", navLabel: "Catálogo", icon: "palette" as const }],
  },
  {
    label: "Sistema",
    items: [{ href: "/app/configuracoes", label: "Configurações", navLabel: "Config", icon: "settings" as const }],
  },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  const canShow = (item: (typeof NAV_GROUPS)[number]["items"][number]) => {
    if ("plano" in item && item.plano === "profissional") {
      if (item.href === "/app/pacotes") return limites.permitePacotes;
      if (item.href === "/app/portfolio") return limites.permitePortfolio;
      if (item.href === "/app/avaliacoes") return limites.permiteAvaliacoes;
      if (item.href === "/app/analytics") return limites.permiteAnalytics;
    }
    return true;
  };
  const groups = NAV_GROUPS.map((group) => ({ ...group, items: group.items.filter(canShow) })).filter(
    (group) => group.items.length > 0
  );
  const items = groups.flatMap((group) => group.items);
  const catalogUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${business.slug}`;

  return (
    <BottomNavVisibilityProvider>
      <div className="flex min-h-screen bg-neutral-950 text-white">
      <aside className="hidden w-64 flex-col border-r border-neutral-900 bg-[#090909] p-4 sm:flex">
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Vitrine Detail</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{business.name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] capitalize text-neutral-500">Plano {business.plano}</span>
            <span className={`text-[11px] font-medium ${business.published ? "text-emerald-400" : "text-neutral-500"}`}>
              {business.published ? "● Publicado" : "○ Rascunho"}
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-300 transition hover:bg-neutral-900 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <a
          href={catalogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 rounded-lg border border-neutral-800 px-3 py-2 text-center text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white"
        >
          Abrir catálogo ↗
        </a>
          <form action={signOut}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-900">
              Sair
            </button>
          </form>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-hidden pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:pb-0">
          {children}
        </div>

        <BottomNav items={items} />
      </div>
    </BottomNavVisibilityProvider>
  );
}
