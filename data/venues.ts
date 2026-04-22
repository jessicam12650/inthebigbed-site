export type VenueCategory = "pub-bar" | "restaurant" | "cafe" | "park" | "beach";

export type Venue = {
  id: string;
  name: string;
  address: string;
  cat: VenueCategory;
  tag: string;
  featured?: boolean;
  note?: string;
  latLng: { lat: number; lng: number };
};

export const HANDPICKED: Venue[] = [
  {
    id: "baltic-market",
    name: "Baltic Market",
    address: "Stanhope Street, Liverpool",
    cat: "restaurant",
    tag: "Handpicked 🐾",
    featured: true,
    latLng: { lat: 53.3972, lng: -2.9802 },
  },
  {
    id: "bao-and-bap",
    name: "Bao and Bap",
    address: "Rodney Street, Liverpool",
    cat: "restaurant",
    tag: "Handpicked 🐾",
    featured: true,
    latLng: { lat: 53.4034, lng: -2.9682 },
  },
  {
    id: "dereks",
    name: "Derek's Coffee & Sandwiches",
    address: "Lark Lane, Liverpool",
    cat: "restaurant",
    tag: "Handpicked 🐾",
    featured: true,
    note: "Dog-friendly at all locations — Lark Lane · Berry Street · Allerton Road · College Road, Crosby",
    latLng: { lat: 53.3858, lng: -2.9596 },
  },
  {
    id: "halton-castle",
    name: "The Halton Castle",
    address: "Mill Lane, Liverpool",
    cat: "pub-bar",
    tag: "Handpicked 🐾",
    featured: true,
    latLng: { lat: 53.4072, lng: -2.989 },
  },
  {
    id: "eden-bar",
    name: "Eden Bar",
    address: "Eaton Road, Liverpool",
    cat: "pub-bar",
    tag: "Handpicked 🐾",
    featured: true,
    latLng: { lat: 53.384, lng: -2.9388 },
  },
];

