"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_VENUES,
  LIVERPOOL_CENTER,
  venuePins,
  type Category,
  type Venue,
  type VenueLocation,
} from "@/data/venues";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";

const CAT_FILTERS: Array<{ value: "all" | Category; label: string }> = [
  { value: "all", label: "All" },
  { value: "pub", label: "Pubs" },
  { value: "bar", label: "Bars" },
  { value: "restaurant", label: "Restaurants" },
  { value: "cafe", label: "Cafes" },
];

const CAT_LABELS: Record<Category, string> = {
  pub: "Pub",
  bar: "Bar",
  restaurant: "Restaurant",
  cafe: "Cafe",
};

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let scriptPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function directionsUrl(loc: VenueLocation): string {
  if (loc.placeId) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      loc.address,
    )}&destination_place_id=${loc.placeId}`;
  }
  if (loc.latLng[0] !== 0 || loc.latLng[1] !== 0) {
    return `https://www.google.com/maps/dir/?api=1&destination=${loc.latLng[0]},${loc.latLng[1]}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`;
}

// Returns true if Google's weekday_text reports the venue is currently open.
// weekday_text is local-time strings like "Monday: 9:00 AM – 11:00 PM" or
// "Sunday: Closed", so we parse the row for today.
function isOpenNow(hours: string[] | undefined): boolean | null {
  if (!hours || hours.length === 0) return null;
  const now = new Date();
  // weekday_text is Monday-first; JS getDay() is Sunday=0..Saturday=6.
  const idx = (now.getDay() + 6) % 7;
  const today = hours[idx];
  if (!today) return null;
  if (/closed/i.test(today)) return false;
  const m = today.match(/:\s*(.+)$/);
  if (!m) return null;
  const ranges = m[1].split(",").map((s) => s.trim());
  const minsNow = now.getHours() * 60 + now.getMinutes();
  for (const r of ranges) {
    const [openStr, closeStr] = r.split(/[–-]/).map((s) => s?.trim());
    if (!openStr || !closeStr) continue;
    const open = parseTime(openStr);
    const close = parseTime(closeStr);
    if (open == null || close == null) continue;
    // Past midnight close (e.g. 9 AM – 1 AM) wraps round.
    if (close <= open) {
      if (minsNow >= open || minsNow <= close) return true;
    } else if (minsNow >= open && minsNow <= close) {
      return true;
    }
  }
  return false;
}

