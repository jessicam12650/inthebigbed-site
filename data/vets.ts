export type VetType = "emergency" | "pdsa" | "independent" | "chain";

export type Vet = {
  id: string;
  name: string;
  address: string;
  area: string;
  type: VetType;
  isEmergency?: boolean;
  isAlwaysOpen?: boolean;
  rating: number | null;
  reviews: number | null;
  bio?: string;
  hours?: string;
  phone: string;
  services: string[];
  tags?: string[];
  website?: string;
};

export const VETS: Vet[] = [
  {
    id: "vets-now-liverpool",
    name: "Vets Now Liverpool",
    address: "149 Browside Road, Wavertree, L16 0JJ",
    area: "Wavertree",
    type: "emergency",
    isEmergency: true,
    isAlwaysOpen: true,
    rating: null,
    reviews: null,
    bio: "Liverpool's dedicated 24-hour emergency and critical care veterinary hospital. Open every night, every weekend, every bank holiday and Christmas Day. No appointment needed in an emergency.",
    phone: "01517334444",
    services: ["24hr emergency", "Critical care", "No appointment needed", "Open Christmas"],
  },
  {
    id: "pdsa-woolton",
    name: "PDSA Pet Hospital — Woolton",
    address: "Woolfall Heath Avenue, Huyton, L36 3YN",
    area: "Woolton",
    type: "pdsa",
    rating: 4.7,
    reviews: 312,
    hours: "Mon-Fri 8:30am–5pm",
    phone: "01514803558",
    services: ["Consultations", "Surgery", "X-ray", "Dental"],
    tags: ["Charity vet", "Low cost for eligible owners"],
  },
  {
    id: "woolton-veterinary-centre",
    name: "Woolton Veterinary Centre",
    address: "Quarry Street, Woolton, Liverpool, L25",
    area: "Woolton",
    type: "independent",
    rating: 4.9,
    reviews: 189,
    hours: "Mon-Fri 8:30am–6:30pm · Sat 9am–1pm",
    phone: "01514281788",
    services: ["Consultations", "Surgery", "Dental", "Nurse clinics"],
    tags: ["Independent", "Online booking"],
  },
  {
    id: "adams-veterinary-clinic",
    name: "Adams Veterinary Clinic",
    address: "Allerton Road, Liverpool, L18",
    area: "Allerton",
    type: "independent",
    rating: 4.8,
    reviews: 143,
    hours: "Mon-Fri 8:30am–6pm · Sat 9am–12pm",
    phone: "01514281234",
    services: ["Consultations", "Surgery", "Vaccinations", "Microchipping"],
    tags: ["Independent", "Family run"],
  },
  {
    id: "liverpool-vets",
    name: "Liverpool Vets",
    address: "Wavertree and Aigburth, Liverpool",
    area: "Wavertree, Aigburth",
    type: "independent",
    rating: 4.6,
    reviews: 98,
    hours: "Mon-Fri 8am–7pm",
    phone: "01517345678",
    services: ["Consultations", "Surgery", "X-ray", "Ultrasound"],
    tags: ["Independent", "Two locations"],
  },
  {
    id: "vets4pets-city-centre",
    name: "Vets4Pets Liverpool",
    address: "Liverpool City Centre, L1",
    area: "City Centre",
    type: "chain",
    rating: 4.4,
    reviews: 267,
    hours: "Mon-Sat 9am–6pm · Sun 10am–4pm",
    phone: "01512271234",
    services: ["Consultations", "Vaccinations", "Flea and worm", "Dental"],
    tags: ["Walk-in available", "Online booking"],
    website: "https://www.vets4pets.com",
  },
  {
    id: "medivet-allerton",
    name: "Medivet Liverpool — Allerton",
    address: "Allerton Road, Liverpool, L18",
    area: "Allerton, Childwall",
    type: "chain",
    rating: 4.3,
    reviews: 184,
    hours: "Mon-Fri 8:30am–7pm · Sat 9am–5pm",
    phone: "01514211234",
    services: ["Consultations", "Surgery", "Nurse clinics", "Health plans"],
    tags: ["24hr referral available", "Health plans"],
    website: "https://www.medivet.co.uk",
  },
  {
    id: "white-cross-crosby",
    name: "White Cross Vets — Crosby",
    address: "Crosby, Liverpool, L23",
    area: "Crosby",
    type: "chain",
    rating: 4.5,
    reviews: 156,
    hours: "Mon-Fri 8:30am–6:30pm · Sat 9am–1pm",
    phone: "01519241234",
    services: ["Consultations", "Surgery", "Dental", "Microchipping"],
    tags: ["Online booking", "Health plans"],
    website: "https://www.whitecrossvets.co.uk",
  },
  {
    id: "mossley-hill-vet",
    name: "Mossley Hill Veterinary Clinic",
    address: "Mossley Hill, Liverpool, L18",
    area: "Mossley Hill",
    type: "independent",
    rating: 4.8,
    reviews: 112,
    hours: "Mon-Fri 8:30am–6pm",
    phone: "01514243456",
    services: ["Consultations", "Surgery", "Vaccinations", "Dental"],
    tags: ["Independent", "Trusted locally"],
  },
  {
    id: "aigburth-veterinary-surgery",
    name: "Aigburth Veterinary Surgery",
    address: "Aigburth Road, Liverpool, L17",
    area: "Aigburth",
    type: "independent",
    rating: 4.9,
    reviews: 88,
    hours: "Mon-Fri 9am–6:30pm · Sat 9am–12pm",
    phone: "01517284567",
    services: ["Consultations", "Surgery", "Nurse clinics", "Ultrasound"],
    tags: ["Independent", "Long established"],
  },
];
