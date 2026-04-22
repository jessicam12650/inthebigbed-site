export default function DirectorySkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <>
      {/* Page header */}
      <section className="bg-cream px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 h-3 w-32 animate-pulse rounded-sm bg-ink/10" />
          <div className="mb-4 h-10 w-3/4 animate-pulse rounded-sm bg-ink/10" />
          <div className="h-5 w-2/3 animate-pulse rounded-sm bg-ink/10" />
        </div>
      </section>

      {/* Filter row */}
      <section className="border-b border-ink/10 bg-cream px-5 py-6 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center">
          <div className="h-12 flex-1 animate-pulse rounded-sm border-2 border-ink/10 bg-white" />
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-20 animate-pulse rounded-sm bg-ink/10" />
            ))}
          </div>
        </div>
      </section>

      {/* Card grid */}
      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 h-4 w-40 animate-pulse rounded-sm bg-ink/10" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: cards }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-sm border border-ink/10 bg-white"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
