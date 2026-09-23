import { getCurrentBusiness } from "@/lib/domain/business";
import { salvarConfiguracoes, togglePublicado } from "./actions";
import { DashboardPageHeader, SectionCard, StatusBadge } from "@/components/dashboard/DashboardUI";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  const { salvo, erro } = await searchParams;
  const business = await getCurrentBusiness();
  const catalogUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${business.slug}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <DashboardPageHeader eyebrow="Sistema" title="Configurações" description="Gerencie os dados oficiais do negócio, o endereço do catálogo e seu estado de publicação." />

      {salvo && <div className="mb-6 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">Alterações salvas.</div>}
      {erro && <div className="mb-6 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">{erro}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <SectionCard title="Publicação" description={business.published ? "Seu catálogo está acessível pelo link público." : "Publique quando estiver pronto para receber clientes."}>
          <div className="flex items-center justify-between gap-4">
            <StatusBadge tone={business.published ? "success" : "attention"}>{business.published ? "Publicado" : "Rascunho"}</StatusBadge>
            <form action={togglePublicado}>
              <input type="hidden" name="published" value={(!business.published).toString()} />
              <button className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-white">{business.published ? "Despublicar" : "Publicar agora"}</button>
            </form>
          </div>
        </SectionCard>

        <SectionCard title="Endereço atual" description="Este é o link fixo que você compartilha com seus clientes.">
          <p className="break-all font-mono text-xs text-white">{catalogUrl}</p>
          <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-xs font-semibold text-red-400 hover:text-red-300">Abrir catálogo ↗</a>
        </SectionCard>
      </div>

      <form action={salvarConfiguracoes} className="space-y-6">
        <SectionCard title="Dados do negócio" description="Informações que identificam sua estética no catálogo.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da estética" name="name" defaultValue={business.name} required />
            <Field label="Cidade" name="city" defaultValue={business.city ?? ""} />
            <div className="sm:col-span-2"><Field label="Endereço" name="address" defaultValue={business.address ?? ""} /></div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Sobre</label>
              <textarea name="about" defaultValue={business.about ?? ""} rows={4} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white focus:border-neutral-600 focus:outline-none" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Contato" description="Canais usados para receber pedidos e apresentar o negócio.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp" name="whatsapp" defaultValue={business.whatsapp ?? ""} placeholder="(11) 99999-9999" />
            <Field label="Instagram" name="instagram" defaultValue={business.instagram ?? ""} placeholder="@suaestetica" />
            <Field label="E-mail" name="email" defaultValue={business.email ?? ""} type="email" />
            <Field label="Telefone" name="phone" defaultValue={business.phone ?? ""} />
            <div className="sm:col-span-2"><Field label="Link do mapa" name="map_url" defaultValue={business.map_url ?? ""} placeholder="https://maps.google.com/..." /></div>
          </div>
        </SectionCard>

        <SectionCard title="Endereço do catálogo" description="Use apenas letras minúsculas, números e hífens. Alterar este valor muda o link compartilhado.">
          <label className="mb-1.5 block text-sm font-medium text-neutral-300">Link personalizado</label>
          <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 focus-within:border-neutral-600">
            <span className="max-w-[45%] truncate pl-4 text-sm text-neutral-600">{process.env.NEXT_PUBLIC_APP_URL}/</span>
            <input name="slug" defaultValue={business.slug} pattern="[a-z0-9-]+" required className="min-w-0 flex-1 bg-transparent px-1 py-3 text-white focus:outline-none" />
          </div>
          <p className="mt-2 text-xs text-amber-400/80">Antes de alterar, lembre-se de atualizar o link na bio e nos materiais de divulgação.</p>
        </SectionCard>

        <div className="sticky bottom-[4.75rem] z-10 rounded-xl border border-neutral-800 bg-neutral-950/95 p-3 shadow-2xl backdrop-blur sm:bottom-4">
          <button type="submit" className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950">Salvar configurações</button>
        </div>
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
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none" />
    </div>
  );
}
