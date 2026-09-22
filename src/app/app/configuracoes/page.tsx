import { getCurrentBusiness } from "@/lib/domain/business";
import { salvarConfiguracoes, togglePublicado } from "./actions";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  const { salvo, erro } = await searchParams;
  const business = await getCurrentBusiness();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-white">Configurações</h1>

      {salvo && (
        <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
          Alterações salvas.
        </div>
      )}
      {erro && (
        <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>
      )}

      <div className="mb-8 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div>
          <p className="text-sm font-medium text-white">
            {business.published ? "Catálogo publicado" : "Catálogo em rascunho"}
          </p>
          <p className="text-xs text-neutral-500">
            {business.published ? "Visível para qualquer pessoa com o link." : "Só você consegue ver."}
          </p>
        </div>
        <form action={togglePublicado}>
          <input type="hidden" name="published" value={(!business.published).toString()} />
          <button className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-white">
            {business.published ? "Despublicar" : "Publicar"}
          </button>
        </form>
      </div>

      <form action={salvarConfiguracoes} className="space-y-4">
        <Field label="Nome da estética" name="name" defaultValue={business.name} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Link do catálogo</label>
          <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 focus-within:border-neutral-600">
            <span className="pl-4 text-sm text-neutral-500">{process.env.NEXT_PUBLIC_APP_URL}/</span>
            <input
              name="slug"
              defaultValue={business.slug}
              className="w-full bg-transparent px-1 py-3 text-white focus:outline-none"
            />
          </div>
        </div>

        <Field label="WhatsApp" name="whatsapp" defaultValue={business.whatsapp ?? ""} placeholder="(11) 99999-9999" />
        <Field label="Instagram" name="instagram" defaultValue={business.instagram ?? ""} placeholder="@suaestetica" />
        <Field label="E-mail" name="email" defaultValue={business.email ?? ""} type="email" />
        <Field label="Telefone" name="phone" defaultValue={business.phone ?? ""} />
        <Field label="Cidade" name="city" defaultValue={business.city ?? ""} />
        <Field label="Endereço" name="address" defaultValue={business.address ?? ""} />
        <Field label="Link do mapa" name="map_url" defaultValue={business.map_url ?? ""} placeholder="https://maps.google.com/..." />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Sobre</label>
          <textarea
            name="about"
            defaultValue={business.about ?? ""}
            rows={3}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <button type="submit" className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950">
          Salvar
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-neutral-300">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
      />
    </div>
  );
}
