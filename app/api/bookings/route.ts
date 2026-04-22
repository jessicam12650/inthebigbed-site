import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { WALKERS } from "@/data/walkers";
import { BOARDERS } from "@/data/boarders";
import { GROOMERS } from "@/data/groomers";

type ProviderKind = "walker" | "boarder" | "groomer";

function providerExists(kind: ProviderKind, id: string): boolean {
  if (kind === "walker") return WALKERS.some((w) => w.id === id);
  if (kind === "boarder") return BOARDERS.some((b) => b.id === id);
  return GROOMERS.some((g) => g.id === id);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const kind = body.provider_kind as unknown;
  const id = body.provider_id as unknown;
  const message = (body.message as unknown) ?? "";

  if (kind !== "walker" && kind !== "boarder" && kind !== "groomer") {
    return NextResponse.json({ error: "Invalid provider_kind" }, { status: 400 });
  }
  if (typeof id !== "string" || id.length === 0 || id.length > 80) {
    return NextResponse.json({ error: "Invalid provider_id" }, { status: 400 });
  }
  if (typeof message !== "string" || message.length > 1000) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  if (!providerExists(kind, id)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase.from("booking_requests").insert({
    user_id: user.id,
    provider_kind: kind,
    provider_id: id,
    message,
  });

  if (error) {
    // Schema likely not applied yet — surface the Supabase code so the UI can
    // show a useful fallback message.
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
