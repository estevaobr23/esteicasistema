import FloatingHeader from "@/components/landing/FloatingHeader";

const PRIMARY = "#e11d2a";
const PRIMARY_DEEP = "#b8121e";
const LIGHT_BG = "#f2efec"; // off-white dessaturado, nunca branco puro
const LIGHT_BG_DEEP = "#e8e4e0";

export default function Home() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* HEADER — só logo e âncoras, sem CTA de conta */}
      <FloatingHeader />

      {/* HERO */}
      <section className="px-4 pb-20 pt-24 text-center">
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
        <h2 className="mb-10 text-center text-2xl font-bold">O que muda no seu dia a dia</h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🚫",
              image: "/images/day-to-day/stop-repeating-prices.png",
              alt: "Etiqueta de preço digital substituindo uma tabela impressa",
              title: "Chega de repetir preço",
              desc: "Cansado de digitar a mesma tabela toda vez que alguém chama? Seu catálogo responde por você.",
            },
            {
              icon: "✨",
              image: "/images/day-to-day/professional-catalog.png",
              alt: "Catálogo profissional em um celular",
              title: "Parece um site de verdade",
              desc: "Nada de fotos soltas no WhatsApp. Seu cliente abre um catálogo profissional, com a cara da sua marca.",
            },
            {
              icon: "💬",
              image: "/images/day-to-day/qualified-whatsapp-lead.png",
              alt: "Mensagem de cliente com serviço, veículo e preço confirmados",
              title: "Cliente chega sabendo o que quer",
              desc: "O WhatsApp chega com o serviço, o veículo e o preço já escritos. Você só confirma o horário.",
            },
            {
              icon: "📸",
              image: "/images/day-to-day/before-after-results.png",
              alt: "Comparação visual de antes e depois em uma porta de carro",
              title: "Seus resultados vendem por você",
              desc: "Antes e depois, fotos e vídeo do trabalho — o cliente vê a qualidade antes de perguntar.",
            },
            {
              icon: "🔄",
              image: "/images/day-to-day/instant-updates.png",
              alt: "Catálogo atualizado instantaneamente",
              title: "Sempre atualizado, nunca mais reimpresso",
              desc: "Mudou o preço? Edita na hora. O catálogo já sai certo pro próximo cliente.",
            },
            {
              icon: "🚗",
              image: "/images/day-to-day/vehicle-price.png",
              alt: "Preços para diferentes tipos de veículo",
              title: "Preço por tipo de veículo",
              desc: "Hatch, sedan, SUV, picape — cada um com o valor certo, sem confusão.",
            },
            {
              icon: "⚡",
              image: "/images/day-to-day/publish-fast.png",
              alt: "Catálogo publicado rapidamente",
              title: "No ar em minutos",
              desc: "Sem programar, sem contratar ninguém. Você preenche, publica e já pode divulgar.",
            },
            {
              icon: "🔗",
              image: "/images/day-to-day/one-link.png",
              alt: "Um link conectando catálogo e canais de atendimento",
              title: "Um link só pra tudo",
              desc: "Coloca na bio do Instagram, manda no status, deixa fixado no WhatsApp Business — um único link pra vida toda.",
            },
          ].map((r) => (
            <div key={r.title} className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-center">
              <div className="mb-2 flex h-[72px] items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt={r.alt} className="h-[72px] w-[72px] object-contain" />
              </div>
              <p className="text-sm font-semibold">{r.title}</p>
              <p className="mt-1 text-xs text-white/50">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 1 — Catálogo geral */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Seu catálogo</p>
          <h2 className="text-2xl font-bold">Seu catálogo, do jeito que seu cliente vê.</h2>
          <p className="mt-3 text-sm text-white/60">
            Um site profissional, com a cara da sua marca, pronto pra receber quem chega pelo link — sem parecer
            fotos soltas no WhatsApp.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/catalogo-geral.png"
              alt="Visão geral do catálogo público, com o hero e a lista de serviços"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 2 — Preço por veículo — fundo escuro (primária) */}
      <section className="px-4 py-16" style={{ backgroundColor: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">Chega de repetir</p>
          <h2 className="text-2xl font-bold">
            &ldquo;Quanto custa pra SUV?&rdquo; Seu cliente responde sozinho.
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Ele seleciona o veículo dele e o preço certo aparece na hora. Você para de digitar a mesma tabela de
            preço todo dia.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-white/20 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/preco-por-veiculo.png"
              alt="Seletor de tipo de veículo mudando o preço exibido no catálogo"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 3 — WhatsApp personalizado */}
      <section className="bg-[#141414] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Lead qualificado</p>
          <h2 className="text-2xl font-bold">O WhatsApp chega pronto pra fechar.</h2>
          <p className="mt-3 text-sm text-white/60">
            A mensagem já vem com o serviço, o veículo e o preço que ele viu. Você só confirma o horário — sem
            interrogatório.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/whatsapp-personalizado.png"
              alt="Mensagem de WhatsApp pré-preenchida com serviço, veículo e preço"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 4 — Antes e depois — fundo escuro (primária) */}
      <section className="px-4 py-16" style={{ backgroundColor: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">Prova visual</p>
          <h2 className="text-2xl font-bold">Seus resultados falam antes de você precisar falar.</h2>
          <p className="mt-3 text-sm text-white/80">
            Antes e depois com slider interativo, separados por categoria. O cliente compara com o dedo, sem sair
            do catálogo.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-white/20 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/antes-depois.png"
              alt="Slider interativo comparando o antes e o depois de um serviço"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 5 — Portfólio / galeria */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Todo o seu trabalho</p>
          <h2 className="text-2xl font-bold">Todo o seu portfólio, num lugar só.</h2>
          <p className="mt-3 text-sm text-white/60">
            Suba quantas fotos quiser em cada serviço. O cliente rola e vê a qualidade do seu trabalho antes de
            chamar.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/portfolio-galeria.png"
              alt="Galeria de fotos de um serviço no catálogo público"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 6 — Provas sociais */}
      <section className="bg-[#141414] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Confiança</p>
          <h2 className="text-2xl font-bold">O que seus clientes dizem, bem na frente de quem chega.</h2>
          <p className="mt-3 text-sm text-white/60">
            Avaliações com estrelas e comentário, cadastradas por você em segundos — reforçando confiança antes do
            primeiro contato.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/provas-sociais.png"
              alt="Avaliações de clientes com estrelas e comentários no catálogo"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 7 — Mini VSL: o sistema por dentro — bloco branco, vídeo 9:16 */}
      <section className="px-4 py-16" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/40">Veja funcionando</p>
          <h2 className="text-2xl font-bold text-neutral-900">O sistema por dentro, em menos de 1 minuto.</h2>
          <p className="mt-3 text-sm text-neutral-600">
            Do preenchimento à publicação: veja como fica simples montar seu catálogo e como ele aparece pro seu
            cliente.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[320px] overflow-hidden rounded-2xl border border-black/10 bg-neutral-100 shadow-lg">
            <video
              src="/videos/sections/mini-vsl-sistema.mp4"
              poster="/images/sections/mini-vsl-poster.png"
              controls
              playsInline
              className="h-full w-full object-cover"
            >
              Seu navegador não suporta vídeo. Veja o sistema no link do catálogo.
            </video>
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 8 — Personalização — abre a faixa clara que vai até Planos */}
      <section className="px-4 py-16" style={{ backgroundColor: LIGHT_BG }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/40">Sua cara, seu controle</p>
          <h2 className="text-2xl font-bold text-neutral-900">Sua marca, do seu jeito.</h2>
          <p className="mt-3 text-sm text-neutral-600">
            Defina a cor principal e a de destaque, e escolha quais blocos aparecem no seu catálogo — sem risco de
            bagunçar o layout, porque a estrutura já vem pronta e bonita.
          </p>
          <div className="mx-auto mt-8 aspect-[9/16] max-w-[280px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/personalizacao-marca.png"
              alt="Painel de personalização com seletor de cores e templates"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* AGULHADA — método antigo vs Vitrine Detail */}
      <section className="px-4 py-16" style={{ backgroundColor: LIGHT_BG_DEEP }}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-black/40">
            Chega de fazer do jeito difícil
          </p>
          <h2 className="text-2xl font-bold text-neutral-900">
            Nunca mais use PDF pra vender estética automotiva.
          </h2>

          <div className="mx-auto mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Jeito antigo */}
            <div className="rounded-2xl border border-black/10 bg-white/60 p-6 text-left">
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-wide text-neutral-400">
                Do jeito antigo
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  "PDF que ninguém atualiza",
                  "Preço decorado, repetido toda hora",
                  "Fotos soltas perdidas no WhatsApp",
                  "Sem jeito de saber quem visualizou",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-neutral-500">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[11px] text-white">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Com o Vitrine Detail */}
            <div
              className="rounded-2xl border-2 bg-white p-6 text-left shadow-lg"
              style={{ borderColor: PRIMARY }}
            >
              <p className="mb-4 text-center text-xs font-bold uppercase tracking-wide" style={{ color: PRIMARY }}>
                Com o Vitrine Detail
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  "Link único, sempre atualizado",
                  "Preço certo pro veículo, sozinho",
                  "Antes/depois e portfólio organizados",
                  "Analytics de quem visitou seu catálogo",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-neutral-800">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS — fundo preto; só o card Profissional é branco */}
      <section id="planos" className="px-4 py-20" style={{ backgroundColor: "#0a0a0a" }}>
        <h2 className="mb-2 text-center text-2xl font-bold text-white">Escolha seu plano</h2>
        <p className="mb-10 text-center text-sm text-white/50">
          Uma mensalidade de estética esquecida já paga a ferramenta pro ano inteiro.
        </p>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* ESSENCIAL — preto texturizado, recuado, menos destaque */}
          <div
            className="rounded-2xl border border-white/10 p-6"
            style={{
              backgroundColor: "#131313",
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          >
            <p className="text-sm font-semibold text-white/60">Iniciante</p>
            <p className="mt-3 text-3xl font-bold text-white">
              R$47<span className="text-base font-normal text-white/40"> vitalício</span>
            </p>
            <p className="text-xs text-white/40">pagamento único · sem mensalidade</p>

            <ul className="mt-6 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> Até 3 serviços cadastrados
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> Preço por tipo de veículo
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> WhatsApp com contexto
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> Horários e paleta da marca
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Antes e depois
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Galeria de fotos e vídeos
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Pacotes e avaliações
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Analytics
              </li>
            </ul>

            <PlanCTA label="Quero o Iniciante" />
          </div>

          {/* PROFISSIONAL — card branco, destacado, "Mais escolhido" */}
          <div
            className="relative rounded-2xl border-2 bg-white p-6 shadow-xl"
            style={{ borderColor: PRIMARY }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              ⭐ Mais escolhido
            </span>
            <p className="text-sm font-semibold text-neutral-500">Profissional</p>
            <p className="mt-3 text-3xl font-bold text-neutral-900">
              R$97<span className="text-base font-normal text-neutral-400"> vitalício</span>
            </p>
            <p className="text-xs text-neutral-400">pagamento único · sem mensalidade</p>

            <ul className="mt-6 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Serviços ilimitados
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Preço por tipo de veículo
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> WhatsApp com contexto
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Horários e paleta da marca
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Antes e depois
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Galeria de fotos e vídeos por serviço
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Pacotes e avaliações de clientes
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Analytics de visitantes
              </li>
              <li className="flex items-center gap-2 text-neutral-800">
                <span className="text-emerald-600">✓</span> Sem marca d&apos;água
              </li>
            </ul>

            <PlanCTA label="Quero o Profissional" highlight />
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="px-4 py-16 text-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/garantia-15-dias.png"
            alt="Selo de garantia de 15 dias"
            width={200}
            height={200}
            className="mx-auto mb-4 h-[200px] w-[200px] max-w-[70%] object-contain"
            style={{ filter: "drop-shadow(0 14px 30px rgba(0,0,0,0.4))" }}
          />
          <p className="text-lg font-semibold text-white">Garantia de 15 dias</p>
          <p className="mt-2 text-sm text-white/50">
            Se não fizer sentido pro seu negócio, devolvemos <strong className="text-white/80">100%</strong> do seu
            dinheiro.
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
        className={`block w-full cursor-not-allowed rounded-lg py-3 text-center text-sm font-semibold ${
          highlight ? "bg-neutral-900/5 text-neutral-400" : "bg-white/10 text-white/50"
        }`}
      >
        {label} (em breve)
      </button>
    </div>
  );
}
