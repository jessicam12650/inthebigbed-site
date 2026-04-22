"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_VENUES, LIVERPOOL_CENTER, type Venue, type VenueCategory } from "@/data/venues";
import PageHeader from "@/components/PageHeader";

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Record<string, google.maps.Marker>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

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
      marker.addListener("click", () => handlePinClick(v.id));
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

  function handlePinClick(id: string) {
    setActiveId(id);
    const card = cardRefs.current[id];
    const map = mapRef.current;
    const marker = markersRef.current[id];
    if (marker && map) {
      map.panTo(marker.getPosition()!);
    }
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.remove("card-highlight");
      // Force reflow so the animation re-plays on repeat clicks
      void card.offsetWidth;
      card.classList.add("card-highlight");
    }
  }

  function handleCardClick(v: Venue) {
    setActiveId(v.id);
    const marker = markersRef.current[v.id];
    if (marker && mapRef.current) {
      mapRef.current.panTo(marker.getPosition()!);
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 13, 15));
      // Bounce effect
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

      {/* STICKY MAP */}
      <section className="bg-cream px-5 pt-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-sm border border-ink/15">
            <div
              ref={mapDivRef}
              className="h-[360px] w-full bg-ink/5 md:h-[440px]"
              aria-label="Map of dog-friendly venues"
              role="application"
            />
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Click a pin to jump to the venue below. Rust pins are our handpicked favourites.
          </p>
        </div>
      </section>

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
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={`rounded-sm border px-3 py-2 text-sm font-sub transition-colors ${
                  cat === c.value
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 bg-white text-ink hover:border-ink"
                }`}
              >
                {c.label}
              </button>
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
            <div className="rounded-sm border border-ink/10 bg-white p-10 text-center text-ink/60">
              No venues match your filters.
            </div>
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
      className={`group flex cursor-pointer flex-col gap-2 rounded-sm border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-pop ${
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
