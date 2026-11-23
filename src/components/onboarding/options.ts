import {
  Beef,
  Bone,
  Candy,
  ChefHat,
  CookingPot,
  Croissant,
  CupSoda,
  Factory,
  FileText,
  FlaskConical,
  IceCreamCone,
  Leaf,
  Mic,
  Package,
  Plus,
  Salad,
  Soup,
  UtensilsCrossed,
  Warehouse,
  Wheat,
} from 'lucide-react-native';
import type { FacilityType, ProductCategory } from '@/data/types';
import type { RenterPreferences } from '@/store/AppState';
import type { Option } from './OptionGrid';

export const productOptions: Option<ProductCategory>[] = [
  { value: 'baked', title: 'Baked Goods', meta: 'Bread, Pastry', icon: Croissant },
  { value: 'beverage', title: 'Beverages', meta: 'Juice, Coffee', icon: CupSoda },
  { value: 'cpg', title: 'Snacks', meta: 'Chips, Bars', icon: Package },
  { value: 'ghost', title: 'Ghost Kitchen', meta: 'Prep, Delivery', icon: CookingPot },
  { value: 'sauces', title: 'Sauces', meta: 'Hot Sauce, Jam', icon: Soup },
  { value: 'mealprep', title: 'Meal Prep', meta: 'Weekly Meals', icon: Salad },
  { value: 'catering', title: 'Catering', meta: 'Events', icon: ChefHat },
  { value: 'confection', title: 'Candy', meta: 'Chocolate, Fudge', icon: Candy },
  { value: 'frozen', title: 'Frozen & Dairy', meta: 'Ice Cream', icon: IceCreamCone },
  { value: 'meat', title: 'Meat & Fish', meta: 'Jerky, Smoked', icon: Beef },
  { value: 'plant', title: 'Plant-Based', meta: 'Vegan, Tofu', icon: Leaf },
  { value: 'fermented', title: 'Fermented', meta: 'Kombucha', icon: FlaskConical },
  { value: 'spices', title: 'Spices', meta: 'Rubs, Mixes', icon: Wheat },
  { value: 'pet', title: 'Pet Food', meta: 'Treats, Chews', icon: Bone },
  { value: 'other', title: 'Something Else', meta: 'Tell us what you make', icon: Plus },
];

/** Short phrase for each category, for copy like "Checking which suit baked goods…". */
export const categoryPhrase: Record<ProductCategory, string> = {
  baked: 'baked goods',
  beverage: 'beverages',
  cpg: 'snacks',
  ghost: 'delivery prep',
  sauces: 'sauces',
  mealprep: 'meal prep',
  catering: 'catering',
  confection: 'chocolate and candy',
  frozen: 'frozen and dairy',
  meat: 'meat and seafood',
  plant: 'plant-based food',
  fermented: 'fermented foods',
  spices: 'spices and mixes',
  pet: 'pet food',
  other: 'what you make',
};

