import Link from "next/link";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; redirect?: string }>;
}) {
  const { erro, redirect } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Entrar</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Acesse o painel do seu catálogo.
          </p>
        </div>

        {erro && (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect ?? "/app/dashboard"} />

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
              E-mail
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
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Acabou de comprar?{" "}
          <Link href="/cadastro" className="font-medium text-white underline underline-offset-2">
            Crie sua conta
          </Link>
        </p>
      </div>
    </main>
  );
}
