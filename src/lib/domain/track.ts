"use client";

export type EventType =
  | "page_view"
  | "service_view"
  | "package_view"
  | "whatsapp_click"
  | "schedule_click"
  | "portfolio_view";

/**
 * Fire-and-forget: nunca bloqueia navegação, não espera resposta.
 * Não registra nenhum identificador de visitante — só o evento.
 */
export function trackEvent(businessId: string, eventType: EventType, serviceId?: string) {
  const payload = JSON.stringify({ business_id: businessId, event_type: eventType, service_id: serviceId });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/events", blob);
    return;
  }

  fetch("/api/events", { method: "POST", body: payload, keepalive: true }).catch(() => {});
}
