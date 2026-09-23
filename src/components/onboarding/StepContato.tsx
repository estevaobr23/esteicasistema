import { saveContato } from "@/app/app/onboarding/steps-actions";
import type { Business } from "@/lib/domain/business";

export default function StepContato({ business }: { business: Business }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Contato e atendimento</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Esses dados aparecem no seu catálogo e ativam os botões de WhatsApp em cada serviço.
      </p>

      <form action={saveContato} className="mt-8 space-y-4">
        <div>
          <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium text-neutral-300">
            WhatsApp (com DDD) *
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            required
            autoFocus
            defaultValue={business.whatsapp ?? ""}
            placeholder="Ex: 11988887777"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Sem esse número, os botões de orçamento não aparecem no catálogo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Cidade
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={business.city ?? ""}
              placeholder="Ex: São Paulo"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={business.email ?? ""}
              placeholder="contato@suaempresa.com"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Endereço
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={business.address ?? ""}
            placeholder="Rua, número, bairro - cidade/UF"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="instagram" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Instagram
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            defaultValue={business.instagram ?? ""}
            placeholder="@suaempresa"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-neutral-300">
            Horário de funcionamento
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ["seg", "Segunda"],
              ["ter", "Terça"],
              ["qua", "Quarta"],
              ["qui", "Quinta"],
              ["sex", "Sexta"],
              ["sab", "Sábado"],
              ["dom", "Domingo"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-neutral-500">{label}</span>
                <input
                  name={`horario__${key}`}
                  type="text"
                  defaultValue={
                    (business.business_hours as Record<string, string> | null)?.[key] ??
                    (key === "dom" ? "fechado" : "09:00-18:00")
                  }
                  placeholder="09:00-18:00 ou fechado"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}
