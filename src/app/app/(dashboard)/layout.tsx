import Link from "next/link";
import { getCurrentBusiness } from "@/lib/domain/business";
import { limitesDoPlano } from "@/lib/domain/plans";
import { signOut } from "@/app/(auth)/actions";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Início" },
  { href: "/app/servicos", label: "Serviços" },
  { href: "/app/pacotes", label: "Pacotes", plano: "profissional" as const },
  { href: "/app/portfolio", label: "Portfólio", plano: "profissional" as const },
  { href: "/app/horarios", label: "Horários" },
  { href: "/app/avaliacoes", label: "Avaliações", plano: "profissional" as const },
  { href: "/app/analytics", label: "Analytics", plano: "profissional" as const },
  { href: "/app/personalizar", label: "Personalizar" },
  { href: "/app/configuracoes", label: "Configurações" },
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

      <div className="flex-1 pb-20 sm:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-neutral-900 bg-neutral-950/95 backdrop-blur sm:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 whitespace-nowrap px-3 py-3 text-center text-[11px] text-neutral-400"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
