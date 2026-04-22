import DirectorySkeleton from "@/components/DirectorySkeleton";

export default function VetsLoading() {
  // One extra slot for the pinned emergency-vet card
  return <DirectorySkeleton cards={10} />;
}
