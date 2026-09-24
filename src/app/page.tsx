import Image from "next/image";
import FloatingHeader from "@/components/landing/FloatingHeader";
import DownsellModal from "@/components/landing/DownsellModal";
import PlanCTA from "@/components/landing/PlanCTA";
import MetaPixel from "@/components/landing/MetaPixel";

const PRIMARY = "#e11d2a";
const PRIMARY_DEEP = "#b8121e";
const LIGHT_BG = "#f2efec"; // off-white dessaturado, nunca branco puro

// Links de checkout reais (Cakto, produto "Vitrine Detail" 31a03312-a385-4a7e-a706-bded035a84c6)
const CHECKOUT_INICIANTE = "https://pay.cakto.com.br/3dynu44";
const CHECKOUT_DOWNSELL = "https://pay.cakto.com.br/6q6mtju";
const CHECKOUT_PROFISSIONAL = "https://pay.cakto.com.br/coi2uot";

export default function Home() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      <MetaPixel />
      {/* HEADER — só logo e âncoras, sem CTA de conta */}
      <FloatingHeader />

      {/* HERO */}
      <section className="px-4 pb-20 pt-24 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
          Gestão de vitrine para estética automotiva
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Seu próprio catálogo digital, editável e com a{" "}
          <span style={{ color: PRIMARY }}>cara do seu negócio</span>.
        </h1>
        <Image
          src="/images/mockups/vitrine-detail-device-group.png"
          alt="Vitrine Detail em notebook, iPad e iPhone"
          width={1536}
          height={1024}
          unoptimized
          sizes="(max-width: 640px) 100vw, 768px"
          className="mx-auto mt-8 w-full max-w-2xl"
        />
        <p className="mx-auto mt-8 max-w-lg text-white/60">
          Nada de fotos soltas no WhatsApp: um site profissional com preço por veículo, antes e depois e link
          único que já chega convencendo.
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
              icon: "✏️",
              image: "/images/day-to-day/professional-catalog.png",
              alt: "Editor visual do catálogo, edição direta na tela real",
              title: "Edita tocando, sem formulário perdido",
              desc: "Toca direto no texto, na foto ou no preço que quer mudar. Sem aba escondida, sem menu de configuração.",
            },
            {
              icon: "✨",
              image: "/images/day-to-day/qualified-whatsapp-lead.png",
              alt: "Catálogo profissional em um celular",
              title: "Parece um site de verdade",
              desc: "Nada de fotos soltas no WhatsApp. Seu cliente abre um catálogo profissional, com a cara da sua marca.",
            },
            {
              icon: "💬",
              image: "/images/day-to-day/stop-repeating-prices.png",
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
              icon: "📱",
              image: "/images/day-to-day/instant-updates.png",
              alt: "Simulador de celular mostrando o catálogo antes de publicar",
              title: "Veja como fica no celular antes de publicar",
              desc: "Simule a tela do cliente direto no editor. Sem surpresa depois que o link já está no ar.",
            },
            {
              icon: "📊",
              image: "/images/day-to-day/vehicle-price.png",
              alt: "Painel de analytics com visitas e cliques no WhatsApp por serviço",
              title: "Saiba quem clicou, não só quem visitou",
              desc: "Veja quantas pessoas abriram o catálogo e quais serviços mais geraram contato pelo WhatsApp.",
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
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 shadow-2xl">
              <Image
                src="/images/sections/catalogo-geral-lifestyle-ugc.png"
                alt="Cliente entregando as chaves do carro ao profissional de uma estética automotiva"
                fill
                sizes="(max-width: 640px) calc(100vw - 48px), 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
            </div>

            <Image
              src="/images/sections/catalogo-geral-red.png"
              alt="Catálogo público da Vitrine Detail aberto em um iPhone laranja"
              width={941}
              height={1672}
              unoptimized
              sizes="(max-width: 640px) 310px, 360px"
              className="absolute bottom-0 right-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 2 — Edição simplificada com blocos padronizados — fundo escuro (primária) */}
      <section className="px-4 py-16" style={{ backgroundColor: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">Edição simplificada</p>
          <h2 className="text-2xl font-bold">Você edita. A gente cuida de ficar bonito.</h2>
          <p className="mt-3 text-sm text-white/80">
            Blocos prontos de serviço, pacote, galeria e depoimento — você só preenche. Sem entender de design,
            seu catálogo sai alinhado e profissional.
          </p>
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/20 shadow-2xl">
              <Image
                src="/images/sections/edicao-simplificada-lifestyle-ugc.png"
                alt="Profissional de estética automotiva atualizando o catálogo pelo celular dentro da oficina"
                fill
                sizes="(max-width: 640px) calc(100vw - 48px), 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/15" />
            </div>

            <Image
              src="/images/sections/edicao-simplificada-editor-black.png"
              alt="Editor da Vitrine Detail com seleção de templates aberto em um iPhone preto"
              width={941}
              height={1672}
              unoptimized
              sizes="(max-width: 640px) 310px, 360px"
              className="absolute bottom-0 left-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.6)]"
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
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
              <Image
                src="/images/sections/lead-qualificado-lifestyle-ugc.png"
                alt="Cliente e profissional confirmando um serviço pelo celular dentro de uma estética automotiva"
                fill
                sizes="(max-width: 640px) calc(100vw - 48px), 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/20" />
            </div>

            <Image
              src="/images/sections/lead-qualificado-red.png"
              alt="Card de serviço da Vitrine Detail com preço e botão de WhatsApp em um iPhone vermelho"
              width={941}
              height={1672}
              unoptimized
              sizes="(max-width: 640px) 310px, 360px"
              className="absolute bottom-0 left-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.6)]"
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
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/20 shadow-2xl">
              <Image
                src="/images/sections/prova-visual-lifestyle-ugc.png"
                alt="Profissional inspecionando o brilho da pintura após o polimento"
                fill
                sizes="(max-width: 640px) calc(100vw - 48px), 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-transparent to-black/15" />
            </div>

            <Image
              src="/images/sections/prova-visual-black.png"
              alt="Comparação real de antes e depois do catálogo em um iPhone preto"
              width={941}
              height={1672}
              unoptimized
              sizes="(max-width: 640px) 310px, 360px"
              className="absolute bottom-0 right-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>
      </section>

      {/* QUEBRA DE PADRÃO — Comparativo sem vs com, sem mockup, fundo claro */}
      <section className="px-4 py-20" style={{ backgroundColor: LIGHT_BG }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-[#0a0a0a] sm:text-3xl">
            O que muda de verdade quando você tem a Vitrine Detail.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-start">
            <div className="rounded-2xl border border-black/10 bg-white/50 p-6 opacity-90 sm:mt-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Sem o sistema</p>
              <ul className="space-y-3 text-sm text-neutral-600">
                {[
                  "Repete o mesmo preço pro décimo cliente do dia",
                  "Manda foto solta no WhatsApp, sem contexto nenhum",
                  "Catálogo em PDF ou papel que fica desatualizado em uma semana",
                  "Cliente pergunta tudo antes de decidir se chama",
                  "Ninguém sabe quantas pessoas veem o trabalho",
                  "Parece mais um perfil de rede social que um negócio",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "#dc2626" }}
                    >
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative rounded-2xl border-2 p-6 shadow-[0_20px_45px_-15px_rgba(225,29,42,0.35)] sm:scale-[1.04]"
              style={{ borderColor: PRIMARY, backgroundColor: "#fff" }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-md"
                style={{ backgroundColor: PRIMARY }}
              >
                Com a Vitrine Detail
              </span>
              <ul className="mt-3 space-y-3 text-sm font-medium text-neutral-900">
                {[
                  "Manda o link e o preço certo já aparece pro veículo dele",
                  "Catálogo com a cara da sua marca, com cara de site de verdade",
                  "Nada de PDF ou papel: atualiza uma vez e já vale pra todo mundo",
                  "Cliente chega no WhatsApp já sabendo o que quer",
                  "Você vê quem visitou e quem clicou em cada serviço",
                  "Passa confiança de negócio estabelecido, não de perfil amador",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: "#06a742" }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 text-center">
            <a
              href="#planos"
              className="inline-block rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              Quero sair do PDF e ter minha vitrine
            </a>
            <p className="mt-3 text-xs text-neutral-500">Pagamento único · acesso vitalício</p>
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 5 — Vídeos no catálogo */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Mais que foto</p>
          <h2 className="text-2xl font-bold">Vídeo do serviço rodando gera mais confiança que foto parada.</h2>
          <p className="mt-3 text-sm text-white/60">
            Mostre o processo, o resultado, o cuidado com o carro. O cliente assiste antes de chamar e chega muito
            mais decidido.
          </p>
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
              <Image src="/images/sections/mais-que-foto-lifestyle.png" alt="Profissional gravando o resultado de um serviço na oficina" fill sizes="(max-width: 640px) calc(100vw - 48px), 420px" className="object-cover" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/mais-que-foto-youtube-red.png"
              alt="Vídeo de um serviço reproduzindo dentro do catálogo público"
              className="absolute bottom-0 right-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>
      </section>

      {/* TANGIBILIZAÇÃO 6 — É basicamente seu próprio site */}
      <section className="bg-[#141414] px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Não é só um catálogo</p>
          <h2 className="text-2xl font-bold">É basicamente o seu próprio site, sem precisar de programador.</h2>
          <p className="mt-3 text-sm text-white/60">
            Domínio com seu nome, sua logo, suas cores. Quem recebe o link enxerga um site de verdade — não mais
            um catálogo qualquer de WhatsApp.
          </p>
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-white/15 shadow-2xl">
              <Image src="/images/sections/site-proprio-lifestyle.png" alt="Profissional mostrando o site da estética automotiva para um cliente" fill sizes="(max-width: 640px) calc(100vw - 48px), 420px" className="object-cover" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/site-proprio-red.png"
              alt="Catálogo com a cara da marca do negócio, parecendo um site próprio"
              className="absolute bottom-0 left-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.6)]"
            />
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
          <div className="relative mx-auto mt-8 h-[460px] w-full max-w-md sm:h-[540px]">
            <div className="absolute inset-x-1 top-12 aspect-[4/3] overflow-hidden rounded-[28px] border border-black/10 shadow-2xl">
              <Image src="/images/sections/personalizacao-lifestyle.png" alt="Profissional personalizando sua marca pelo celular na oficina" fill sizes="(max-width: 640px) calc(100vw - 48px), 420px" className="object-cover" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sections/personalizacao-paletas-black.png"
              alt="Painel de personalização com seletor de cores e templates"
              className="absolute bottom-0 left-0 z-10 h-full w-auto drop-shadow-[0_24px_28px_rgba(0,0,0,0.35)]"
            />
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
              R$37<span className="text-base font-normal text-white/40"> vitalício</span>
            </p>
            <p className="text-xs text-white/40">pagamento único · sem mensalidade</p>

            <Image
              src="/images/mockups/vitrine-detail-device-group.png"
              alt="Vitrine Detail em notebook, iPad e iPhone"
              width={1536}
              height={1024}
              unoptimized
              sizes="(max-width: 640px) 100vw, 320px"
              className="mx-auto mt-4 w-full max-w-[280px]"
            />

            <ul className="mt-6 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> Até 3 serviços cadastrados
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> WhatsApp com contexto
              </li>
              <li className="flex items-center gap-2 text-white/80">
                <span className="text-emerald-500">✓</span> Horários e paleta da marca
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Portfólio e galeria de fotos
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Vídeos no catálogo
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Pacotes e avaliações
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Analytics de visitantes
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Ocultar seções do catálogo
              </li>
              <li className="flex items-center gap-2 text-white/40">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">✕</span>
                Catálogo com marca d&rsquo;água
              </li>
            </ul>

            <DownsellModal
              label="Quero o Iniciante"
              iniciantLink={CHECKOUT_INICIANTE}
              downsellLink={CHECKOUT_DOWNSELL}
            />
          </div>

          {/* PROFISSIONAL — card branco, destacado, "Mais escolhido" */}
          <div
            className="relative rounded-2xl border-2 bg-white p-6 pt-8 text-center shadow-xl"
            style={{ borderColor: PRIMARY }}
          >
            {/* 1. Pill de destaque */}
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: PRIMARY }}
            >
              ⭐ Mais escolhido
            </span>

            {/* 2. Headline completa do plano */}
            <p className="text-sm font-semibold text-neutral-500">Profissional</p>
            <h3 className="mt-1 text-lg font-bold text-neutral-900">
              Sua vitrine completa, sem limites
            </h3>

            {/* 3. Mockup */}
            <Image
              src="/images/mockups/vitrine-detail-device-group.png"
              alt="Vitrine Detail em notebook, iPad e iPhone"
              width={1536}
              height={1024}
              unoptimized
              sizes="(max-width: 640px) 100vw, 360px"
              className="mx-auto mt-4 w-full max-w-sm"
            />

            {/* 4. Preço com valor parcelado em verde */}
            <div className="mt-6 border-y border-black/5 py-4">
              <p className="text-3xl font-black tracking-tight text-neutral-900">
                R$67<span className="text-base font-normal text-neutral-400"> vitalício</span>
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: "#06a742" }}>
                ou <b>12x de R$6,70</b> · pagamento único no PIX
              </p>
              <p className="mt-1 text-xs text-neutral-400">Pagamento único e zero mensalidade.</p>
            </div>

            {/* 6. O que está incluso */}
            <div className="mt-6 text-left">
              <p className="mb-3 text-sm font-bold uppercase tracking-[.08em] text-neutral-900">
                O que está incluso:
              </p>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Serviços ilimitados",
                  "WhatsApp com contexto",
                  "Horários e paleta da marca",
                  "Portfólio e galeria de fotos",
                  "Vídeos no catálogo",
                  "Pacotes e avaliações de clientes",
                  "Analytics de visitantes",
                  "Oculta e reordena seções do catálogo",
                  "Sem marca d'água",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-neutral-800">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: "#06a742" }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 7. CTA */}
            <div className="mt-6">
              <PlanCTA label="Quero o Profissional" href={CHECKOUT_PROFISSIONAL} value={67} highlight />
            </div>
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

