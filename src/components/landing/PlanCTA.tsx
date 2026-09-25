"use client";

import { trackMetaEvent } from "@/lib/meta-pixel";
import { withUtm } from "@/lib/utm";

export default function PlanCTA({
  label,
  href,
  highlight,
  value,
}: {
  label: string;
  href: string;
  highlight?: boolean;
  value: number;
}) {
  return (
    <div className="mt-6">
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          trackMetaEvent("InitiateCheckout", { value, currency: "BRL", content_name: label });
          window.location.href = withUtm(href);
        }}
        className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition ${
          highlight ? "text-white hover:opacity-90" : "bg-white/10 text-white hover:bg-white/15"
        }`}
        style={highlight ? { backgroundColor: "#06a742" } : undefined}
      >
        {label}
      </a>
    </div>
  );
}
