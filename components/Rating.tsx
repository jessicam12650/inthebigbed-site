export default function Rating({
  rating,
  reviews,
}: {
  rating: number | null;
  reviews: number | null;
}) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span aria-hidden className="text-rust">★</span>
      <span className="font-sub text-ink">{rating.toFixed(1)}</span>
      {reviews != null && <span className="text-ink/50">({reviews})</span>}
    </div>
  );
}
