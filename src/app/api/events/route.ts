import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_EVENTS = new Set([
  "page_view",
  "service_view",
  "package_view",
  "whatsapp_click",
  "schedule_click",
  "portfolio_view",
]);

export async function POST(request: Request) {
  let body: { business_id?: string; event_type?: string; service_id?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const { business_id, event_type, service_id } = body;

  if (!business_id || !event_type || !VALID_EVENTS.has(event_type)) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("id", business_id)
    .eq("published", true)
    .maybeSingle();

  if (!business) return NextResponse.json({ ok: false }, { status: 200 });

  const { error } = await admin.from("analytics_events").insert({
    business_id,
    event_type,
    service_id: service_id ?? null,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
