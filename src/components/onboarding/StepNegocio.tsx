export default function StepNegocio({
  createBusinessAction,
}: {
  createBusinessAction: (formData: FormData) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Sua estética automotiva</h1>
      <p className="mt-2 text-sm text-neutral-400">
        Vamos começar pelo nome do seu negócio. Você pode ajustar tudo depois.
      </p>

      <form action={createBusinessAction} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Nome da estética
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoFocus
            placeholder="Ex: Black Detail"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
          />
        </div>

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
