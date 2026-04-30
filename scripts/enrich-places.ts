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

async function findPlace(query: string): Promise<Candidate | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  url.searchParams.set("input", query);
  url.searchParams.set("inputtype", "textquery");
  url.searchParams.set("fields", "place_id,formatted_address,geometry,name");
  url.searchParams.set("key", API_KEY!);
  const res = await fetch(url);
  const json = (await res.json()) as { status: string; candidates?: Candidate[] };
  if (json.status !== "OK" || !json.candidates || json.candidates.length === 0) return null;
  return json.candidates[0];
}

async function placeDetails(placeId: string): Promise<Details | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "rating,user_ratings_total,opening_hours,formatted_phone_number,website,editorial_summary,formatted_address,geometry,place_id",
  );
  url.searchParams.set("key", API_KEY!);
  const res = await fetch(url);
  const json = (await res.json()) as { status: string; result?: Details };
  if (json.status !== "OK" || !json.result) return null;
  return json.result;
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

async function enrichLocation(name: string, loc: VenueLocation): Promise<void> {
  const query = `${name}, ${loc.address}`;
  const candidate = await findPlace(query);
  if (!candidate) {
    console.warn(`⚠️  no result for "${query}"`);
    return;
  }
  loc.placeId = candidate.place_id;
  if (candidate.geometry?.location) {
    loc.latLng = [candidate.geometry.location.lat, candidate.geometry.location.lng];
  }
  if (candidate.formatted_address) loc.address = candidate.formatted_address;
}

async function enrichVenueDetails(v: Venue, placeId: string): Promise<void> {
  const details = await placeDetails(placeId);
  if (!details) return;
  if (details.rating != null) v.rating = details.rating;
  if (details.user_ratings_total != null) v.userRatingsTotal = details.user_ratings_total;
  if (details.opening_hours?.weekday_text) v.hours = details.opening_hours.weekday_text;
  if (details.formatted_phone_number) v.phone = details.formatted_phone_number;
  if (details.website) v.website = details.website;
  if (!v.description && details.editorial_summary?.overview) {
    v.description = details.editorial_summary.overview;
  }
}

async function processVenue(v: Venue): Promise<void> {
  if (!venueNeedsEnrichment(v)) {
    console.log(`⏭️   ${v.name} — already enriched`);
    return;
  }

  try {
    if (v.locations) {
      for (const loc of v.locations) {
        if (locationNeedsEnrichment(loc)) {
          await enrichLocation(v.name, loc);
          await sleep(DELAY_MS);
        }
      }
      // Use the first resolved place_id for venue-level details (rating etc).
      const firstWithId = v.locations.find((l) => l.placeId);
      if (firstWithId?.placeId) {
        await enrichVenueDetails(v, firstWithId.placeId);
        await sleep(DELAY_MS);
      }
    } else if (v.location) {
      if (locationNeedsEnrichment(v.location)) {
        await enrichLocation(v.name, v.location);
        await sleep(DELAY_MS);
      }
      if (v.location.placeId) {
        await enrichVenueDetails(v, v.location.placeId);
        await sleep(DELAY_MS);
      }
    }
    console.log(`✅  ${v.name}`);
  } catch (err) {
    console.error(`❌  ${v.name}:`, err);
  }
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
  lines.push(`${I2}cat: ${s(v.cat)},`);
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

  for (const v of HANDPICKED) await processVenue(v);
  for (const v of VENUES) await processVenue(v);

  const source = await fs.readFile(VENUES_PATH, "utf8");
  const next = rewriteFile(source, HANDPICKED, VENUES);
  await fs.writeFile(VENUES_PATH, next, "utf8");

  console.log(`\nWrote ${VENUES_PATH}.`);
  console.log("Review the diff before committing.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
