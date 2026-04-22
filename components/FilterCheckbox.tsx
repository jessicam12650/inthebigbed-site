"use client";

export default function FilterCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex min-h-[48px] cursor-pointer items-center gap-2.5 px-2 text-sm font-sub text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded-sm border-ink accent-rust"
      />
      {children}
    </label>
  );
}
