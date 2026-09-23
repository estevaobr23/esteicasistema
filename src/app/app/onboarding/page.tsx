import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "./actions";
import StepNegocio from "@/components/onboarding/StepNegocio";
import StepVisual from "@/components/onboarding/StepVisual";
import StepContato from "@/components/onboarding/StepContato";
import StepServicos from "@/components/onboarding/StepServicos";
import StepPrecos from "@/components/onboarding/StepPrecos";
import StepPublicar from "@/components/onboarding/StepPublicar";

const ETAPAS = ["negocio", "visual", "contato", "servicos", "precos", "publicar"] as const;
type Etapa = (typeof ETAPAS)[number];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ etapa?: string; erro?: string }>;
}) {
  const { etapa: etapaParam, erro } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Passo 1: sem business ainda -> portão que valida a compra.
  if (!business) {
    return (
      <OnboardingShell etapaAtual="negocio" erro={erro}>
        <StepNegocio createBusinessAction={createBusiness} />
      </OnboardingShell>
    );
  }

  if (business.onboarding_completo) {
    redirect("/app/dashboard");
  }

  const etapa: Etapa = ETAPAS.includes(etapaParam as Etapa) ? (etapaParam as Etapa) : "visual";

  return (
    <OnboardingShell etapaAtual={etapa} erro={erro}>
      {etapa === "visual" && <StepVisual business={business} />}
      {etapa === "contato" && <StepContato business={business} />}
      {etapa === "servicos" && <StepServicos business={business} />}
      {etapa === "precos" && <StepPrecos business={business} />}
      {etapa === "publicar" && <StepPublicar business={business} />}
    </OnboardingShell>
  );
}

function OnboardingShell({
  children,
  etapaAtual,
  erro,
}: {
  children: React.ReactNode;
  etapaAtual: Etapa;
  erro?: string;
}) {
  const indice = ETAPAS.indexOf(etapaAtual);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs font-medium text-neutral-500">
            <span>
              Passo {indice + 1} de {ETAPAS.length}
            </span>
            <span>{Math.round(((indice + 1) / ETAPAS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${((indice + 1) / ETAPAS.length) * 100}%` }}
            />
          </div>
        </div>

        {erro && (
          <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        {etapaAtual !== "negocio" && (
          <div className="mb-6 rounded-xl border border-sky-900/70 bg-sky-950/30 px-4 py-3 text-sm text-sky-100">
            <p className="font-semibold">Seu catálogo de exemplo já está pronto.</p>
            <p className="mt-1 text-xs leading-5 text-sky-200/70">
              Use estas etapas para ajustar o visual, escolher serviços e revisar preços. Fotos, pacotes, portfólio e avaliações poderão ser editados depois.
            </p>
          </div>
        )}

        {children}
      </div>
    </main>
  );
}
