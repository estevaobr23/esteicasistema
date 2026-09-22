import Link from "next/link";
import { signUp } from "../actions";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Criar sua conta</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Use o <strong className="text-white">mesmo e-mail</strong> que você usou na compra.
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <form action={signUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Seu nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
              E-mail da compra
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
              placeholder="voce@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Crie uma senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
              placeholder="mínimo 8 caracteres"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Criar conta e configurar meu catálogo
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-white underline underline-offset-2">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