export const VENUES: Venue[] = [
  { id: "ship-mitre", name: "The Ship and Mitre", address: "133 Dale St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4074, lng: -2.9836 } },
  { id: "dead-crafty", name: "The Dead Crafty Beer Company", address: "Dale St, City Centre, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4072, lng: -2.9831 } },
  { id: "philharmonic", name: "The Philharmonic Dining Rooms", address: "36 Hope St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4021, lng: -2.9697 } },
  { id: "hope-anchor", name: "The Hope and Anchor", address: "Maryland St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4013, lng: -2.9651 } },
  { id: "ma-boyles", name: "Ma Boyle's Alehouse and Eatery", address: "Tower Buildings, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4063, lng: -2.9978 } },
  { id: "cains", name: "Cains Brewery", address: "Stanhope St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3968, lng: -2.9806 } },
  { id: "cosy-club", name: "Cosy Club", address: "Liverpool ONE, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.4047, lng: -2.9872 } },
  { id: "salt-dog", name: "Salt Dog Slims", address: "Rainford Gardens, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4068, lng: -2.9883 } },
  { id: "pins", name: "Pins Social Club", address: "Duke St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4017, lng: -2.9795 } },
  { id: "slug-lettuce", name: "Slug and Lettuce", address: "City Centre, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4072, lng: -2.9857 } },
  { id: "refinery", name: "The Refinery Liverpool", address: "City Centre, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.405, lng: -2.9887 } },
  { id: "club-house", name: "The Club House", address: "City Centre, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4055, lng: -2.9882 } },
  { id: "kazimier", name: "Kazimier Garden", address: "32 Seel St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4003, lng: -2.9765 } },
  { id: "brewdog", name: "BrewDog Liverpool", address: "Colquitt St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4014, lng: -2.9719 } },
  { id: "buyers-club", name: "Buyers Club", address: "Hardman St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.401, lng: -2.9696 } },
  { id: "baltic-fleet", name: "Baltic Fleet", address: "33A Wapping, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4009, lng: -2.9942 } },
  { id: "baltic-social", name: "Baltic Social", address: "Baltic Triangle, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3982, lng: -2.9802 } },
  { id: "brasco-dock", name: "Brasco Lounge", address: "Royal Albert Dock, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4001, lng: -2.9963 } },
  { id: "punch-tarmeys", name: "Punch Tarmey's", address: "City Centre, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.407, lng: -2.9876 } },
  { id: "shenanigans", name: "Shenanigans", address: "City Centre, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4068, lng: -2.988 } },
  { id: "lodge", name: "The Lodge", address: "33 Lark Lane, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3855, lng: -2.9595 } },
  { id: "bookbinder", name: "The Bookbinder", address: "Lark Lane, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.386, lng: -2.96 } },
  { id: "milo", name: "Milo Lounge", address: "Lark Lane, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3858, lng: -2.9592 } },
  { id: "caledonia", name: "The Caledonia", address: "22 Caledonia St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3999, lng: -2.9636 } },
  { id: "peter-kavs", name: "Peter Kavanagh's", address: "2-6 Egerton St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3986, lng: -2.9638 } },
  { id: "dovedale", name: "Dovedale Towers", address: "60 Penny Lane, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3802, lng: -2.953 } },
  { id: "storrsdale", name: "The Storrsdale", address: "Storrsdale Rd, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.378, lng: -2.9419 } },
  { id: "george-crosby", name: "The George Crosby", address: "1 Moor Lane, Crosby, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.487, lng: -3.0308 } },
  { id: "freshfield", name: "The Freshfield", address: "Formby, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.5508, lng: -3.0605 } },
  { id: "heatons-bridge", name: "Heatons Bridge", address: "Scarisbrick", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.601, lng: -2.8673 } },
  { id: "dandelion", name: "The Dandelion Tavern", address: "Cronton, Widnes", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.364, lng: -2.7488 } },
  { id: "doctor-duncans", name: "Doctor Duncans", address: "St Johns Lane, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4072, lng: -2.9923 } },
  { id: "pen-factory", name: "The Pen Factory", address: "Hope St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4016, lng: -2.9689 } },
  { id: "monro", name: "The Monro", address: "Duke St, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.4018, lng: -2.9787 } },
  { id: "one-oclock-gun", name: "The One O'Clock Gun", address: "Royal Albert Dock, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4003, lng: -2.9962 } },
  { id: "dog-house", name: "The Dog House", address: "15-17 Church Rd, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3936, lng: -2.937 } },
  { id: "head-of-steam", name: "The Head of Steam", address: "85 Hanover St, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4011, lng: -2.9791 } },
  { id: "farmers-arms", name: "The Farmers Arms", address: "Wirral", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3694, lng: -3.074 } },
  { id: "pho", name: "Pho Castle Street", address: "Castle St, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.4058, lng: -2.9906 } },
  { id: "lock-quay", name: "Lock and Quay", address: "2 Irlam Road, Bootle, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4458, lng: -2.9933 } },
  { id: "royal-standard", name: "The Royal Standard", address: "West Derby, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4286, lng: -2.914 } },
  { id: "white-hart", name: "White Hart", address: "23 Hope Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4022, lng: -2.9688 } },
  { id: "queen-hope", name: "Queen of Hope Street", address: "1-1A Myrtle Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4028, lng: -2.9672 } },
  { id: "swan", name: "Swan", address: "86 Wood Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4024, lng: -2.9744 } },
  { id: "mayflower", name: "Mayflower", address: "34 Pilgrim Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4018, lng: -2.9793 } },
  { id: "blondies", name: "Blondies", address: "Aigburth, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3733, lng: -2.9488 } },
  { id: "trap-hatch", name: "Trap and Hatch", address: "135 South Road, Waterloo, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.469, lng: -3.0223 } },
  { id: "cobden", name: "Cobden", address: "89 Quarry Street, Woolton, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3717, lng: -2.8984 } },
  { id: "three-piggies", name: "Three Piggies", address: "Allerton Road, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.3795, lng: -2.9433 } },
  { id: "rhubarb", name: "Rhubarb", address: "Lark Lane, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.3862, lng: -2.9598 } },
  { id: "queens-arms", name: "Queens Arms", address: "Victoria Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4062, lng: -2.9894 } },
  { id: "permit-room", name: "Permit Room by Dishoom", address: "Liverpool City Centre", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.4064, lng: -2.9863 } },
  { id: "mowgli", name: "Mowgli", address: "Bold Street, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.4022, lng: -2.9783 } },
  { id: "mcnastys", name: "McNasty's", address: "Seel Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4006, lng: -2.9768 } },
  { id: "frederiks", name: "Frederiks", address: "Hope Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4021, lng: -2.9695 } },
  { id: "shandon-bells", name: "The Shandon Bells", address: "Hope Street, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4019, lng: -2.9692 } },
  { id: "duke-st-market", name: "Duke Street Food and Drink Market", address: "Duke Street, Liverpool", cat: "restaurant", tag: "Dog-friendly 🐾", latLng: { lat: 53.4013, lng: -2.979 } },
  { id: "brasco-mann", name: "Brasco Lounge", address: "Mann Island, Liverpool", cat: "pub-bar", tag: "Dog-friendly 🐾", latLng: { lat: 53.4037, lng: -2.9978 } },
];

export const ALL_VENUES: Venue[] = [...HANDPICKED, ...VENUES];

export const LIVERPOOL_CENTER = { lat: 53.4084, lng: -2.9916 };