function parseTime(s: string): number | null {
  const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*([AP]M)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const mer = m[3]?.toUpperCase();
  if (mer === "PM" && h < 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export default function PlacesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);
  const handlePinClickRef = useRef<(venueId: string) => void>(() => {});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_VENUES.filter((v) => {
      if (cat !== "all" && v.cat !== cat) return false;
      if (q) {
        const addrs = v.locations
          ? v.locations.map((l) => l.address).join(" ")
          : v.location?.address ?? "";
        const hay = `${v.name} ${addrs} ${v.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, cat]);

  const featured = filtered.filter((v) => v.featured);
  const standard = filtered.filter((v) => !v.featured);

  const pins = useMemo(() => venuePins(filtered), [filtered]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapDivRef.current) return;
        const map = new google.maps.Map(mapDivRef.current, {
          center: LIVERPOOL_CENTER,
          zoom: 13,
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((e) => console.error(e));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const div = mapDivRef.current;
    if (!div) return;
    const observer = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map) return;
      const center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      if (center) map.setCenter(center);
    });
    observer.observe(div);
    return () => observer.disconnect();
  }, [mapReady]);

  /* Rebuild markers when filters change. Skip pins with [0,0] coordinates —
   * those are stubs awaiting enrichment via scripts/enrich-places.ts. */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};

    const bounds = new google.maps.LatLngBounds();
    let placed = 0;

    pins.forEach((pin) => {
      const [lat, lng] = pin.location.latLng;
      if (lat === 0 && lng === 0) return;
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: pin.venue.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: pin.venue.featured ? 9 : 7,
          fillColor: pin.venue.featured ? "#D4845A" : "#1C1C1A",
          fillOpacity: 1,
          strokeColor: "#F2EDE6",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => handlePinClickRef.current(pin.venue.id));
      markersRef.current[pin.pinId] = marker;
      bounds.extend({ lat, lng });
      placed += 1;
    });

    if (placed > 1) {
      map.fitBounds(bounds, 48);
    } else if (placed === 1) {
      const onlyPin = pins.find(
        (p) => p.location.latLng[0] !== 0 || p.location.latLng[1] !== 0,
      );
      if (onlyPin) {
        const [lat, lng] = onlyPin.location.latLng;
        map.setCenter({ lat, lng });
        map.setZoom(15);
      }
    }
  }, [pins, mapReady]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  function applyHighlight(card: HTMLElement) {
    card.classList.remove("card-highlight");
    void card.offsetWidth;
    card.classList.add("card-highlight");
    if (highlightTimeoutRef.current !== null) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      card.classList.remove("card-highlight");
      highlightTimeoutRef.current = null;
    }, 2000);
  }

  function handlePinClick(venueId: string) {
    setActiveId(venueId);
    const card = cardRefs.current[venueId];
    if (card) {
      card.scrollIntoView({ block: "start", behavior: "smooth", inline: "nearest" });
      applyHighlight(card);
    }
  }

  handlePinClickRef.current = handlePinClick;

  function handleCardClick(v: Venue) {
    setActiveId(v.id);
    // For grouped venues, focus the first valid pin. Single-location venues
    // share the venue id as the pin id.
    const candidatePinIds = v.locations
      ? v.locations.map((_, i) => `${v.id}::${i}`)
      : [v.id];
    for (const pid of candidatePinIds) {
      const marker = markersRef.current[pid];
      if (marker && mapRef.current) {
        mapRef.current.panTo(marker.getPosition()!);
        mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 13, 15));
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 1200);
        return;
      }
    }
  }

  return (
    <section className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-cream">
      <header className="shrink-0 border-b border-ink/10 px-5 py-2.5 md:px-8">
        <div className="mx-auto flex max-w-7xl items-baseline justify-between gap-3">
          <h1 className="font-head text-lg tracking-tight text-ink md:text-xl">
            Dog-friendly places in Liverpool
          </h1>
          <span className="hidden text-xs text-ink/50 sm:inline">
            Rust pins are handpicked favourites
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="h-[300px] shrink-0 border-b border-ink/10 md:h-full md:w-2/5 md:border-b-0 md:border-r">
          <div
            ref={mapDivRef}
            className="h-full w-full bg-ink/5"
            aria-label="Map of dog-friendly venues"
            role="application"
          />
        </div>

        <div
          ref={cardsScrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto md:w-3/5"
        >
          <div className="sticky top-0 z-10 shrink-0 border-b border-ink/10 bg-cream/95 backdrop-blur">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:px-8">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search venues…"
                className="field flex-1"
                aria-label="Search venues"
              />
              <div className="flex flex-wrap items-center gap-2">
                {CAT_FILTERS.map((c) => (
                  <FilterChip key={c.value} active={cat === c.value} onClick={() => setCat(c.value)}>
                    {c.label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-8">
            {featured.length > 0 && (
              <div className="mb-10">
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="font-head text-xl text-ink md:text-2xl">Handpicked 🐾</h2>
                  <span className="text-sm text-ink/55">{featured.length} staff favourites</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {featured.map((v) => (
                    <VenueCard
                      key={v.id}
                      venue={v}
                      isActive={activeId === v.id}
                      onClick={() => handleCardClick(v)}
                      setRef={(el) => (cardRefs.current[v.id] = el)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="font-head text-xl text-ink md:text-2xl">All venues</h2>
                <span className="text-sm text-ink/55">
                  {standard.length} {standard.length === 1 ? "place" : "places"}
                </span>
              </div>
              {standard.length === 0 ? (
                <EmptyState>No venues match your filters.</EmptyState>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {standard.map((v) => (
                    <VenueCard
                      key={v.id}
                      venue={v}
                      isActive={activeId === v.id}
                      onClick={() => handleCardClick(v)}
                      setRef={(el) => (cardRefs.current[v.id] = el)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VenueCard({
  venue,
  isActive,
  onClick,
  setRef,
}: {
  venue: Venue;
  isActive: boolean;
  onClick: () => void;
  setRef: (el: HTMLElement | null) => void;
}) {
  const [hoursOpen, setHoursOpen] = useState(false);
  const open = isOpenNow(venue.hours);
  const grouped = venue.locations && venue.locations.length > 0;
  const primaryAddress = grouped ? null : venue.location?.address;

  return (
    <article
      ref={setRef}
      onClick={onClick}
      className={`venue-card group flex scroll-mt-36 cursor-pointer flex-col gap-2 rounded-sm border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-pop md:scroll-mt-20 ${
        isActive ? "border-rust shadow-pop" : "border-ink/10 hover:border-ink/25"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-head text-lg leading-tight text-ink">{venue.name}</h3>
        {venue.featured && (
          <span className="shrink-0 rounded-sm bg-rust/10 px-2 py-0.5 text-[11px] font-sub uppercase tracking-wide text-rust">
            Handpicked
          </span>
        )}
      </div>

      {venue.description && (
        <p className="text-sm leading-relaxed text-ink/70">{venue.description}</p>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink/55">
        <span className="chip">{CAT_LABELS[venue.cat]}</span>
        {typeof venue.rating === "number" && (
          <span className="font-sub text-ink/70">
            ⭐ {venue.rating.toFixed(1)}
            {venue.userRatingsTotal ? ` (${venue.userRatingsTotal})` : ""}
          </span>
        )}
        {open === true && (
          <span className="font-sub text-sage">● Open now</span>
        )}
        {open === false && <span className="font-sub text-ink/45">● Closed</span>}
      </div>

      {primaryAddress && <p className="text-sm text-ink/60">{primaryAddress}</p>}

      {venue.hours && venue.hours.length > 0 && (
        <div className="mt-1 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHoursOpen((v) => !v);
            }}
            className="font-sub text-ink/55 underline hover:text-ink"
          >
            {hoursOpen ? "Hide hours" : "See hours"}
          </button>
          {hoursOpen && (
            <ul className="mt-2 space-y-0.5 text-ink/65">
              {venue.hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(venue.phone || venue.website) && (
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
          {venue.phone && (
            <a
              href={`tel:${venue.phone.replace(/\s+/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="font-sub text-ink/65 underline hover:text-ink"
            >
              {venue.phone}
            </a>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-sub text-ink/65 underline hover:text-ink"
            >
              Website
            </a>
          )}
        </div>
      )}

      {!grouped && venue.location && (
        <a
          href={directionsUrl(venue.location)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex w-fit items-center gap-1 rounded-sm border border-ink/20 bg-white px-3 py-1.5 text-xs font-sub text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
        >
          Get directions →
        </a>
      )}

      {grouped && (
        <div className="mt-3 border-t border-ink/10 pt-3">
          <div className="mb-2 text-[11px] font-sub uppercase tracking-wider text-ink/50">
            {venue.locations!.length} locations
          </div>
          <ul className="flex flex-col gap-2">
            {venue.locations!.map((loc) => (
              <li key={loc.address} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex items-start gap-2 text-ink/70">
                  <span aria-hidden>📍</span>
                  <span>{loc.address}</span>
                </span>
                <a
                  href={directionsUrl(loc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-xs font-sub text-rust underline hover:text-ink"
                >
                  Directions
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {venue.note && <p className="mt-2 text-xs leading-relaxed text-ink/55">{venue.note}</p>}
    </article>
  );
}
