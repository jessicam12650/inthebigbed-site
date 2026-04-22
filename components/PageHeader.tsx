export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  inverse = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  inverse?: boolean;
}) {
  return (
    <section
      className={`px-5 py-14 md:px-12 md:py-20 ${inverse ? "bg-ink text-cream" : "bg-cream text-ink"}`}
    >
      <div className="mx-auto max-w-5xl">
        {eyebrow && (
          <div
            className={`mb-3 text-xs font-sub uppercase tracking-wider ${
              inverse ? "text-rust" : "text-rust"
            }`}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className={`mb-3 font-head text-4xl leading-tight tracking-tight md:text-5xl ${
            inverse ? "text-cream" : "text-ink"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`max-w-2xl text-base leading-relaxed md:text-lg ${
              inverse ? "text-cream/70" : "text-ink/60"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
