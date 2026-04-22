import type { Tier } from "@/data/walkers";

const TIER_STYLES: Record<Tier, string> = {
  silver: "border-ink/25 text-ink/70 bg-white",
  gold: "border-rust text-rust bg-rust/5",
  pro: "border-ink text-ink bg-ink/5",
};

const TIER_LABELS: Record<Tier, string> = {
  silver: "Silver · ID verified",
  gold: "Gold · DBS + first aid",
  pro: "Pro · Insured + licensed",
};

export default function TierBadge({ tier, compact = false }: { tier: Tier; compact?: boolean }) {
  return (
    <span className={`tier-badge ${TIER_STYLES[tier]}`}>
      {compact ? tier.toUpperCase() : TIER_LABELS[tier]}
    </span>
  );
}
