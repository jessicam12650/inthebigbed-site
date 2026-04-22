export default function PlacesLoading() {
  return (
    <section className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-cream">
      {/* Header skeleton */}
      <div className="shrink-0 border-b border-ink/10 px-5 py-2.5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-2/3 animate-pulse rounded-sm bg-ink/10 md:w-1/3" />
        </div>
      </div>

      {/* Split body skeleton */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Map pane skeleton */}
        <div className="h-[300px] shrink-0 animate-pulse border-b border-ink/10 bg-ink/5 md:h-full md:w-2/5 md:border-b-0 md:border-r" />

        {/* Cards pane skeleton */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:w-3/5">
          <div className="border-b border-ink/10 bg-cream/95">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:px-8">
              <div className="h-12 flex-1 animate-pulse rounded-sm border-2 border-ink/10 bg-white" />
              <div className="hidden gap-2 md:flex">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 w-24 animate-pulse rounded-sm bg-ink/10" />
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-5xl px-5 py-6 md:px-8 md:py-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-sm border border-ink/10 bg-white" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
