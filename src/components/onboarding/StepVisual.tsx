import { saveVisual } from "@/app/app/onboarding/steps-actions";
import VisualForm from "@/components/dashboard/VisualForm";
import type { Business } from "@/lib/domain/business";

export default function StepVisual({ business }: { business: Business }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Visual do seu catálogo</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Escolha um template e ajuste as cores da sua marca. A estrutura já vem pronta.
      </p>

      <div className="mt-8">
        <VisualForm business={business} action={saveVisual} submitLabel="Continuar" />
      </div>
    </div>
  );
}
