import type { Tier } from "./walkers";

export type Boarder = {
  id: string;
  name: string;
  area: string;
  distance: string;
  tier: Tier;
  licenceNumber: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  maxDogs: number;
  location: string;
  garden: string;
  available: boolean;
  capacityAlert?: string;
  features: string[];
};

export const BOARDERS: Boarder[] = [
  {
    id: "sarah-m",
    name: "Sarah M.",
    area: "Allerton",
    distance: "0.8 miles",
    tier: "gold",
    licenceNumber: "LCC-2847",
    rating: 4.9,
    reviews: 47,
    pricePerNight: 35,
    maxDogs: 3,
    location: "In the home",
    garden: "Enclosed",
    available: true,
    features: ["All sizes welcome", "Daily photo updates", "Daily walks included", "No kennels"],
  },
  {
    id: "james-r",
    name: "James R.",
    area: "Mossley Hill",
    distance: "1.2 miles",
    tier: "pro",
    licenceNumber: "LCC-1193",
    rating: 5.0,
    reviews: 31,
    pricePerNight: 42,
    maxDogs: 2,
    location: "In the home",
    garden: "Enclosed",
    available: true,
    capacityAlert: "2 spaces left this Christmas",
    features: ["Webcam access", "Daily photo updates", "All sizes welcome", "Fully insured"],
  },
  {
    id: "emma-k",
    name: "Emma K.",
    area: "Wavertree",
    distance: "1.6 miles",
    tier: "silver",
    licenceNumber: "LCC-3561",
    rating: 4.7,
    reviews: 19,
    pricePerNight: 28,
    maxDogs: 2,
    location: "In the home",
    garden: "No garden",
    available: false,
    features: ["Small breeds only", "Daily walks included", "No kennels"],
  },
  {
    id: "tom-b",
    name: "Tom B.",
    area: "Aigburth",
    distance: "2.1 miles",
    tier: "gold",
    licenceNumber: "LCC-0974",
    rating: 4.8,
    reviews: 62,
    pricePerNight: 38,
    maxDogs: 4,
    location: "In the home",
    garden: "Enclosed",
    available: true,
    capacityAlert: "1 space left this Christmas",
    features: ["All sizes welcome", "Daily photo updates", "Webcam access", "Daily walks included"],
  },
  {
    id: "lisa-w",
    name: "Lisa W.",
    area: "Childwall",
    distance: "2.8 miles",
    tier: "silver",
    licenceNumber: "LCC-4402",
    rating: 4.6,
    reviews: 14,
    pricePerNight: 25,
    maxDogs: 2,
    location: "In the home",
    garden: "Enclosed",
    available: true,
    features: ["Small breeds only", "Daily photo updates", "No kennels"],
  },
  {
    id: "dan-h",
    name: "Dan H.",
    area: "West Derby",
    distance: "3.4 miles",
    tier: "pro",
    licenceNumber: "LCC-0338",
    rating: 4.9,
    reviews: 88,
    pricePerNight: 45,
    maxDogs: 5,
    location: "In the home",
    garden: "Enclosed",
    available: true,
    features: ["All sizes welcome", "Webcam access", "Daily walks included", "Fully insured", "Daily photo updates"],
  },
];
