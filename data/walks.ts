// Dog-friendly parks, beaches and walking spots. Reserved for a future /walks
// page. Schema mirrors data/venues.ts so the same pin/card components can be
// reused. No entries today — the original places dataset had no parks or
// beaches; this file exists to receive them as we curate the walking list.

export type WalkCategory = "park" | "beach" | "trail";

export type WalkLocation = {
  address: string;
  latLng: [number, number];
  placeId?: string;
};

export type Walk = {
  id: string;
  name: string;
  cat: WalkCategory;
  description?: string;
  rating?: number;
  userRatingsTotal?: number;
  hours?: string[];
  website?: string;
  featured?: boolean;
  note?: string;
  location?: WalkLocation;
  locations?: WalkLocation[];
};

export const WALKS: Walk[] = [];
