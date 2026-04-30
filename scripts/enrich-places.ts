/**
 * Enrich data/venues.ts with verified data from the Google Places API.
 *
 * USAGE:
 *   1) Enable the Places API for your existing Google Cloud key
 *      (the same one used for NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
 *   2) export GOOGLE_PLACES_API_KEY=your_key
 *   3) npm run enrich:places
 *   4) Review the diff in data/venues.ts before committing — manually-set
 *      `description` strings are preserved. Run again any time you add new
 *      stub entries (latLng=[0,0]); already-enriched entries are skipped.
 *
 * What it does, per venue / per location within a grouped venue:
 *   - findPlaceFromText to resolve "{name}, {address}" → place_id, geometry,
 *     formatted_address.
 *   - Place Details on the resolved place_id for rating, user_ratings_total,
 *     opening_hours.weekday_text, formatted_phone_number, website,
 *     editorial_summary.
 *   - Updates the venue: location.latLng, location.placeId, location.address
 *     (replaced with formatted_address), and venue-level rating, user
 *     ratings, hours, phone, website. Description only fills if blank AND
 *     the API returns an editorial_summary — never overwrites manual copy.
 *
 * Output is a freshly-rendered data/venues.ts. Type definitions, helpers
 * (ALL_VENUES, venuePins, LIVERPOOL_CENTER) and the file's leading comment
 * are preserved verbatim — only the HANDPICKED and VENUES array bodies are
 * regenerated.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { HANDPICKED, VENUES, type Venue, type VenueLocation } from "../data/venues";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const VENUES_PATH = path.join(process.cwd(), "data", "venues.ts");
const DELAY_MS = 100;

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY. See top-of-file usage notes.");
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Candidate = {
  place_id: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
  name?: string;
};

type Details = {
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { weekday_text?: string[] };
  formatted_phone_number?: string;
  website?: string;
  editorial_summary?: { overview?: string };
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
  place_id?: string;
};

type ApiError = { status: string; message?: string };
type ApiResult<T> = { ok: T } | { err: ApiError };

// Google's Places REST API returns spurious REQUEST_DENIED ("API key is
// expired") on roughly 15-20% of calls — confirmed reproducible against the
// same place_id, with serial calls and pacing. Retrying clears it almost
// every time. ZERO_RESULTS and INVALID_REQUEST are real and not retried.
const RETRYABLE_STATUSES = new Set([
  "REQUEST_DENIED",
  "UNKNOWN_ERROR",
  "OVER_QUERY_LIMIT",
  "NETWORK_ERROR",
]);
const RETRY_DELAYS_MS = [1000, 3000];

async function withRetry<T>(
  label: string,
  attempt: () => Promise<ApiResult<T>>,
): Promise<ApiResult<T>> {
  let last: ApiResult<T> = await attempt();
  for (let i = 0; i < RETRY_DELAYS_MS.length; i++) {
    if (!("err" in last) || !RETRYABLE_STATUSES.has(last.err.status)) return last;
    const delay = RETRY_DELAYS_MS[i];
    console.log(`    ↻ retry ${i + 1}/${RETRY_DELAYS_MS.length} for ${label} after ${last.err.status} (waiting ${delay}ms)`);
    await sleep(delay);
    last = await attempt();
  }
  return last;
}

async function rawFindPlace(query: string): Promise<ApiResult<Candidate | null>> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  url.searchParams.set("input", query);
  url.searchParams.set("inputtype", "textquery");
  url.searchParams.set("fields", "place_id,formatted_address,geometry,name");
  url.searchParams.set("key", API_KEY!);
  try {
    const res = await fetch(url);
    const json = (await res.json()) as {
      status: string;
      candidates?: Candidate[];
      error_message?: string;
    };
    if (json.status === "OK") {
      return { ok: json.candidates && json.candidates.length > 0 ? json.candidates[0] : null };
    }
    if (json.status === "ZERO_RESULTS") return { ok: null };
    return { err: { status: json.status, message: json.error_message } };
  } catch (err) {
    return { err: { status: "NETWORK_ERROR", message: err instanceof Error ? err.message : String(err) } };
  }
}

async function rawPlaceDetails(placeId: string): Promise<ApiResult<Details | null>> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "rating,user_ratings_total,opening_hours,formatted_phone_number,website,editorial_summary,formatted_address,geometry,place_id",
  );
  url.searchParams.set("key", API_KEY!);
  try {
    const res = await fetch(url);
    const json = (await res.json()) as {
      status: string;
      result?: Details;
      error_message?: string;
    };
    if (json.status === "OK") return { ok: json.result ?? null };
    if (json.status === "ZERO_RESULTS") return { ok: null };
    return { err: { status: json.status, message: json.error_message } };
  } catch (err) {
    return { err: { status: "NETWORK_ERROR", message: err instanceof Error ? err.message : String(err) } };
  }
}

function findPlace(query: string): Promise<ApiResult<Candidate | null>> {
  return withRetry(`findPlace("${query}")`, () => rawFindPlace(query));
}

function placeDetails(placeId: string): Promise<ApiResult<Details | null>> {
  return withRetry(`details(${placeId})`, () => rawPlaceDetails(placeId));
}

function locationNeedsEnrichment(loc: VenueLocation): boolean {
  if (!loc.placeId) return true;
  const [lat, lng] = loc.latLng;
  if (lat === 0 && lng === 0) return true;
  return false;
}

function venueNeedsEnrichment(v: Venue): boolean {
  if (v.locations) return v.locations.some(locationNeedsEnrichment) || v.rating == null;
  if (v.location) return locationNeedsEnrichment(v.location) || v.rating == null;
  return false;
}

type Outcome = "enriched" | "partial" | "no_result" | "error" | "skipped";

type FailedQuery = { name: string; query: string; status: string; message?: string };

type ProcessResult = {
  outcome: Outcome;
  failed: FailedQuery[];
};

async function enrichLocation(
  name: string,
  loc: VenueLocation,
): Promise<{ enriched: boolean; failed?: FailedQuery }> {
  const query = `${name}, ${loc.address}`;
  const result = await findPlace(query);
  if ("err" in result) {
    return { enriched: false, failed: { name, query, ...result.err } };
  }
  if (result.ok == null) {
    return { enriched: false, failed: { name, query, status: "ZERO_RESULTS" } };
  }
  const c = result.ok;
  let touched = false;
  if (c.place_id && c.place_id !== loc.placeId) {
    loc.placeId = c.place_id;
    touched = true;
  }
  if (c.geometry?.location) {
    const newLatLng: [number, number] = [c.geometry.location.lat, c.geometry.location.lng];
    if (loc.latLng[0] !== newLatLng[0] || loc.latLng[1] !== newLatLng[1]) {
      loc.latLng = newLatLng;
      touched = true;
    }
  }
  if (c.formatted_address && c.formatted_address !== loc.address) {
    loc.address = c.formatted_address;
    touched = true;
  }
  return { enriched: touched };
}

async function enrichVenueDetails(
  v: Venue,
  placeId: string,
): Promise<{ enriched: boolean; failed?: FailedQuery }> {
  const result = await placeDetails(placeId);
  if ("err" in result) {
    return { enriched: false, failed: { name: v.name, query: `details:${placeId}`, ...result.err } };
  }
  if (result.ok == null) {
    return { enriched: false };
  }
  const d = result.ok;
  let touched = false;
  if (d.rating != null && d.rating !== v.rating) {
    v.rating = d.rating;
    touched = true;
  }
  if (d.user_ratings_total != null && d.user_ratings_total !== v.userRatingsTotal) {
    v.userRatingsTotal = d.user_ratings_total;
    touched = true;
  }
  if (d.opening_hours?.weekday_text) {
    v.hours = d.opening_hours.weekday_text;
    touched = true;
  }
  if (d.formatted_phone_number && d.formatted_phone_number !== v.phone) {
    v.phone = d.formatted_phone_number;
    touched = true;
  }
  if (d.website && d.website !== v.website) {
    v.website = d.website;
    touched = true;
  }
  if (!v.description && d.editorial_summary?.overview) {
    v.description = d.editorial_summary.overview;
    touched = true;
  }
  return { enriched: touched };
}

async function processVenue(v: Venue): Promise<ProcessResult> {
  if (!venueNeedsEnrichment(v)) {
    console.log(`⏭️   ${v.name} — already enriched`);
    return { outcome: "skipped", failed: [] };
  }

  const failed: FailedQuery[] = [];
  let anyEnriched = false;
  let anyMissed = false;
  let firstFatal: FailedQuery | null = null;

  const recordFailure = (f: FailedQuery) => {
    failed.push(f);
    // ZERO_RESULTS = expected miss, anything else = real API error.
    if (f.status === "ZERO_RESULTS") anyMissed = true;
    else if (!firstFatal) firstFatal = f;
  };

  const locsToProcess = v.locations ?? (v.location ? [v.location] : []);
  for (const loc of locsToProcess) {
    if (!locationNeedsEnrichment(loc)) continue;
    const r = await enrichLocation(v.name, loc);
    if (r.enriched) anyEnriched = true;
    if (r.failed) recordFailure(r.failed);
    await sleep(DELAY_MS);
    if (firstFatal) break;
  }

  if (!firstFatal) {
    const placeId = v.locations
      ? v.locations.find((l) => l.placeId)?.placeId
      : v.location?.placeId;
    if (placeId) {
      const r = await enrichVenueDetails(v, placeId);
      if (r.enriched) anyEnriched = true;
      if (r.failed) recordFailure(r.failed);
      await sleep(DELAY_MS);
    }
  }

  let outcome: Outcome;
  if (firstFatal) {
    outcome = "error";
    const f = firstFatal as FailedQuery;
    console.error(`❌  ${v.name} — ${f.status}${f.message ? `: ${f.message}` : ""}`);
  } else if (anyEnriched && anyMissed) {
    outcome = "partial";
    console.log(`⚠️  ${v.name} — partial (some locations had no match)`);
  } else if (anyEnriched) {
    outcome = "enriched";
    console.log(`✅  ${v.name} — enriched`);
  } else {
    outcome = "no_result";
    console.warn(`⚠️  ${v.name} — no result`);
  }
  return { outcome, failed };
}

// ─── Serializer ─────────────────────────────────────────────────────────────
// Renders a Venue as a TS object literal. Field order is fixed so diffs read
// cleanly. Only fields that are set are emitted; undefined fields are skipped.

function s(value: string): string {
  return JSON.stringify(value);
}

function formatLocation(loc: VenueLocation): string {
  const parts: string[] = [];
  parts.push(`address: ${s(loc.address)}`);
  parts.push(`latLng: [${loc.latLng[0]}, ${loc.latLng[1]}]`);
  if (loc.placeId) parts.push(`placeId: ${s(loc.placeId)}`);
  return `{ ${parts.join(", ")} }`;
}

function formatVenue(v: Venue, indent: string): string {
  const I = indent;
  const I2 = I + "  ";
  const lines: string[] = [];
  lines.push(`${I2}id: ${s(v.id)},`);
  lines.push(`${I2}name: ${s(v.name)},`);
  lines.push(`${I2}cat: [${v.cat.map(s).join(", ")}],`);
  if (v.description) lines.push(`${I2}description: ${s(v.description)},`);
  if (v.rating != null) lines.push(`${I2}rating: ${v.rating},`);
  if (v.userRatingsTotal != null) lines.push(`${I2}userRatingsTotal: ${v.userRatingsTotal},`);
  if (v.hours && v.hours.length > 0) {
    const hours = v.hours.map((h) => `${I2}  ${s(h)}`).join(",\n");
    lines.push(`${I2}hours: [\n${hours},\n${I2}],`);
  }
  if (v.phone) lines.push(`${I2}phone: ${s(v.phone)},`);
  if (v.website) lines.push(`${I2}website: ${s(v.website)},`);
  if (v.featured) lines.push(`${I2}featured: true,`);
  if (v.note) lines.push(`${I2}note: ${s(v.note)},`);
  if (v.location) {
    lines.push(`${I2}location: ${formatLocation(v.location)},`);
  }
  if (v.locations) {
    const locs = v.locations.map((loc) => `${I2}  ${formatLocation(loc)}`).join(",\n");
    lines.push(`${I2}locations: [\n${locs},\n${I2}],`);
  }
  return `${I}{\n${lines.join("\n")}\n${I}}`;
}

function formatArray(label: string, list: Venue[]): string {
  const body = list.map((v) => formatVenue(v, "  ")).join(",\n");
  return `export const ${label}: Venue[] = [\n${body},\n];`;
}

// Replaces just the body of `export const HANDPICKED: Venue[] = [...]` and
// `export const VENUES: Venue[] = [...]` so leading type defs, comments,
// and helpers (ALL_VENUES, LIVERPOOL_CENTER, venuePins) stay verbatim.
function rewriteFile(source: string, handpicked: Venue[], venues: Venue[]): string {
  const replaceArray = (input: string, label: string, list: Venue[]) => {
    const re = new RegExp(`export const ${label}: Venue\\[\\] = \\[[\\s\\S]*?^\\];`, "m");
    if (!re.test(input)) {
      throw new Error(`Could not find export ${label} array in venues.ts`);
    }
    return input.replace(re, formatArray(label, list));
  };
  let out = source;
  out = replaceArray(out, "HANDPICKED", handpicked);
  out = replaceArray(out, "VENUES", venues);
  return out;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    `Enriching ${HANDPICKED.length + VENUES.length} venues against the Google Places API…\n`,
  );

  const counts: Record<Outcome, number> = {
    enriched: 0,
    partial: 0,
    no_result: 0,
    error: 0,
    skipped: 0,
  };
  const allFailed: FailedQuery[] = [];

  for (const v of [...HANDPICKED, ...VENUES]) {
    const r = await processVenue(v);
    counts[r.outcome] += 1;
    allFailed.push(...r.failed);
  }

  const source = await fs.readFile(VENUES_PATH, "utf8");
  const next = rewriteFile(source, HANDPICKED, VENUES);
  await fs.writeFile(VENUES_PATH, next, "utf8");

  console.log(`\n──── SUMMARY ────`);
  console.log(`✅  enriched:   ${counts.enriched}`);
  console.log(`⚠️  partial:    ${counts.partial}`);
  console.log(`⚠️  no_result:  ${counts.no_result}`);
  console.log(`❌  error:      ${counts.error}`);
  console.log(`⏭️   skipped:    ${counts.skipped}`);

  if (allFailed.length > 0) {
    console.log(`\n──── FAILED QUERIES ────`);
    for (const f of allFailed) {
      console.log(`  [${f.status}] ${f.name} → "${f.query}"${f.message ? ` (${f.message})` : ""}`);
    }
  }

  console.log(`\nWrote ${VENUES_PATH}.`);
  console.log("Review the diff before committing.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
