export type Tier = "silver" | "gold" | "pro";

export type Walker = {
  id: string;
  name: string;
  area: string;
  distance: string;
  tier: Tier;
  rating: number;
  reviews: number;
  bio: string;
  pricePerWalk: number;
  durationOptions: string[];
  maxDogs: number;
  available: boolean;
  features: string[];
};

export const WALKERS: Walker[] = [
  {
    id: "marcus-t",
    name: "Marcus T.",
    area: "Wavertree",
    distance: "0.6 miles",
    tier: "gold",
    rating: 4.9,
    reviews: 63,
    bio: "Lifelong dog owner with 3 years professional walking experience. Specialises in high-energy breeds.",
    pricePerWalk: 16,
    durationOptions: ["30 min", "60 min"],
    maxDogs: 4,
    available: true,
    features: ["GPS tracked", "Group walks", "Large breeds", "Puppy experience"],
  },
  {
    id: "priya-s",
    name: "Priya S.",
    area: "Allerton",
    distance: "1.1 miles",
    tier: "pro",
    rating: 5.0,
    reviews: 41,
    bio: "Former veterinary nurse. Solo walks only — your dog gets full, undivided attention on every outing.",
    pricePerWalk: 20,
    durationOptions: ["60 min"],
    maxDogs: 1,
    available: true,
    features: ["GPS tracked", "Solo walks", "Reactive dog experience", "Vet nurse trained"],
  },
  {
    id: "ryan-o",
    name: "Ryan O.",
    area: "Aigburth",
    distance: "1.4 miles",
    tier: "silver",
    rating: 4.6,
    reviews: 22,
    bio: "Dog walker for 2 years. Loves big groups and long routes through Sefton Park.",
    pricePerWalk: 12,
    durationOptions: ["30 min", "60 min"],
    maxDogs: 5,
    available: false,
    features: ["GPS tracked", "Group walks", "Large breeds"],
  },
  {
    id: "chloe-m",
    name: "Chloe M.",
    area: "Mossley Hill",
    distance: "1.8 miles",
    tier: "gold",
    rating: 4.8,
    reviews: 57,
    bio: "Specialises in puppies and nervous dogs. Patient, calm approach — ideal for first-time dog owners.",
    pricePerWalk: 15,
    durationOptions: ["30 min", "60 min"],
    maxDogs: 3,
    available: true,
    features: ["GPS tracked", "Puppy experience", "Solo walks", "Reactive dog experience"],
  },
  {
    id: "ben-a",
    name: "Ben A.",
    area: "Woolton",
    distance: "2.3 miles",
    tier: "pro",
    rating: 4.9,
    reviews: 109,
    bio: "Full-time professional walker for 6 years. Fully insured, DBS checked, canine first aid qualified.",
    pricePerWalk: 18,
    durationOptions: ["30 min", "60 min", "90 min"],
    maxDogs: 6,
    available: true,
    features: ["GPS tracked", "Group walks", "Large breeds", "All sizes welcome"],
  },
  {
    id: "jade-f",
    name: "Jade F.",
    area: "Childwall",
    distance: "2.7 miles",
    tier: "silver",
    rating: 4.5,
    reviews: 18,
    bio: "Small breeds specialist. Gentle and attentive walker, great for dogs who prefer a quieter pace.",
    pricePerWalk: 12,
    durationOptions: ["30 min", "60 min"],
    maxDogs: 2,
    available: false,
    features: ["GPS tracked", "Solo walks", "Small breeds only"],
  },
  {
    id: "liam-c",
    name: "Liam C.",
    area: "Crosby",
    distance: "3.1 miles",
    tier: "gold",
    rating: 4.8,
    reviews: 34,
    bio: "Coast and park route specialist. Takes dogs on Crosby Beach when tides allow — your dog will love it.",
    pricePerWalk: 17,
    durationOptions: ["60 min", "90 min"],
    maxDogs: 4,
    available: true,
    features: ["GPS tracked", "Group walks", "Large breeds", "Puppy experience"],
  },
  {
    id: "amara-b",
    name: "Amara B.",
    area: "City Centre",
    distance: "0.4 miles",
    tier: "pro",
    rating: 5.0,
    reviews: 76,
    bio: "City walking specialist with extensive reactive dog experience. Calm, confident handler with excellent reviews.",
    pricePerWalk: 19,
    durationOptions: ["30 min", "60 min"],
    maxDogs: 3,
    available: true,
    features: ["GPS tracked", "Reactive dog experience", "Solo walks", "City routes"],
  },
];
