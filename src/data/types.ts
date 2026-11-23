export type Role = 'renter' | 'host';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type ProductCategory =
  | 'baked'
  | 'beverage'
  | 'cpg'
  | 'ghost'
  | 'sauces'
  | 'mealprep'
  | 'catering'
  | 'confection'
  | 'frozen'
  | 'meat'
  | 'plant'
  | 'fermented'
  | 'spices'
  | 'pet'
  | 'other';

export type FacilityType = 'commercial-kitchen' | 'bakery' | 'factory' | 'commissary' | 'restaurant';

export type Listing = {
  id: string;
  name: string;
  hostName: string;
  hostAvatar: string; // emoji
  facilityType: FacilityType;
  neighborhood: string;
  distanceMiles: number;
  ratePerHour: number;
  photos: string[];
  quote: string; // host's own description, shown in quotes on the card
  capabilities: string[]; // chips on the card
  equipment: { name: string; available: boolean }[];
  certifications: string[];
  allergenPolicies: string[]; // e.g. "Nut-Free"
  availableDays: Weekday[];
  hours: string; // e.g. "5:00 AM – 2:00 PM"
  matchScore: number; // 0–100
  matchReason: string; // the one-line "why"
  isNew?: boolean;
  /** e.g. "Usually replies in 2 hrs" */
  responseTime: string;
  cleaningFee: number; // flat, per booking
  minHours: number; // minimum booking length
  deposit: number; // refundable, per booking
  rating: number;
  reviewCount: number;
  sqft: number;
  coords: { x: number; y: number }; // 0–1 within the fake map placeholder
};

export type Message = {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string; // display string
};

export type Conversation = {
  id: string;
  withName: string;
  withAvatar: string; // emoji
  listingId?: string;
  online: boolean;
  unread: number;
  draftBooking?: { label: string; date: string; time: string; equipment: string[] };
  messages: Message[];
};

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  listingId: string;
  facilityName: string;
  photo: string;
  date: string; // e.g. "Tue, Oct 13, 2026"
  time: string; // e.g. "6:00 AM — 12:00 PM"
  hours: number;
  stations: string; // e.g. "Deck Oven, Proofer"
  status: BookingStatus;
  hostName: string;
  accessCode?: string;
  accessNote?: string;
  total: number;
  /** Cost breakdown; total = ratePerHour * hours + cleaningFee */
  ratePerHour?: number;
  cleaningFee?: number;
  deposit?: number;
};

export type RenterRequest = {
  id: string;
  brandName: string;
  brandPhoto: string;
  date: string;
  time: string;
  tags: string[];
  matchScore: number;
  note: string;
  status: 'pending' | 'approved' | 'declined';
};

export type ScheduleSlot = {
  id: string;
  time: string; // "08:00"
  title: string;
  status: 'In Progress' | 'Maintenance' | 'Confirmed' | 'Pending';
};

export type DocumentItem = {
  id: string;
  name: string;
  kind: 'certificate' | 'insurance' | 'permit' | 'inspection';
  status: string; // e.g. "VERIFIED • EXPIRES OCT 2027"
  verified: boolean;
};
