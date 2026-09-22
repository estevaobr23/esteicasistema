type ChecklistItem = { label: string; done: boolean };

export default function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  const total = items.length;
  const feitos = items.filter((i) => i.done).length;
  const pct = Math.round((feitos / total) * 100);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Complete seu catálogo</h2>
        <span className="text-xs font-medium text-neutral-400">{pct}% completo</span>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            <span className={item.done ? "text-emerald-500" : "text-neutral-600"}>
              {item.done ? "✅" : "⬜"}
            </span>
            <span className={item.done ? "text-neutral-300" : "text-neutral-500"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
