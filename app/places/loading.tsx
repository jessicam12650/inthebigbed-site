export default function PlacesLoading() {
  return (
    <section className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-cream">
      {/* Map pane skeleton */}
      <div className="shrink-0 border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-5 pb-3 pt-3 md:px-12 md:pb-4 md:pt-5">
          <div className="mb-3 h-6 w-2/3 animate-pulse rounded-sm bg-ink/10 md:h-7" />
          <div className="h-[240px] w-full animate-pulse rounded-sm border border-ink/15 bg-ink/5 md:h-[360px]" />
        </div>
      </div>
      {/* Cards pane skeleton */}
      <div className="flex-1 overflow-hidden">
        <div className="border-b border-ink/10 bg-cream/95">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:px-12">
            <div className="h-12 flex-1 animate-pulse rounded-sm border-2 border-ink/10 bg-white" />
            <div className="hidden gap-2 md:flex">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 w-20 animate-pulse rounded-sm bg-ink/10" />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-12 md:py-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-sm border border-ink/10 bg-white" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
