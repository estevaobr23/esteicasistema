"use client";

import { buildWhatsappUrl, type WhatsappContexto } from "@/lib/whatsapp";
import { trackEvent, type EventType } from "@/lib/domain/track";

export default function WhatsappButton({
  numero,
  contexto,
  businessId,
  trackAs = "whatsapp_click",
  serviceId,
  children,
  className,
  style,
}: {
  numero: string;
  contexto?: WhatsappContexto;
  businessId: string;
  trackAs?: EventType;
  serviceId?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={buildWhatsappUrl(numero, contexto)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent(businessId, trackAs, serviceId)}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
