import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";
import { signOut } from "@/app/(auth)/actions";
import BottomNav from "@/components/dashboard/BottomNav";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Início", navLabel: "Início", icon: "home" as const },
  { href: "/app/servicos", label: "Serviços", navLabel: "Serviços", icon: "wrench" as const },
  { href: "/app/pacotes", label: "Pacotes", navLabel: "Pacotes", icon: "box" as const, plano: "profissional" as const },
  { href: "/app/portfolio", label: "Portfólio", navLabel: "Portfólio", icon: "image" as const, plano: "profissional" as const },
  { href: "/app/horarios", label: "Horários", navLabel: "Horários", icon: "clock" as const },
  { href: "/app/avaliacoes", label: "Avaliações", navLabel: "Avaliações", icon: "star" as const, plano: "profissional" as const },
  { href: "/app/analytics", label: "Analytics", navLabel: "Analytics", icon: "chart" as const, plano: "profissional" as const },
  { href: "/app/catalogo", label: "Catálogo", navLabel: "Catálogo", icon: "palette" as const },
  { href: "/app/configuracoes", label: "Configurações", navLabel: "Config", icon: "settings" as const },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  const limites = limitesDoPlano(business.plano as "essencial" | "profissional");

  const items = NAV_ITEMS.filter((item) => {
    if (item.plano === "profissional") {
      if (item.href === "/app/pacotes") return limites.permitePacotes;
      if (item.href === "/app/portfolio") return limites.permitePortfolio;
      if (item.href === "/app/avaliacoes") return limites.permiteAvaliacoes;
      if (item.href === "/app/analytics") return limites.permiteAnalytics;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      <aside className="hidden w-56 flex-col border-r border-neutral-900 p-4 sm:flex">
        <p className="mb-6 truncate px-2 text-sm font-semibold">{business.name}</p>
        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-900">
            Sair
          </button>
        </form>
      </aside>

      <div className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:pb-0">{children}</div>

      <BottomNav items={items} />
    </div>
  );
}
