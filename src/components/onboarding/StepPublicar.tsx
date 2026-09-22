import { publishBusiness } from "@/app/app/onboarding/steps-actions";
import type { Business } from "@/lib/domain/business";

export default function StepPublicar({ business }: { business: Business }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Tudo pronto</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Seu catálogo está configurado. Publique para colocá-lo no ar.
      </p>

      <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <p className="text-xs text-neutral-500">Seu link será</p>
        <p className="mt-1 break-all font-mono text-sm text-white">
          {process.env.NEXT_PUBLIC_APP_URL}/{business.slug}
        </p>
      </div>

      <form action={publishBusiness} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          Publicar catálogo
        </button>
      </form>
    </div>
  );
}
