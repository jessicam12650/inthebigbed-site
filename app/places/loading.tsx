export default function PlacesLoading() {
  return (
    <>
      <section className="bg-cream px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 h-3 w-32 animate-pulse rounded-sm bg-ink/10" />
          <div className="mb-4 h-10 w-3/4 animate-pulse rounded-sm bg-ink/10" />
          <div className="h-5 w-2/3 animate-pulse rounded-sm bg-ink/10" />
        </div>
      </section>
      <section className="bg-cream px-5 pt-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="h-[360px] w-full animate-pulse rounded-sm border border-ink/15 bg-ink/5 md:h-[440px]" />
        </div>
      </section>
      <section className="section bg-cream">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-sm border border-ink/10 bg-white"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
