import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { WALKERS } from "@/data/walkers";
import { BOARDERS } from "@/data/boarders";
import { GROOMERS } from "@/data/groomers";
import { DAYCARES } from "@/data/daycares";

type ProviderKind = "walker" | "boarder" | "groomer" | "daycare";

const OWNER_EMAIL = "jessicam12@hotmail.co.uk";
const FROM_EMAIL = "In The Big Bed <enquiries@inthebigbed.co.uk>";
const SITE_URL = "https://www.inthebigbed.co.uk";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function providerExists(kind: ProviderKind, id: string): boolean {
  if (kind === "walker") return WALKERS.some((w) => w.id === id);
  if (kind === "boarder") return BOARDERS.some((b) => b.id === id);
  if (kind === "groomer") return GROOMERS.some((g) => g.id === id);
  return DAYCARES.some((d) => d.id === id);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EnquiryRecord = {
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  dog_name: string;
  dog_breed: string | null;
  dog_size: string | null;
  start_date: string;
  end_date: string;
  message: string | null;
  provider_kind: ProviderKind;
  provider_id: string;
  provider_name: string;
  claimed: boolean;
};

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY missing — emails skipped");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`Resend send failed (${res.status}): ${text}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send threw:", err);
    return false;
  }
}

function ownerEmailHtml(r: EnquiryRecord): string {
  const claimedTag = r.claimed ? "[CLAIMED LISTING]" : "[UNCLAIMED LISTING]";
  const providerLink = `${SITE_URL}/${r.provider_kind === "boarder" ? "boarding" : r.provider_kind === "daycare" ? "daycare" : r.provider_kind === "walker" ? "walkers" : "groomers"}/${r.provider_id}`;
  const rows: Array<[string, string]> = [
    ["Provider", `${r.provider_name} (${r.provider_kind})`],
    ["Listing", providerLink],
    ["Status", claimedTag],
    ["Name", r.guest_name],
    ["Email", r.guest_email],
    ["Phone", r.guest_phone || "—"],
    ["Dog name", r.dog_name],
    ["Dog breed", r.dog_breed || "—"],
    ["Dog size", r.dog_size || "—"],
    ["Dates", `${r.start_date} → ${r.end_date}`],
    ["Message", r.message || "—"],
  ];
  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;color:#666;">${escapeHtml(k)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;max-width:600px;">
      <h2 style="margin:0 0 4px 0;">🐾 New enquiry: ${escapeHtml(r.provider_name)}</h2>
      <p style="margin:0 0 16px 0;color:#666;font-size:14px;"><strong>${claimedTag}</strong></p>
      <table style="border-collapse:collapse;width:100%;font-size:14px;">${tableRows}</table>
      <p style="margin-top:24px;font-size:13px;color:#666;">Reply directly to this email to reach ${escapeHtml(r.guest_name)}.</p>
    </div>
  `;
}

function userEmailHtml(r: EnquiryRecord): string {
  const unclaimedNote = r.claimed
    ? ""
    : `<p style="margin:16px 0;padding:12px;background:#fff7ed;border-left:3px solid #c2410c;font-size:14px;">Note: ${escapeHtml(r.provider_name)} hasn&apos;t claimed their In The Big Bed profile yet, so we&apos;re forwarding your enquiry to them directly. Replies may take a little longer.</p>`;
  return `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;max-width:600px;">
      <h2 style="margin:0 0 12px 0;">Thanks, ${escapeHtml(r.guest_name)} 🐾</h2>
      <p style="font-size:15px;line-height:1.5;">We&apos;ve received your enquiry to <strong>${escapeHtml(r.provider_name)}</strong> and passed it on. You should hear back within a few days.</p>
      <p style="font-size:15px;line-height:1.5;">In the meantime, you can browse other licensed boarders at <a href="${SITE_URL}/boarding" style="color:#c2410c;">inthebigbed.co.uk/boarding</a>.</p>
      ${unclaimedNote}
      <p style="margin-top:24px;font-size:13px;color:#888;">— In The Big Bed</p>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const kind = body.provider_kind as unknown;
  const providerId = body.provider_id as unknown;
  const providerName = body.provider_name as unknown;
  const claimed = Boolean(body.claimed);

  if (kind !== "walker" && kind !== "boarder" && kind !== "groomer" && kind !== "daycare") {
    return NextResponse.json({ error: "Invalid provider type." }, { status: 400 });
  }
  if (typeof providerId !== "string" || providerId.length === 0 || providerId.length > 80) {
    return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  }
  if (typeof providerName !== "string" || providerName.length === 0 || providerName.length > 200) {
    return NextResponse.json({ error: "Invalid provider name." }, { status: 400 });
  }
  if (!providerExists(kind, providerId)) {
    return NextResponse.json({ error: "Unknown provider." }, { status: 404 });
  }

  const guestName = typeof body.guest_name === "string" ? body.guest_name.trim() : "";
  const guestEmail = typeof body.guest_email === "string" ? body.guest_email.trim() : "";
  const guestPhone =
    typeof body.guest_phone === "string" && body.guest_phone.trim() ? body.guest_phone.trim() : null;
  const dogName = typeof body.dog_name === "string" ? body.dog_name.trim() : "";
  const dogBreed =
    typeof body.dog_breed === "string" && body.dog_breed.trim() ? body.dog_breed.trim() : null;
  const dogSize =
    typeof body.dog_size === "string" && ["small", "medium", "large"].includes(body.dog_size)
      ? body.dog_size
      : null;
  const startDate = typeof body.start_date === "string" ? body.start_date : "";
  const endDate = typeof body.end_date === "string" ? body.end_date : "";
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message.trim().slice(0, 1000)
      : null;

  if (!guestName || guestName.length > 120) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(guestEmail) || guestEmail.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!dogName || dogName.length > 80) {
    return NextResponse.json({ error: "Please enter your dog's name." }, { status: 400 });
  }
  if (!ISO_DATE_RE.test(startDate) || !ISO_DATE_RE.test(endDate)) {
    return NextResponse.json({ error: "Please choose valid dates." }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json(
      { error: "End date must be on or after the start date." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload: Record<string, unknown> = {
    user_id: user?.id ?? null,
    provider_kind: kind,
    provider_id: providerId,
    provider_name: providerName,
    message: message ?? "",
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
    dog_name: dogName,
    dog_breed: dogBreed,
    dog_size: dogSize,
    start_date: startDate,
    end_date: endDate,
  };

  const { error: insertError } = await supabase.from("booking_requests").insert(insertPayload);
  if (insertError) {
    console.error("booking_requests insert failed:", insertError);
    return NextResponse.json(
      { error: "We couldn't save your enquiry. Please try again." },
      { status: 500 },
    );
  }

  const record: EnquiryRecord = {
    guest_name: guestName,
    guest_email: guestEmail,
    guest_phone: guestPhone,
    dog_name: dogName,
    dog_breed: dogBreed,
    dog_size: dogSize,
    start_date: startDate,
    end_date: endDate,
    message,
    provider_kind: kind,
    provider_id: providerId,
    provider_name: providerName,
    claimed,
  };

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing — emails skipped");
    return NextResponse.json({ success: true, emails_sent: false });
  }

  const [ownerOk, userOk] = await Promise.all([
    sendEmail({
      to: OWNER_EMAIL,
      subject: `🐾 New enquiry: ${providerName}`,
      html: ownerEmailHtml(record),
      replyTo: guestEmail,
    }),
    sendEmail({
      to: guestEmail,
      subject: `We've received your enquiry to ${providerName} 🐾`,
      html: userEmailHtml(record),
    }),
  ]);

  return NextResponse.json({ success: true, emails_sent: ownerOk && userOk });
}
