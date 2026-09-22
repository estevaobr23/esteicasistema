const PRIMARY = "#e11d2a";
const PRIMARY_DEEP = "#b8121e";

export default function Home() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* HEADER — só logo e âncoras, sem CTA de conta */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-sm font-bold tracking-tight">
            VITRINE<span style={{ color: PRIMARY }}>DETAIL</span>
          </span>
          <nav className="hidden gap-6 text-sm text-white/60 sm:flex">
            <a href="#recursos" className="hover:text-white">Recursos</a>
            <a href="#planos" className="hover:text-white">Planos</a>
            <a href="#faq" className="hover:text-white">Perguntas</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 py-20 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
          Gestão de vitrine para estética automotiva
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Pare de explicar seus serviços toda vez que alguém chama no{" "}
          <span style={{ color: PRIMARY }}>WhatsApp</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-white/60">
          Configure seu catálogo uma vez. Envie só um link. Seu cliente vê serviços, preços por veículo, antes e
          depois e já chama sabendo o que quer.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#planos"
            className="rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            Quero minha vitrine no ar
          </a>
          <span className="text-xs text-white/40">Pagamento único · acesso vitalício</span>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="bg-[#141414] px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">O que você configura em minutos</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: "🚗", title: "Serviços prontos", desc: "12 serviços de detailing já cadastrados, só marcar." },
            { icon: "💰", title: "Preço por veículo", desc: "Hatch, sedan, SUV e picape — cada um com seu valor." },
            { icon: "📸", title: "Antes e depois", desc: "Slider interativo com os resultados do seu trabalho." },
            { icon: "💬", title: "WhatsApp com contexto", desc: "O cliente chama já dizendo o que quer e quanto viu." },
          ].map((r) => (
            <div key={r.title} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-center">
              <div className="mb-2 text-2xl">{r.icon}</div>
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-xs text-white/50">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOCO TEMÁTICO 1 */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Chega de repetir</p>
          <h2 className="text-2xl font-bold">
            &ldquo;Quanto custa pra SUV?&rdquo; Seu cliente responde sozinho.
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Ele seleciona o veículo dele e o preço certo aparece na hora. Você para de digitar a mesma tabela de
            preço todo dia.
          </p>
        </div>
      </section>

      {/* BLOCO TEMÁTICO 2 — fundo escuro (primária) */}
      <section className="px-4 py-16" style={{ backgroundColor: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">Prova visual</p>
          <h2 className="text-2xl font-bold">Seus resultados falam antes de você precisar falar.</h2>
          <p className="mt-3 text-sm text-white/80">
            Antes e depois com slider, separados por categoria. O cliente compara com o dedo, sem sair do catálogo.
          </p>
        </div>
      </section>

      {/* BLOCO TEMÁTICO 3 */}
      <section className="bg-[#141414] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Sem perder horário</p>
          <h2 className="text-2xl font-bold">Mostre os horários que você tem livre — sem agenda complicada.</h2>
          <p className="mt-3 text-sm text-white/60">
            Você configura uma vez por semana. O cliente vê e já chama no WhatsApp com o horário de interesse.
          </p>
        </div>
      </section>

      {/* CONFIANÇA */}
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: "🔒", label: "Seus dados isolados" },
            { icon: "📱", label: "Feito pra celular" },
            { icon: "⚡", label: "No ar em minutos" },
            { icon: "🎯", label: "Feito só pra detailing" },
          ].map((t) => (
            <div key={t.label} className="text-center text-xs text-white/60">
              <div className="mb-1 text-xl">{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="px-4 py-20" style={{ backgroundColor: "#0a0a0a" }}>
        <h2 className="mb-2 text-center text-2xl font-bold">Escolha seu plano</h2>
        <p className="mb-10 text-center text-sm text-white/50">
          Uma mensalidade de estética esquecida já paga a ferramenta pro ano inteiro.
        </p>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* ESSENCIAL */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-6">
            <p className="text-sm font-semibold text-white/70">Iniciante</p>
            <p className="mt-3 text-3xl font-bold">
              R$47<span className="text-base font-normal text-white/50"> vitalício</span>
            </p>
            <p className="text-xs text-white/40">pagamento único · sem mensalidade</p>

            <ul className="mt-6 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Até 3 serviços cadastrados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Preço por tipo de veículo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> WhatsApp com contexto
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Antes e depois
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Pacotes
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Analytics
              </li>
            </ul>

            <PlanCTA label="Quero o Iniciante" />
          </div>

          {/* PROFISSIONAL */}
          <div
            className="relative rounded-2xl border-2 p-6"
            style={{ borderColor: PRIMARY, backgroundColor: "#141414" }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              ⭐ Mais escolhido
            </span>
            <p className="text-sm font-semibold text-white/70">Profissional</p>
            <p className="mt-3 text-3xl font-bold">
              R$97<span className="text-base font-normal text-white/50"> vitalício</span>
            </p>
            <p className="text-xs text-white/40">pagamento único · sem mensalidade</p>

            <ul className="mt-6 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Serviços ilimitados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Preço por tipo de veículo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> WhatsApp com contexto
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Antes e depois
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Pacotes de serviços
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span> Analytics de visitantes
              </li>
            </ul>

            <PlanCTA label="Quero o Profissional" highlight />
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="px-4 py-14 text-center">
        <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-2xl">🛡️</p>
          <p className="mt-2 text-sm font-semibold">Garantia de 7 dias</p>
          <p className="mt-1 text-xs text-white/50">
            Se não fizer sentido pro seu negócio, devolvemos seu dinheiro.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#141414] px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Perguntas frequentes</h2>
        <div className="mx-auto max-w-2xl space-y-3">
          {[
            {
              q: "Preciso saber programar ou criar site?",
              a: "Não. Você preenche campos (nome, fotos, preços) e o catálogo é gerado automaticamente, pronto e no ar.",
            },
            {
              q: "O link do meu catálogo muda com o tempo?",
              a: "Não. Você escolhe o link uma vez (ex: dominio.com/sua-estetica) e ele fica fixo — pode divulgar no Instagram, WhatsApp e onde quiser.",
            },
            {
              q: "Dá pra editar depois de publicar?",
              a: "Sim, a qualquer momento, direto do seu painel. As mudanças aparecem no catálogo público na hora.",
            },
            {
              q: "É mensalidade?",
              a: "Não. Os dois planos são pagamento único, com acesso vitalício à ferramenta.",
            },
            {
              q: "Posso trocar de plano depois?",
              a: "Sim, você pode fazer upgrade do Iniciante para o Profissional quando quiser.",
            },
            {
              q: "O agendamento é automático?",
              a: "Os horários que você cadastra aparecem como sugestão pro cliente. A confirmação final é sempre feita por você, pelo WhatsApp — não é uma agenda automática.",
            },
          ].map((item) => (
            <details key={item.q} className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4">
              <summary className="cursor-pointer text-sm font-medium">{item.q}</summary>
              <p className="mt-2 text-xs text-white/60">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 py-20 text-center">
        <h2 className="mb-6 text-2xl font-bold">Sua vitrine pode estar no ar hoje.</h2>
        <a
          href="#planos"
          className="inline-block rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          Ver planos
        </a>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-xs text-white/40">
        <p>Vitrine Detail — catálogo-site para estética automotiva.</p>
        <p className="mt-1">Já é cliente? Acesse pelo link enviado no seu e-mail de compra.</p>
      </footer>
    </div>
  );
}

function PlanCTA({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <div className="mt-6">
      <button
        type="button"
        disabled
        title="Checkout em configuração — em breve disponível"
        className="block w-full cursor-not-allowed rounded-lg py-3 text-center text-sm font-semibold text-white/50"
        style={{ backgroundColor: highlight ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)" }}
      >
        {label} (em breve)
      </button>
    </div>
  );
}
