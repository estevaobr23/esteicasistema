import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-500">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "neutral" | "success" | "attention" | "brand";
}) {
  const accents = {
    neutral: "bg-neutral-600",
    success: "bg-emerald-500",
    attention: "bg-amber-500",
    brand: "bg-red-500",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${accents[tone]}`} aria-hidden />
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {detail && <div className="mt-1 text-xs text-neutral-500">{detail}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-neutral-800 bg-neutral-900 p-5 ${className}`}>
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "attention" | "danger" | "brand";
}) {
  const styles = {
    neutral: "bg-neutral-800 text-neutral-300",
    success: "bg-emerald-500/15 text-emerald-400",
    attention: "bg-amber-500/15 text-amber-300",
    danger: "bg-red-500/15 text-red-300",
    brand: "bg-red-500/15 text-red-300",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}>{children}</span>;
}

export function QuickAction({ href, title, description, icon }: { href: string; title: string; description: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700 hover:bg-neutral-800"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-neutral-950">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white group-hover:text-red-400">{title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{description}</span>
      </span>
    </Link>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/60 px-5 py-10 text-center">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-neutral-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-900";