/** "baked goods", "baked goods and beverages", "baked goods, sauces and more". */
export function describeCategories(cats: ProductCategory[], other = ''): string {
  const phrases = cats.map((c) => (c === 'other' && other.trim() ? other.trim().toLowerCase() : categoryPhrase[c]));
  if (phrases.length === 0) return 'your products';
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases[0]}, ${phrases[1]} and more`;
}

/** Union of the categories' sets, most-shared first, so multi-category renters see what they all need. */
export function equipmentFor(table: Record<ProductCategory, string[]>, cats: ProductCategory[]): string[] {
  const list = cats.length ? cats : (['other'] as ProductCategory[]);
  return [...new Set(list.flatMap((c) => table[c]))];
}

/** The equipment shown first on the requirements step for each category (the rest sit behind "Show all"). */
export const focusedEquipment: Record<ProductCategory, string[]> = {
  baked: ['Commercial Mixer', 'Deck Oven', 'Convection Oven', 'Rack Oven', 'Proofer', 'Sheeter', 'Walk-in Fridge', 'Stainless Prep', 'Dry Storage'],
  beverage: ['Juice Press', 'Bottling Line', 'Steam Kettle', 'Walk-in Fridge', 'Blast Chiller', 'Freezer', 'Stainless Prep', 'Dry Storage', 'Loading Dock'],
  cpg: ['Steam Kettle', 'Tilt Skillet', 'Bottling Line', 'Blast Chiller', 'Walk-in Fridge', 'Stainless Prep', 'Dry Storage', 'Loading Dock', 'Freezer'],
  ghost: ['Hood Line', 'Fryer', 'Convection Oven', 'Tilt Skillet', 'Steam Kettle', 'Walk-in Fridge', 'Freezer', 'Stainless Prep', 'Dry Storage'],
  sauces: ['Steam Kettle', 'Tilt Skillet', 'Bottling Line', 'Blast Chiller', 'Walk-in Fridge', 'Stainless Prep', 'Dry Storage', 'Loading Dock'],
  mealprep: ['Convection Oven', 'Tilt Skillet', 'Steam Kettle', 'Hood Line', 'Blast Chiller', 'Walk-in Fridge', 'Freezer', 'Stainless Prep'],
  catering: ['Convection Oven', 'Hood Line', 'Tilt Skillet', 'Steam Kettle', 'Walk-in Fridge', 'Freezer', 'Stainless Prep', 'Loading Dock'],
  confection: ['Commercial Mixer', 'Convection Oven', 'Steam Kettle', 'Sheeter', 'Walk-in Fridge', 'Blast Chiller', 'Stainless Prep', 'Dry Storage'],
  frozen: ['Blast Chiller', 'Freezer', 'Walk-in Fridge', 'Steam Kettle', 'Commercial Mixer', 'Stainless Prep', 'Bottling Line', 'Loading Dock'],
  meat: ['Walk-in Fridge', 'Freezer', 'Blast Chiller', 'Convection Oven', 'Hood Line', 'Tilt Skillet', 'Stainless Prep', 'Loading Dock'],
  plant: ['Steam Kettle', 'Tilt Skillet', 'Convection Oven', 'Commercial Mixer', 'Walk-in Fridge', 'Blast Chiller', 'Freezer', 'Stainless Prep'],
  fermented: ['Steam Kettle', 'Bottling Line', 'Juice Press', 'Walk-in Fridge', 'Blast Chiller', 'Stainless Prep', 'Dry Storage', 'Loading Dock'],
  spices: ['Dry Storage', 'Commercial Mixer', 'Stainless Prep', 'Convection Oven', 'Bottling Line', 'Loading Dock'],
  pet: ['Convection Oven', 'Commercial Mixer', 'Walk-in Fridge', 'Freezer', 'Blast Chiller', 'Stainless Prep', 'Dry Storage', 'Loading Dock'],
  other: ['Stainless Prep', 'Walk-in Fridge', 'Dry Storage', 'Convection Oven', 'Steam Kettle', 'Freezer', 'Hood Line', 'Commercial Mixer'],
};

/** Equipment pre-selected on the requirements step for each product category. */
export const suggestedEquipment: Record<ProductCategory, string[]> = {
  baked: ['Commercial Mixer', 'Deck Oven', 'Proofer', 'Walk-in Fridge', 'Stainless Prep'],
  beverage: ['Juice Press', 'Bottling Line', 'Walk-in Fridge', 'Stainless Prep'],
  cpg: ['Steam Kettle', 'Stainless Prep', 'Dry Storage', 'Loading Dock'],
  ghost: ['Hood Line', 'Fryer', 'Convection Oven', 'Walk-in Fridge'],
  sauces: ['Steam Kettle', 'Bottling Line', 'Walk-in Fridge', 'Stainless Prep'],
  mealprep: ['Convection Oven', 'Blast Chiller', 'Walk-in Fridge', 'Stainless Prep'],
  catering: ['Convection Oven', 'Hood Line', 'Walk-in Fridge', 'Stainless Prep'],
  confection: ['Commercial Mixer', 'Walk-in Fridge', 'Stainless Prep', 'Dry Storage'],
  frozen: ['Blast Chiller', 'Freezer', 'Walk-in Fridge', 'Stainless Prep'],
  meat: ['Walk-in Fridge', 'Freezer', 'Blast Chiller', 'Stainless Prep'],
  plant: ['Steam Kettle', 'Walk-in Fridge', 'Stainless Prep'],
  fermented: ['Steam Kettle', 'Bottling Line', 'Walk-in Fridge', 'Stainless Prep'],
  spices: ['Dry Storage', 'Commercial Mixer', 'Stainless Prep'],
  pet: ['Convection Oven', 'Commercial Mixer', 'Walk-in Fridge', 'Stainless Prep'],
  other: ['Stainless Prep', 'Walk-in Fridge'],
};

export const facilityOptions: Option<FacilityType>[] = [
  { value: 'commercial-kitchen', title: 'Commercial Kitchen', meta: 'Hood line, Prep', icon: ChefHat },
  { value: 'bakery', title: 'Bakery', meta: 'Ovens, Proofing', icon: Croissant },
  { value: 'factory', title: 'Factory / Co-packer', meta: 'Lines, Packaging', icon: Factory },
  { value: 'commissary', title: 'Commissary', meta: 'Shared prep hub', icon: Warehouse },
  { value: 'restaurant', title: 'Restaurant', meta: 'Off-hours line', icon: UtensilsCrossed },
];

export const facilityLabel = (t: FacilityType | null) => facilityOptions.find((o) => o.value === t)?.title ?? 'Facility';

export type TimeOfDay = RenterPreferences['timeOfDay'][number];

export const timeOfDayOptions: Option<TimeOfDay>[] = [
  { value: 'Early AM', title: 'Early AM', meta: '4 – 9 AM' },
  { value: 'Daytime', title: 'Daytime', meta: '9 AM – 4 PM' },
  { value: 'Evening', title: 'Evening', meta: '4 – 10 PM' },
  { value: 'Overnight', title: 'Overnight', meta: '10 PM – 4 AM' },
];

export const distanceOptions = [2, 5, 10, 25] as const;

export type ListingMethod = 'upload' | 'voice';

export const listingMethodOptions: Option<ListingMethod>[] = [
  { value: 'upload', title: 'Upload files', meta: 'Lists, permits, menus', icon: FileText },
  { value: 'voice', title: 'Describe it', meta: 'Talk for a minute', icon: Mic },
];

/** Hour windows a host can offer, with hours per day for the earnings estimate. */
export const hourPresets = [
  { label: '5:30 AM – 2:00 PM', hours: 8.5 },
  { label: '6:00 AM – 12:00 PM', hours: 6 },
  { label: '2:00 PM – 10:00 PM', hours: 8 },
  { label: '10:00 PM – 6:00 AM', hours: 8 },
];

/** Canned "voice description" the fake recorder transcribes live. */
export const voiceScript =
  "Hi, this is Bothell Baking Co. on Bothell Way in downtown Bothell. We're a twenty-two hundred square foot bakery with two deck ovens, a proofer, a sixty-quart commercial mixer, a walk-in fridge and about twenty feet of stainless prep. The space is open to renters Tuesdays and Thursdays from five-thirty in the morning until two. We're a strictly nut-free facility, fully permitted by King County Public Health, and our lead baker is ServSafe certified.";

/** Listing description the "LLM" writes from the voice note or documents. */
export const generatedDescription =
  'Bright 2,200 sq ft downtown Bothell bakery with two deck ovens, a proofer, a 60qt mixer, walk-in cold storage and 20 ft of stainless prep. Open to renters Tue & Thu, 5:30 AM – 2:00 PM. Strictly nut-free, King County Health Permit.';

/** Placeholder files for the "Use sample files" shortcut (matches the host's documents in mock data). */
export const sampleDocuments = ['King County Inspection Report.pdf', 'Equipment List 2026.pdf', 'Certificate of Occupancy.pdf'];
