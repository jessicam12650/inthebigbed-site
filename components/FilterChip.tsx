"use client";

export default function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[48px] items-center rounded-sm border px-4 text-sm font-sub transition-colors ${
        active
          ? "border-ink bg-ink text-cream"
          : "border-ink/20 bg-white text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
