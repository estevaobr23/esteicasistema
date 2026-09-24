import { NextResponse } from "next/server";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_ACCESS_TOKEN;

export async function POST(request: Request) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json({ ok: false, error: "Pixel não configurado" }, { status: 200 });
  }

  let body: {
    eventName?: string;
    eventId?: string;
    customData?: Record<string, unknown>;
    eventSourceUrl?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const { eventName, eventId, customData, eventSourceUrl } = body;
  if (!eventName || !eventId) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const fbp = request.headers
    .get("cookie")
    ?.match(/_fbp=([^;]+)/)?.[1];
  const fbc = request.headers
    .get("cookie")
    ?.match(/_fbc=([^;]+)/)?.[1];

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: {
          client_ip_address: ip,
          client_user_agent: userAgent,
          fbp,
          fbc,
        },
        custom_data: customData ?? {},
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ ok: false, error: errText }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
