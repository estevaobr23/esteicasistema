import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 py-20 text-center text-white">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
        Catálogo-site para estética automotiva
      </p>
      <h1 className="max-w-xl text-4xl font-bold leading-tight">
        Coloque a vitrine digital da sua estética automotiva no ar em poucos minutos
      </h1>
      <p className="mt-4 max-w-md text-neutral-400">
        Envie apenas um link. Seus clientes veem serviços, preços por veículo, antes/depois e chamam no WhatsApp já
        sabendo o que querem.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/cadastro" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950">
          Já comprei — criar minha conta
        </Link>
        <Link href="/login" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold">
          Entrar
        </Link>
      </div>
    </main>
  );
}
