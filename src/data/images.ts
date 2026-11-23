// Placeholder photography (Unsplash). Every URL below was checked to load and
// to actually show what its key says. Swap for real listing photos later.

const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const images = {
  // Facilities
  stainlessKitchen: u('1428515613728-6b4607e44363'), // commercial kitchen, chef at stainless line, pendant lights
  chefLine: u('1590577976322-3d2d6e2130d5'), // chef working a busy commercial line
  openKitchen: u('1622021142947-da7dedc7c39a'), // chef in bright pro kitchen
  flameLine: u('1600565193348-f74bd3c7ccdf'), // chef with flames on the line
  factoryFloor: u('1586528116311-ad8dd3c8310d'), // large production/warehouse floor
  storageAisles: u('1553413077-190dd305871c'), // tall dry-storage racking
  bakeryShop: u('1517433670267-08bbd4be890f'), // bakery shelves with loaves & baguettes
  restaurantBar: u('1514933651103-005eec06c04b'), // restaurant/bar interior
  diningRoom: u('1590846406792-0adc7f938f1d'), // moody restaurant interior
  prepBoard: u('1551218808-94e220e084d2'), // hands chopping on a prep board
  chefPlating: u('1577219491135-ce391730fb2c'), // chef plating under copper lamps
  beverageShelves: u('1556767576-5ec41e3239ea'), // shelves of bottled drinks

  // Products (renter brands)
  sourdough: u('1509440159596-0249088772ff'),
  croissants: u('1555507036-ab1f4038808a'),
  croissantsWarm: u('1530610476181-d83430b64dcd'),
  pastries: u('1495147466023-ac5c588e2e94'),
  dumplings: u('1534422298391-e4f8c172dddb'),
  curry: u('1585937421612-70a008356fbe'),
  pizza: u('1565299624946-b28f40a0ae38'),
  chips: u('1599490659213-e2b9527bd087'),
  salmon: u('1574484284002-952d92456975'),
  brunch: u('1504754524776-8f4f37790ca0'),
  burger: u('1568901346375-23c9450c58cd'),
} as const;

export type ImageKey = keyof typeof images;
