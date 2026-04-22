"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_VENUES, LIVERPOOL_CENTER, type Venue, type VenueCategory } from "@/data/venues";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";

const CAT_FILTERS: Array<{ value: "all" | VenueCategory; label: string }> = [
  { value: "all", label: "All places" },
  { value: "pub-bar", label: "Pubs & bars" },
  { value: "restaurant", label: "Restaurants & cafes" },
];

const GMAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
  const cardsScrollRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);
  // Ref-to-latest so marker click listeners always call the current handler
  // without forcing the rebuild effect to re-run every render.
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

  function scrollCardIntoCardsPane(card: HTMLElement) {
    // Cards pane (`overflow-y-auto`) is the nearest scrollable ancestor, so
    // scrollIntoView scrolls the PANE, never the window. scroll-margin-top
    // on `.venue-card` leaves room for the sticky filter bar — tall enough
    // on mobile to cover the 2-row wrap, auto-trimmed on desktop via Tailwind.
    card.scrollIntoView({ block: "start", behavior: "smooth", inline: "nearest" });
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
      scrollCardIntoCardsPane(card);
      applyHighlight(card);
    }
  }

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
    // Bounded to viewport-minus-nav so the map NEVER scrolls off screen.
    // Only the inner `cardsScrollRef` pane scrolls.
    <section className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-cream">
      {/* Fixed map pane — stays at top of viewport forever */}
      <div className="shrink-0 border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-5 pb-3 pt-3 md:px-12 md:pb-4 md:pt-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h1 className="font-head text-xl tracking-tight text-ink md:text-2xl">
              Dog-friendly places in Liverpool
            </h1>
            <span className="hidden text-xs text-ink/50 sm:inline">
              Rust pins are handpicked favourites
            </span>
          </div>
          <div className="overflow-hidden rounded-sm border border-ink/15 shadow-card">
            <div
              ref={mapDivRef}
              className="h-[240px] w-full bg-ink/5 md:h-[360px]"
              aria-label="Map of dog-friendly venues"
              role="application"
            />
          </div>
        </div>
      </div>

      {/* Scrollable venue pane — this is what scrolls, not the window */}
      <div ref={cardsScrollRef} className="flex-1 overflow-y-auto">
        {/* Sticky filter row pinned to the top of this pane */}
        <div className="sticky top-0 z-10 border-b border-ink/10 bg-cream/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:px-12">
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

        <div className="mx-auto max-w-5xl px-5 py-8 md:px-12 md:py-10">
          {featured.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="font-head text-xl text-ink md:text-2xl">Handpicked 🐾</h2>
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
  const catLabel = venue.cat === "pub-bar" ? "Pub / Bar" : venue.cat === "restaurant" ? "Restaurant" : venue.cat;
  return (
    <article
      ref={setRef}
      onClick={onClick}
      // scroll-mt-* leaves room for the sticky filter bar when scrollIntoView
      // lands the card at the top of the pane: ~144px on mobile (2-row wrap),
      // 88px from md where the filter sits on a single row.
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
      <p className="text-sm text-ink/60">{venue.address}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-ink/55">
        <span className="chip">{catLabel}</span>
        <span>{venue.tag}</span>
      </div>
      {venue.note && <p className="mt-2 text-xs leading-relaxed text-ink/55">{venue.note}</p>}
    </article>
  );
}
