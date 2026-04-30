// Dog-friendly venues across Liverpool. Coordinates and ratings are populated
// by `npm run enrich:places` against the Google Places API — see
// scripts/enrich-places.ts. New entries should be added with latLng=[0, 0]
// and no placeId; the script picks those up on the next run.

export type Category = "pub" | "bar" | "restaurant" | "cafe";

export type VenueLocation = {
  address: string;
  latLng: [number, number];
  placeId?: string;
};

export type Venue = {
  id: string;
  name: string;
  cat: Category;
  description?: string;
  rating?: number;
  userRatingsTotal?: number;
  hours?: string[]; // weekday_text from Google Places
  phone?: string;
  website?: string;
  featured?: boolean;
  note?: string;
  // Either a single location OR multiple grouped locations (Derek's, Botanist, Rudy's).
  location?: VenueLocation;
  locations?: VenueLocation[];
};

export const HANDPICKED: Venue[] = [
  {
    id: "baltic-market",
    name: "Baltic Market",
    cat: "restaurant",
    featured: true,
    location: { address: "Stanhope Street, Liverpool", latLng: [53.3972, -2.9802] },
  },
  {
    id: "bao-and-bap",
    name: "Bao and Bap",
    cat: "restaurant",
    featured: true,
    location: { address: "Rodney Street, Liverpool", latLng: [53.4034, -2.9682] },
  },
  {
    id: "dereks",
    name: "Derek's Coffee & Sandwiches",
    cat: "cafe",
    featured: true,
    locations: [
      { address: "Lark Lane, Liverpool", latLng: [53.3858, -2.9596] },
      { address: "Berry Street, Liverpool", latLng: [0, 0] },
      { address: "Allerton Road, Liverpool", latLng: [0, 0] },
      { address: "College Road, Crosby, Liverpool", latLng: [0, 0] },
    ],
  },
  {
    id: "halton-castle",
    name: "The Halton Castle",
    cat: "pub",
    featured: true,
    location: { address: "Mill Lane, Liverpool", latLng: [53.4072, -2.989] },
  },
  {
    id: "eden-bar",
    name: "Eden Bar",
    cat: "bar",
    featured: true,
    location: { address: "Eaton Road, Liverpool", latLng: [53.384, -2.9388] },
  },
];

