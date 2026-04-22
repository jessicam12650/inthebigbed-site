export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-ink/10 bg-white p-10 text-center text-ink/60">
      {children}
    </div>
  );
}
