"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Dispara o mesmo evento no Pixel (browser) e na Conversions API (servidor),
 * com o mesmo event_id — o Meta deduplica os dois lados automaticamente.
 */
export function trackMetaEvent(eventName: string, customData?: Record<string, unknown>) {
  const eventId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, customData ?? {}, { eventID: eventId });
  }

  fetch("/api/meta-conversions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      customData: customData ?? {},
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
    }),
    keepalive: true,
  }).catch(() => {
    // Falha de rede não deve travar o clique do usuário — o Pixel client-side já disparou.
  });
}