export const VENUES: Venue[] = [
  { id: "ship-mitre", name: "The Ship and Mitre", cat: "pub", location: { address: "133 Dale St, Liverpool", latLng: [53.4074, -2.9836] } },
  { id: "dead-crafty", name: "The Dead Crafty Beer Company", cat: "bar", location: { address: "Dale St, City Centre, Liverpool", latLng: [53.4072, -2.9831] } },
  { id: "philharmonic", name: "The Philharmonic Dining Rooms", cat: "pub", location: { address: "36 Hope St, Liverpool", latLng: [53.4021, -2.9697] } },
  { id: "hope-anchor", name: "The Hope and Anchor", cat: "pub", location: { address: "Maryland St, Liverpool", latLng: [53.4013, -2.9651] } },
  { id: "ma-boyles", name: "Ma Boyle's Alehouse and Eatery", cat: "pub", location: { address: "Tower Buildings, Liverpool", latLng: [53.4063, -2.9978] } },
  { id: "cains", name: "Cains Brewery", cat: "bar", location: { address: "Stanhope St, Liverpool", latLng: [53.3968, -2.9806] } },
  { id: "cosy-club", name: "Cosy Club", cat: "restaurant", location: { address: "Liverpool ONE, Liverpool", latLng: [53.4047, -2.9872] } },
  { id: "salt-dog", name: "Salt Dog Slims", cat: "bar", location: { address: "Rainford Gardens, Liverpool", latLng: [53.4068, -2.9883] } },
  { id: "pins", name: "Pins Social Club", cat: "bar", location: { address: "Duke St, Liverpool", latLng: [53.4017, -2.9795] } },
  { id: "slug-lettuce", name: "Slug and Lettuce", cat: "bar", location: { address: "City Centre, Liverpool", latLng: [53.4072, -2.9857] } },
  { id: "refinery", name: "The Refinery Liverpool", cat: "restaurant", location: { address: "City Centre, Liverpool", latLng: [53.405, -2.9887] } },
  { id: "club-house", name: "The Club House", cat: "bar", location: { address: "City Centre, Liverpool", latLng: [53.4055, -2.9882] } },
  { id: "kazimier", name: "Kazimier Garden", cat: "bar", location: { address: "32 Seel St, Liverpool", latLng: [53.4003, -2.9765] } },
  { id: "brewdog", name: "BrewDog Liverpool", cat: "bar", location: { address: "Colquitt St, Liverpool", latLng: [53.4014, -2.9719] } },
  { id: "buyers-club", name: "Buyers Club", cat: "bar", location: { address: "Hardman St, Liverpool", latLng: [53.401, -2.9696] } },
  { id: "baltic-fleet", name: "Baltic Fleet", cat: "pub", location: { address: "33A Wapping, Liverpool", latLng: [53.4009, -2.9942] } },
  { id: "baltic-social", name: "Baltic Social", cat: "bar", location: { address: "Baltic Triangle, Liverpool", latLng: [53.3982, -2.9802] } },
  { id: "brasco-dock", name: "Brasco Lounge", cat: "bar", location: { address: "Royal Albert Dock, Liverpool", latLng: [53.4001, -2.9963] } },
  { id: "punch-tarmeys", name: "Punch Tarmey's", cat: "pub", location: { address: "City Centre, Liverpool", latLng: [53.407, -2.9876] } },
  { id: "shenanigans", name: "Shenanigans", cat: "pub", location: { address: "City Centre, Liverpool", latLng: [53.4068, -2.988] } },
  { id: "lodge", name: "The Lodge", cat: "pub", location: { address: "33 Lark Lane, Liverpool", latLng: [53.3855, -2.9595] } },
  { id: "bookbinder", name: "The Bookbinder", cat: "pub", location: { address: "Lark Lane, Liverpool", latLng: [53.386, -2.96] } },
  { id: "milo", name: "Milo Lounge", cat: "bar", location: { address: "Lark Lane, Liverpool", latLng: [53.3858, -2.9592] } },
  { id: "caledonia", name: "The Caledonia", cat: "pub", location: { address: "22 Caledonia St, Liverpool", latLng: [53.3999, -2.9636] } },
  { id: "peter-kavs", name: "Peter Kavanagh's", cat: "pub", location: { address: "2-6 Egerton St, Liverpool", latLng: [53.3986, -2.9638] } },
  { id: "dovedale", name: "Dovedale Towers", cat: "pub", location: { address: "60 Penny Lane, Liverpool", latLng: [53.3802, -2.953] } },
  { id: "storrsdale", name: "The Storrsdale", cat: "pub", location: { address: "Storrsdale Rd, Liverpool", latLng: [53.378, -2.9419] } },
  { id: "george-crosby", name: "The George Crosby", cat: "pub", location: { address: "1 Moor Lane, Crosby, Liverpool", latLng: [53.487, -3.0308] } },
  { id: "freshfield", name: "The Freshfield", cat: "pub", location: { address: "Formby, Liverpool", latLng: [53.5508, -3.0605] } },
  { id: "heatons-bridge", name: "Heatons Bridge", cat: "pub", location: { address: "Scarisbrick", latLng: [53.601, -2.8673] } },
  { id: "dandelion", name: "The Dandelion Tavern", cat: "pub", location: { address: "Cronton, Widnes", latLng: [53.364, -2.7488] } },
  { id: "doctor-duncans", name: "Doctor Duncans", cat: "pub", location: { address: "St Johns Lane, Liverpool", latLng: [53.4072, -2.9923] } },
  { id: "pen-factory", name: "The Pen Factory", cat: "bar", location: { address: "Hope St, Liverpool", latLng: [53.4016, -2.9689] } },
  { id: "monro", name: "The Monro", cat: "restaurant", location: { address: "Duke St, Liverpool", latLng: [53.4018, -2.9787] } },
  { id: "one-oclock-gun", name: "The One O'Clock Gun", cat: "pub", location: { address: "Royal Albert Dock, Liverpool", latLng: [53.4003, -2.9962] } },
  { id: "dog-house", name: "The Dog House", cat: "pub", location: { address: "15-17 Church Rd, Liverpool", latLng: [53.3936, -2.937] } },
  { id: "head-of-steam", name: "The Head of Steam", cat: "pub", location: { address: "85 Hanover St, Liverpool", latLng: [53.4011, -2.9791] } },
  { id: "farmers-arms", name: "The Farmers Arms", cat: "pub", location: { address: "Wirral", latLng: [53.3694, -3.074] } },
  { id: "pho", name: "Pho Castle Street", cat: "restaurant", location: { address: "Castle St, Liverpool", latLng: [53.4058, -2.9906] } },
  { id: "lock-quay", name: "Lock and Quay", cat: "pub", location: { address: "2 Irlam Road, Bootle, Liverpool", latLng: [53.4458, -2.9933] } },
  { id: "royal-standard", name: "The Royal Standard", cat: "pub", location: { address: "West Derby, Liverpool", latLng: [53.4286, -2.914] } },
  { id: "white-hart", name: "White Hart", cat: "bar", location: { address: "23 Hope Street, Liverpool", latLng: [53.4022, -2.9688] } },
  { id: "queen-hope", name: "Queen of Hope Street", cat: "bar", location: { address: "1-1A Myrtle Street, Liverpool", latLng: [53.4028, -2.9672] } },
  { id: "swan", name: "Swan", cat: "pub", location: { address: "86 Wood Street, Liverpool", latLng: [53.4024, -2.9744] } },
  { id: "mayflower", name: "Mayflower", cat: "pub", location: { address: "34 Pilgrim Street, Liverpool", latLng: [53.4018, -2.9793] } },
  { id: "blondies", name: "Blondies", cat: "bar", location: { address: "Aigburth, Liverpool", latLng: [53.3733, -2.9488] } },
  { id: "trap-hatch", name: "Trap and Hatch", cat: "bar", location: { address: "135 South Road, Waterloo, Liverpool", latLng: [53.469, -3.0223] } },
  { id: "cobden", name: "Cobden", cat: "pub", location: { address: "89 Quarry Street, Woolton, Liverpool", latLng: [53.3717, -2.8984] } },
  { id: "three-piggies", name: "Three Piggies", cat: "pub", location: { address: "Allerton Road, Liverpool", latLng: [53.3795, -2.9433] } },
  { id: "rhubarb", name: "Rhubarb", cat: "restaurant", location: { address: "Lark Lane, Liverpool", latLng: [53.3862, -2.9598] } },
  { id: "queens-arms", name: "Queens Arms", cat: "pub", location: { address: "Victoria Street, Liverpool", latLng: [53.4062, -2.9894] } },
  { id: "permit-room", name: "Permit Room by Dishoom", cat: "restaurant", location: { address: "Liverpool City Centre", latLng: [53.4064, -2.9863] } },
  { id: "mowgli", name: "Mowgli", cat: "restaurant", location: { address: "Bold Street, Liverpool", latLng: [53.4022, -2.9783] } },
  { id: "mcnastys", name: "McNasty's", cat: "bar", location: { address: "Seel Street, Liverpool", latLng: [53.4006, -2.9768] } },
  { id: "frederiks", name: "Frederiks", cat: "bar", location: { address: "Hope Street, Liverpool", latLng: [53.4021, -2.9695] } },
  { id: "shandon-bells", name: "The Shandon Bells", cat: "pub", location: { address: "Hope Street, Liverpool", latLng: [53.4019, -2.9692] } },
  { id: "duke-st-market", name: "Duke Street Food and Drink Market", cat: "restaurant", location: { address: "Duke Street, Liverpool", latLng: [53.4013, -2.979] } },
  { id: "brasco-mann", name: "Brasco Lounge", cat: "bar", location: { address: "Mann Island, Liverpool", latLng: [53.4037, -2.9978] } },

  // ─── New stubs (April 2026) — to be enriched via scripts/enrich-places.ts ──
  { id: "petrichor", name: "Petrichor", cat: "bar", location: { address: "2 Molyneux Way, Liverpool", latLng: [0, 0] } },
  { id: "terra-preta", name: "Terra Preta Bar and Coffee House", cat: "cafe", location: { address: "21 Longmoor Lane, Liverpool", latLng: [0, 0] } },
  { id: "alberts-schloss", name: "Albert's Schloss", cat: "bar", location: { address: "Bold Street, Liverpool", latLng: [0, 0] } },
  { id: "schillers-hall", name: "Schiller's Hall", cat: "bar", location: { address: "Hanover Street, Liverpool", latLng: [0, 0] } },
  { id: "nova-scotia", name: "Nova Scotia", cat: "restaurant", location: { address: "Mann Island, Liverpool", latLng: [0, 0] } },
  {
    id: "the-quarter",
    name: "The Quarter",
    cat: "restaurant",
    description: "Casual Italian dining in the heart of the Georgian Quarter",
    location: { address: "Falkner Street, Liverpool", latLng: [0, 0] },
  },
  { id: "the-vibe", name: "The Vibe", cat: "restaurant", location: { address: "Paradise Street, Liverpool", latLng: [0, 0] } },
  { id: "papillon", name: "Papillon", cat: "restaurant", location: { address: "Hope Street, Liverpool", latLng: [0, 0] } },
  {
    id: "ten-streets-social",
    name: "Ten Streets Social",
    cat: "bar",
    description: "Cocktails, roast dinners and live music",
    location: { address: "Regent Street, Liverpool", latLng: [0, 0] },
  },
  {
    id: "the-botanist",
    name: "The Botanist",
    cat: "restaurant",
    locations: [
      { address: "Albert Dock, Liverpool", latLng: [0, 0] },
      { address: "Chavasse Park, Liverpool", latLng: [0, 0] },
    ],
  },
  {
    id: "rudys-pizza",
    name: "Rudy's Pizza Napoletana",
    cat: "restaurant",
    locations: [
      { address: "Castle Street, Liverpool", latLng: [0, 0] },
      { address: "Bold Street, Liverpool", latLng: [0, 0] },
      { address: "Albert Dock, Liverpool", latLng: [0, 0] },
    ],
  },
];

export const ALL_VENUES: Venue[] = [...HANDPICKED, ...VENUES];

export const LIVERPOOL_CENTER = { lat: 53.4084, lng: -2.9916 };

// Flat list of every pin to drop on the map. Grouped venues contribute one
// pin per location; single-location venues contribute one pin.
export type VenuePin = {
  venue: Venue;
  location: VenueLocation;
  // Stable id per pin so the map can key markers without collisions for
  // grouped venues that share the parent venue.id.
  pinId: string;
};

export function venuePins(list: Venue[]): VenuePin[] {
  const pins: VenuePin[] = [];
  for (const v of list) {
    if (v.locations && v.locations.length > 0) {
      v.locations.forEach((loc, i) => {
        pins.push({ venue: v, location: loc, pinId: `${v.id}::${i}` });
      });
    } else if (v.location) {
      pins.push({ venue: v, location: v.location, pinId: v.id });
    }
  }
  return pins;
}
