"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_VENUES, LIVERPOOL_CENTER, type Venue, type VenueCategory } from "@/data/venues";
import PageHeader from "@/components/PageHeader";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";

const CAT_FILTERS: Array<{ value: "all" | VenueCategory; label: string }> = [
  { value: "all", label: "All places" },
  { value: "pub-bar", label: "Pubs & bars" },
  { value: "restaurant", label: "Restaurants & cafes" },
];

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Matches the <nav> height (h-16 = 64px) so the sticky map pins directly
// beneath the site navigation.
const NAV_HEIGHT = 64;
const SCROLL_GAP = 16;
// Safe default until the sticky element mounts and we measure it.
const DEFAULT_MAP_OFFSET = 520;

let scriptPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google?.maps) return Promise.resolve();
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

export default function PlacesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | VenueCategory>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);
  // Ref-to-latest so marker click listeners always call the current
  // handlePinClick without forcing the rebuild effect to re-run every render.
  const handlePinClickRef = useRef<(id: string) => void>(() => {});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_VENUES.filter((v) => {
      if (cat !== "all" && v.cat !== cat) return false;
      if (q) {
        const hay = `${v.name} ${v.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, cat]);

  const featured = filtered.filter((v) => v.featured);
  const standard = filtered.filter((v) => !v.featured);

  /* Load map once */
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

  /* Rebuild markers when filters change */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};

    const bounds = new google.maps.LatLngBounds();

    filtered.forEach((v) => {
      const marker = new google.maps.Marker({
        position: v.latLng,
        map,
        title: v.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: v.featured ? 9 : 7,
          fillColor: v.featured ? "#D4845A" : "#1C1C1A",
          fillOpacity: 1,
          strokeColor: "#F2EDE6",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => handlePinClickRef.current(v.id));
      markersRef.current[v.id] = marker;
      bounds.extend(v.latLng);
    });

    if (filtered.length > 1) {
      map.fitBounds(bounds, 48);
    } else if (filtered.length === 1) {
      map.setCenter(filtered[0].latLng);
      map.setZoom(15);
    }
  }, [filtered, mapReady]);

  /* Clean up any pending highlight timer on unmount */
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  /* Publish the sticky-map height as a CSS var (--map-offset) so the venue
   * cards can use it in scroll-margin-top. Re-measure on resize because the
   * map height changes between the mobile and desktop breakpoints. */
  useEffect(() => {
    function publish() {
      const h = stickyRef.current?.getBoundingClientRect().height;
      const offset = h && h > 0 ? h + NAV_HEIGHT : DEFAULT_MAP_OFFSET + NAV_HEIGHT;
      document.documentElement.style.setProperty("--map-offset", `${offset}px`);
    }
    publish();
    window.addEventListener("resize", publish);
    const ro = new ResizeObserver(publish);
    if (stickyRef.current) ro.observe(stickyRef.current);
    return () => {
      window.removeEventListener("resize", publish);
      ro.disconnect();
    };
  }, [mapReady]);

  function scrollCardBelowStickyMap(card: HTMLElement) {
    // The card has `scroll-margin-top` set to (nav + sticky map height + gap)
    // via the --map-offset CSS variable, so the browser leaves room for the
    // sticky map above. We also clamp via a manual scrollTo as a belt-and-
    // braces for any user-agent quirks.
    const stickyHeight = stickyRef.current?.getBoundingClientRect().height ?? DEFAULT_MAP_OFFSET;
    const cardAbsTop = card.getBoundingClientRect().top + window.scrollY;
    const targetY = cardAbsTop - NAV_HEIGHT - stickyHeight - SCROLL_GAP;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }

  function applyHighlight(card: HTMLElement) {
    card.classList.remove("card-highlight");
    // Force reflow so the class re-applies even on repeat clicks.
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

  function handlePinClick(id: string) {
    setActiveId(id);
    const card = cardRefs.current[id];
    const map = mapRef.current;
    const marker = markersRef.current[id];
    if (marker && map) {
      map.panTo(marker.getPosition()!);
    }
    if (card) {
      scrollCardBelowStickyMap(card);
      applyHighlight(card);
    }
  }

  // Keep the ref pointing at the current render's handler so the marker
  // click listeners always invoke the latest closure.
  handlePinClickRef.current = handlePinClick;

  function handleCardClick(v: Venue) {
    setActiveId(v.id);
    const marker = markersRef.current[v.id];
    if (marker && mapRef.current) {
      mapRef.current.panTo(marker.getPosition()!);
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 13, 15));
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 1200);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Dog-friendly places"
        title="Pubs, cafes & restaurants that love dogs."
        subtitle="A handpicked guide to the dog-friendliest spots across Liverpool and beyond. Confirmed by real dog owners."
      />

      {/* One wrapper so the sticky map can stay pinned across every
          section below it (filters, handpicked, all venues). */}
      <div className="bg-cream">
        {/* STICKY MAP — pinned directly beneath the nav */}
        <div
          ref={stickyRef}
          className="sticky top-16 z-20 border-b border-ink/10 bg-cream/95 px-5 pb-3 pt-4 backdrop-blur md:px-12 md:pb-4 md:pt-6"
        >
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-sm border border-ink/15 shadow-card">
              <div
                ref={mapDivRef}
                className="h-[300px] w-full bg-ink/5 md:h-[440px]"
                aria-label="Map of dog-friendly venues"
                role="application"
              />
            </div>
            <p className="mt-2 text-xs text-ink/50">
              Click a pin to scroll to the venue below — the map stays visible. Rust pins are our handpicked favourites.
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <section className="border-b border-ink/10 bg-cream px-5 py-6 md:px-12">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center">
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
        </section>

        {/* FEATURED / HANDPICKED */}
        {featured.length > 0 && (
          <section className="section bg-cream pb-0">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6 flex items-baseline gap-3">
                <h2 className="font-head text-2xl text-ink md:text-3xl">Handpicked 🐾</h2>
                <span className="text-sm text-ink/55">{featured.length} staff favourites</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </section>
        )}

        {/* STANDARD */}
        <section className="section bg-cream">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-baseline gap-3">
              <h2 className="font-head text-2xl text-ink md:text-3xl">All venues</h2>
              <span className="text-sm text-ink/55">
                {standard.length} {standard.length === 1 ? "place" : "places"}
              </span>
            </div>
            {standard.length === 0 ? (
              <EmptyState>No venues match your filters.</EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </div>
    </>
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
  const catLabel = venue.cat === "pub-bar" ? "Pub / Bar" : venue.cat === "restaurant" ? "Restaurant" : venue.cat;
  return (
    <article
      ref={setRef}
      onClick={onClick}
      className={`venue-card group flex cursor-pointer flex-col gap-2 rounded-sm border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-pop ${
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
      <p className="text-sm text-ink/60">{venue.address}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-ink/55">
        <span className="chip">{catLabel}</span>
        <span>{venue.tag}</span>
      </div>
      {venue.note && <p className="mt-2 text-xs leading-relaxed text-ink/55">{venue.note}</p>}
    </article>
  );
}
