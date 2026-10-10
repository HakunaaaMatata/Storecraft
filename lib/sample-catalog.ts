import { Product, ProductVariant } from './store-data'

export interface SampleProductBlueprint {
  name: string
  description: string
  category: string
  price: number
  compareAtPrice?: number
  stock: number
  sku: string
  images: string[]
  variants?: ProductVariant[]
  featured?: boolean
}

export const CURATED_CATEGORY_PRODUCTS: Record<string, SampleProductBlueprint[]> = {
  'Home & Living': [
    {
      name: 'Forma Anodized Desk Lamp',
      description: 'Machined aluminum with warm ambient dimming and integrated Qi wireless charging dock in base.',
      category: 'Home & Living',
      price: 148, compareAtPrice: 180, stock: 24, sku: 'HL-LMP-01',
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Finish', options: ['Matte Black', 'Brushed Bone', 'Terracotta'] }],
      featured: true,
    },
    {
      name: 'Hand-thrown Ceramic Mug',
      description: 'Locally crafted stoneware mug with raw volcanic clay base and silky white satin interior glaze.',
      category: 'Home & Living',
      price: 34, compareAtPrice: 42, stock: 4, sku: 'HL-CRM-02',
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Glaze', options: ['Speckled Sand', 'Chalk White'] }],
      featured: true,
    },
    {
      name: 'Woven Belgian Linen Duvet Cover',
      description: 'Pre-washed pure French flax linen for lived-in softness with concealed coconut shell button closure.',
      category: 'Home & Living',
      price: 195, compareAtPrice: 230, stock: 12, sku: 'HL-BED-03',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['Queen', 'King'] }, { name: 'Color', options: ['Natural Oat', 'Olive Sage'] }],
    },
    {
      name: 'Walnut Floating Wall Shelf',
      description: 'Solid American black walnut with invisible powder-coated steel mounting brackets.',
      category: 'Home & Living',
      price: 89, stock: 16, sku: 'HL-WOD-04',
      images: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Length', options: ['24 inch', '36 inch'] }],
    },
    {
      name: 'Honed Travertine Coaster Set',
      description: 'Set of 4 heavy Italian travertine coasters with cork backing to protect fine furniture.',
      category: 'Home & Living',
      price: 42, stock: 30, sku: 'HL-CST-05',
      images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Minimalist Glass Carafe',
      description: 'Hand-blown borosilicate glass carafe with a subtle ribbed texture. Perfect for water or wine.',
      category: 'Home & Living',
      price: 55, stock: 18, sku: 'HL-GLS-06',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Organic Cotton Throw Blanket',
      description: 'Chunky knit organic cotton throw blanket. Incredibly soft and perfect for layering over a sofa or bed.',
      category: 'Home & Living',
      price: 120, compareAtPrice: 150, stock: 10, sku: 'HL-BLK-07',
      images: ['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Color', options: ['Cream', 'Charcoal', 'Terracotta'] }],
    },
    {
      name: 'Hand-Poured Soy Wax Candle',
      description: 'Artisan crafted soy candle with notes of sandalwood, amber, and a hint of vanilla. 40-hour burn time.',
      category: 'Home & Living',
      price: 28, stock: 40, sku: 'HL-CND-08',
      images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Scent', options: ['Sandalwood', 'Lavender', 'Citrus'] }],
    }
  ],
  'Fashion': [
    {
      name: 'Double-Breasted Wool Trench',
      description: 'Structured silhouette tailored from water-repellent Melton wool with horn buttons and storm flap.',
      category: 'Fashion',
      price: 495, compareAtPrice: 550, stock: 12, sku: 'FA-OUT-01',
      images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Camel', 'Midnight Black'] }],
      featured: true,
    },
    {
      name: 'Heavyweight Supima Cotton Tee',
      description: '280 GSM combed organic cotton with relaxed drop-shoulder cut and ribbed collar.',
      category: 'Fashion',
      price: 58, stock: 45, sku: 'FA-TOP-02',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Bone White', 'Washed Olive', 'Black'] }],
    },
    {
      name: 'Pleated Relaxed Trousers',
      description: 'Italian wool-blend wide-leg trouser featuring double forward pleats and adjusters at waist.',
      category: 'Fashion',
      price: 168, compareAtPrice: 195, stock: 8, sku: 'FA-BTM-03',
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Waist', options: ['30', '32', '34', '36'] }],
    },
    {
      name: 'Vegetable-Tanned Leather Tote',
      description: 'Full-grain Tuscan bridle leather tote with interior zip pocket and solid brass hardware.',
      category: 'Fashion',
      price: 240, stock: 3, sku: 'FA-BAG-04',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Color', options: ['Cognac Tan', 'Pitch Black'] }],
      featured: true,
    },
    {
      name: 'Cashmere Crewneck Sweater',
      description: 'Ultra-soft 100% Mongolian cashmere sweater. A timeless staple for year-round layering.',
      category: 'Fashion',
      price: 210, compareAtPrice: 250, stock: 15, sku: 'FA-SWT-05',
      images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['S', 'M', 'L'] }, { name: 'Color', options: ['Heather Grey', 'Navy', 'Oatmeal'] }],
    },
    {
      name: 'Classic Selvedge Denim',
      description: '13oz Japanese selvedge denim, straight fit. Unwashed for a personal break-in experience.',
      category: 'Fashion',
      price: 185, stock: 22, sku: 'FA-DNM-06',
      images: ['https://images.unsplash.com/photo-1542272604-780183188562?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Waist', options: ['30', '32', '34', '36'] }, { name: 'Length', options: ['30', '32', '34'] }],
    },
    {
      name: 'Minimalist Leather Sneakers',
      description: 'Premium Italian calfskin sneakers with Margom rubber soles and waxed cotton laces.',
      category: 'Fashion',
      price: 195, stock: 18, sku: 'FA-SNK-07',
      images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['40', '41', '42', '43', '44'] }, { name: 'Color', options: ['White', 'Black'] }],
    },
    {
      name: 'Merino Wool Beanie',
      description: 'Ribbed knit beanie crafted from 100% extra-fine merino wool. Warm, breathable, and itch-free.',
      category: 'Fashion',
      price: 45, stock: 50, sku: 'FA-HAT-08',
      images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Color', options: ['Charcoal', 'Navy', 'Burgundy'] }],
    }
  ],
  'Electronics': [
    {
      name: 'Tactile Mechanical Keyboard',
      description: 'CNC machined anodized aluminum chassis, hot-swappable PCB, and PBT dye-sublimated keycaps.',
      category: 'Electronics',
      price: 189, compareAtPrice: 219, stock: 18, sku: 'TC-KEY-01',
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Switch', options: ['Gateron Brown (Tactile)', 'Gateron Red (Linear)'] }],
      featured: true,
    },
    {
      name: 'Studio Wireless ANC Headphones',
      description: 'Custom 40mm biocellulose drivers with hybrid active noise cancellation and 40h battery.',
      category: 'Electronics',
      price: 279, compareAtPrice: 320, stock: 9, sku: 'TC-AUD-02',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Color', options: ['Matte Charcoal', 'Lunar Silver'] }],
    },
    {
      name: 'Magnetic Wireless Charging Stand',
      description: 'Fast 15W MagSafe charging stand for phone, earbuds, and smartwatch with weighted base.',
      category: 'Electronics',
      price: 79, stock: 25, sku: 'TC-PWR-03',
      images: ['https://images.unsplash.com/photo-1622445262464-84b14e073541?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Ultra-Slim USB-C Multiport Dock',
      description: '8-in-1 aluminum hub with dual 4K60Hz HDMI, 100W Power Delivery, and Gigabit Ethernet.',
      category: 'Electronics',
      price: 65, stock: 14, sku: 'TC-HUB-04',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Ergonomic Wireless Mouse',
      description: 'Vertical ergonomic mouse designed to reduce wrist strain, featuring a 4000 DPI precision sensor.',
      category: 'Electronics',
      price: 85, stock: 30, sku: 'TC-MSE-05',
      images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: '4K Ultra-Wide Monitor',
      description: '34-inch curved ultra-wide display with 144Hz refresh rate, 1ms response time, and 99% sRGB color gamut.',
      category: 'Electronics',
      price: 699, compareAtPrice: 799, stock: 5, sku: 'TC-MNT-06',
      images: ['https://images.unsplash.com/photo-1527443154391-420786bb8492?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Smart Home Hub Display',
      description: '7-inch touchscreen smart home controller with integrated voice assistant and security camera feed.',
      category: 'Electronics',
      price: 129, stock: 40, sku: 'TC-HUB-07',
      images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Noise-Isolating Earbuds',
      description: 'True wireless earbuds with graphene drivers and 24-hour total battery life.',
      category: 'Electronics',
      price: 149, stock: 22, sku: 'TC-AUD-08',
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
    }
  ],
  'Beauty & Skincare': [
    {
      name: 'Botanical Barrier Repair Serum',
      description: 'Formulated with cold-pressed rosehip seed, plant squalane, and multi-molecular ceramides.',
      category: 'Beauty & Skincare',
      price: 64, compareAtPrice: 75, stock: 35, sku: 'BS-SRM-01',
      images: ['https://images.unsplash.com/photo-1608248597359-0a68d0f19c96?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Volume', options: ['30ml', '50ml'] }],
      featured: true,
    },
    {
      name: 'Squalane & Peptide Facial Cream',
      description: 'Deep hydration cream for compromised skin barriers without greasy residue.',
      category: 'Beauty & Skincare',
      price: 48, stock: 22, sku: 'BS-CRM-02',
      images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Enzyme Gentle Cleansing Oil',
      description: 'Rinses clean with warm water, dissolving makeup and sunscreen while balancing moisture.',
      category: 'Beauty & Skincare',
      price: 36, stock: 18, sku: 'BS-CLN-03',
      images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Vitamin C Brightening Tonic',
      description: 'Daily alcohol-free toner with L-Ascorbic acid and licorice root extract for an even, glowing complexion.',
      category: 'Beauty & Skincare',
      price: 42, stock: 28, sku: 'BS-TNR-04',
      images: ['https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Mineral Sunscreen SPF 50',
      description: 'Lightweight, broad-spectrum zinc oxide physical sunscreen that leaves zero white cast.',
      category: 'Beauty & Skincare',
      price: 38, stock: 45, sku: 'BS-SPF-05',
      images: ['https://images.unsplash.com/photo-1556228578-8d89f4175314?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Overnight Exfoliating Treatment',
      description: 'Gentle 10% AHA/BHA blend to resurface skin texture and unclog pores while you sleep.',
      category: 'Beauty & Skincare',
      price: 55, compareAtPrice: 65, stock: 15, sku: 'BS-TRT-06',
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Hydrating Lip Sleeping Mask',
      description: 'Rich berry-infused lip mask with hyaluronic acid and shea butter for intense overnight moisture.',
      category: 'Beauty & Skincare',
      price: 24, stock: 60, sku: 'BS-LIP-07',
      images: ['https://images.unsplash.com/photo-1586024467005-4c07b4f5dc7f?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Flavor', options: ['Berry', 'Vanilla', 'Grapefruit'] }],
    },
    {
      name: 'Soothing Aloe Gel',
      description: 'Pure, organic aloe vera gel to calm irritated skin and sunburns.',
      category: 'Beauty & Skincare',
      price: 18, stock: 50, sku: 'BS-ALO-08',
      images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80'],
    }
  ],
  'Food & Beverages': [
    {
      name: 'Single-Origin Ethiopian Yirgacheffe Coffee',
      description: 'Washed heirloom beans with notes of bergamot, jasmine florals, and Meyer lemon candy.',
      category: 'Food & Beverages',
      price: 24, stock: 40, sku: 'FB-COF-01',
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Roast', options: ['Whole Bean (Light)', 'Filter Ground'] }],
      featured: true,
    },
    {
      name: 'Cold-Pressed Early Harvest Olive Oil',
      description: 'Single-estate Koroneiki olives harvested by hand in Crete with high polyphenol count.',
      category: 'Food & Beverages',
      price: 38, compareAtPrice: 45, stock: 15, sku: 'FB-OIL-02',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Ceremonial Grade Uji Matcha',
      description: 'First-harvest shade-grown green tea ground on granite mills in Kyoto Prefecture.',
      category: 'Food & Beverages',
      price: 34, stock: 5, sku: 'FB-MTC-03',
      images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Artisan Dark Chocolate Truffles',
      description: 'Box of 12 handcrafted truffles made with 72% Venezuelan dark chocolate and sea salt ganache.',
      category: 'Food & Beverages',
      price: 28, stock: 20, sku: 'FB-CHO-04',
      images: ['https://images.unsplash.com/photo-1548883354-94cbcc63f732?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Organic Manuka Honey MGO 400+',
      description: 'Raw, unpasteurized honey sourced from the remote forests of New Zealand.',
      category: 'Food & Beverages',
      price: 55, stock: 12, sku: 'FB-HNY-05',
      images: ['https://images.unsplash.com/photo-1587049352851-8d4e89134764?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Aged Balsamic Vinegar of Modena',
      description: 'Traditional 12-year aged balsamic vinegar, thick and syrupy with complex sweet-tart notes.',
      category: 'Food & Beverages',
      price: 45, stock: 8, sku: 'FB-VIN-06',
      images: ['https://images.unsplash.com/photo-1606115915090-be18fea23ce7?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Sparkling Botanical Water',
      description: 'Case of 12 sparkling waters infused with real fruit extracts and no added sugar.',
      category: 'Food & Beverages',
      price: 30, stock: 25, sku: 'FB-WTR-07',
      images: ['https://images.unsplash.com/photo-1595981267035-7b04d84b4e1a?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Flavor', options: ['Lemon Basil', 'Grapefruit Rosemary', 'Cucumber Mint'] }],
    },
    {
      name: 'Gourmet Pasta Assortment',
      description: 'Three packs of bronze-die extruded artisanal pasta from Campania, Italy.',
      category: 'Food & Beverages',
      price: 22, stock: 30, sku: 'FB-PST-08',
      images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'],
    }
  ],
  'Books & Stationery': [
    {
      name: 'Hardcover Dot Grid Studio Journal',
      description: '160gsm archival bleed-proof bamboo paper with flat-lay binding and dual ribbon markers.',
      category: 'Books & Stationery',
      price: 28, stock: 50, sku: 'BK-JRN-01',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Cover', options: ['Forest Green', 'Oatmeal Cloth', 'Charcoal'] }],
    },
    {
      name: 'Solid Brass Heavyweight Rollerball Pen',
      description: 'Balanced untreated raw brass that develops a personal rich patina over years of writing.',
      category: 'Books & Stationery',
      price: 58, stock: 8, sku: 'BK-PEN-02',
      images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Minimalist Desk Organizer',
      description: 'Machined aluminum tray with compartments for pens, paperclips, and sticky notes.',
      category: 'Books & Stationery',
      price: 45, stock: 15, sku: 'BK-ORG-03',
      images: ['https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Fountain Pen Ink Set',
      description: 'Set of three 30ml glass bottles featuring vibrant, waterproof archival inks.',
      category: 'Books & Stationery',
      price: 35, stock: 22, sku: 'BK-INK-04',
      images: ['https://images.unsplash.com/photo-1582298715873-1f1ce1c70e7e?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Leather Portfolio Cover',
      description: 'Hand-stitched full-grain leather cover designed to hold standard A5 notebooks.',
      category: 'Books & Stationery',
      price: 85, stock: 10, sku: 'BK-LTH-05',
      images: ['https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Artisan Watercolor Set',
      description: '24 half-pans of highly pigmented professional watercolors in a compact travel tin.',
      category: 'Books & Stationery',
      price: 65, stock: 12, sku: 'BK-ART-06',
      images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Weekly Planner 2027',
      description: 'Wire-bound weekly planner with thick recycled paper and minimalist layout.',
      category: 'Books & Stationery',
      price: 24, stock: 60, sku: 'BK-PLN-07',
      images: ['https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=800&q=80'],
    }
  ],
  'Sports & Fitness': [
    {
      name: 'High-Density Natural Cork Yoga Mat',
      description: 'Self-sanitizing organic cork surface over dense tree-rubber base for non-slip grip.',
      category: 'Sports & Fitness',
      price: 88, compareAtPrice: 105, stock: 14, sku: 'SF-MAT-01',
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Vacuum-Insulated Steel Sports Bottle',
      description: 'Keeps liquids iced for 24 hours with powder-coated sweat-proof exterior finish.',
      category: 'Sports & Fitness',
      price: 36, stock: 20, sku: 'SF-BTL-02',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Capacity', options: ['750ml', '1000ml'] }],
    },
    {
      name: 'Adjustable Dumbbell Set',
      description: 'Space-saving design allows weight adjustment from 5 to 52.5 lbs with a simple dial.',
      category: 'Sports & Fitness',
      price: 299, stock: 5, sku: 'SF-DMB-03',
      images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Resistance Band Bundle',
      description: 'Set of 5 heavy-duty latex bands with varying resistance levels, handles, and door anchor.',
      category: 'Sports & Fitness',
      price: 45, stock: 35, sku: 'SF-BND-04',
      images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Kettlebell',
      description: 'Cast iron kettlebell with a wide grip and flat base for functional training.',
      category: 'Sports & Fitness',
      price: 65, stock: 18, sku: 'SF-KTL-05',
      images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Weight', options: ['16kg', '24kg'] }],
    },
    {
      name: 'Foam Roller',
      description: 'High-density EVA foam roller for deep tissue massage and muscle recovery.',
      category: 'Sports & Fitness',
      price: 28, stock: 40, sku: 'SF-ROL-06',
      images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Jump Rope',
      description: 'Speed jump rope with adjustable steel cable and ball-bearing aluminum handles.',
      category: 'Sports & Fitness',
      price: 22, stock: 50, sku: 'SF-JMP-07',
      images: ['https://images.unsplash.com/photo-1517344884509-a0c97ea11cb7?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Yoga Block',
      description: 'High-density cork yoga block for support and stability during practice.',
      category: 'Sports & Fitness',
      price: 15, stock: 45, sku: 'SF-BLK-08',
      images: ['https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=800&q=80'],
    }
  ],
  'Jewelry & Accessories': [
    {
      name: '14k Gold Vermeil Herringbone Necklace',
      description: 'Silky fluid 4mm flat herringbone chain crafted in 14k gold over recycled 925 sterling silver.',
      category: 'Jewelry & Accessories',
      price: 120, compareAtPrice: 145, stock: 10, sku: 'JA-NCK-01',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Length', options: ['16 inch', '18 inch'] }],
    },
    {
      name: 'Classic Aviator Sunglasses',
      description: 'Polarized lenses with a lightweight titanium frame and spring hinges for maximum comfort.',
      category: 'Jewelry & Accessories',
      price: 145, stock: 15, sku: 'JA-SUN-02',
      images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Minimalist Automatic Watch',
      description: 'Sleek 38mm stainless steel watch with a sapphire crystal face and reliable Japanese automatic movement.',
      category: 'Jewelry & Accessories',
      price: 350, compareAtPrice: 395, stock: 5, sku: 'JA-WTC-03',
      images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Pearl Drop Earrings',
      description: 'Lustrous freshwater cultured pearls suspended from solid 14k gold huggie hoops.',
      category: 'Jewelry & Accessories',
      price: 95, stock: 20, sku: 'JA-EAR-04',
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Woven Leather Bracelet',
      description: 'Hand-braided leather bracelet with a magnetic stainless steel clasp.',
      category: 'Jewelry & Accessories',
      price: 45, stock: 30, sku: 'JA-BRC-05',
      images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Signet Ring',
      description: 'Classic oval signet ring crafted from sterling silver, ready for custom engraving.',
      category: 'Jewelry & Accessories',
      price: 75, stock: 12, sku: 'JA-RNG-06',
      images: ['https://images.unsplash.com/photo-1605100804763-247f673f224e?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['6', '7', '8', '9'] }],
    },
    {
      name: 'Silk Scarf',
      description: '100% pure mulberry silk scarf featuring a hand-painted geometric print.',
      category: 'Jewelry & Accessories',
      price: 65, stock: 25, sku: 'JA-SCR-07',
      images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Canvas Weekend Duffel',
      description: 'Durable heavyweight cotton canvas duffel bag with leather handles and brass hardware.',
      category: 'Jewelry & Accessories',
      price: 130, stock: 18, sku: 'JA-BAG-08',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
    }
  ]
};

// Fallback category mapping for alias matching
const CATEGORY_ALIASES: Record<string, string> = {
  'home & lifestyle': 'Home & Living',
  'home': 'Home & Living',
  'fashion & apparel': 'Fashion',
  'apparel': 'Fashion',
  'clothing': 'Fashion',
  'tech': 'Electronics',
  'technology': 'Electronics',
  'beauty': 'Beauty & Skincare',
  'skincare': 'Beauty & Skincare',
  'food': 'Food & Beverages',
  'grocery': 'Food & Beverages',
  'food & grocery': 'Food & Beverages',
  'beverages': 'Food & Beverages',
  'books': 'Books & Stationery',
  'stationery': 'Books & Stationery',
  'fitness': 'Sports & Fitness',
  'sports': 'Sports & Fitness',
  'jewelry': 'Jewelry & Accessories',
  'accessories': 'Jewelry & Accessories',
}

export function resolveCategoryKey(cat: string): string {
  const norm = cat.toLowerCase().trim()
  if (CURATED_CATEGORY_PRODUCTS[cat]) return cat
  for (const [alias, canonical] of Object.entries(CATEGORY_ALIASES)) {
    if (norm === alias || norm.includes(alias)) {
      return canonical
    }
  }
  for (const key of Object.keys(CURATED_CATEGORY_PRODUCTS)) {
    if (key.toLowerCase().includes(norm) || norm.includes(key.toLowerCase())) {
      return key
    }
  }
  return 'Home & Living'
}

export function getSampleProductsForCategories(
  categories: string[],
  storeId: string,
  existingSkus: Set<string> = new Set()
): Product[] {
  const result: Product[] = []
  const usedSkus = new Set<string>(existingSkus)
  const targetCategories = categories.length > 0 ? categories : ['Home & Living']

  targetCategories.forEach((userCat, catIndex) => {
    const key = resolveCategoryKey(userCat)
    const blueprints = CURATED_CATEGORY_PRODUCTS[key] || CURATED_CATEGORY_PRODUCTS['Home & Living']

    blueprints.forEach((bp, itemIndex) => {
      // Deterministic SKU generation avoiding collisions
      let finalSku = bp.sku
      let counter = 1
      while (usedSkus.has(finalSku)) {
        finalSku = `${bp.sku}-${counter}`
        counter++
      }
      usedSkus.add(finalSku)

      const product: Product = {
        id: `prod-sample-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${itemIndex}-${catIndex}`,
        storeId,
        name: bp.name,
        slug: bp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        description: bp.description,
        category: userCat, // Use actual selected category
        price: bp.price,
        compareAtPrice: bp.compareAtPrice,
        stock: bp.stock,
        sku: finalSku,
        images: bp.images,
        variants: bp.variants,
        featured: bp.featured,
        createdAt: new Date().toISOString(),
      }
      result.push(product)
    })
  })

  return result
}

export function getSampleProductsSummary(categories: string[]): {
  count: number
  categoryBreakdown: { category: string; count: number }[]
  previewNames: string[]
} {
  const targetCategories = categories.length > 0 ? categories : ['Home & Living']
  let totalCount = 0
  const breakdown: { category: string; count: number }[] = []
  const previewNames: string[] = []

  targetCategories.forEach((cat) => {
    const key = resolveCategoryKey(cat)
    const items = CURATED_CATEGORY_PRODUCTS[key] || CURATED_CATEGORY_PRODUCTS['Home & Living']
    totalCount += items.length
    breakdown.push({ category: cat, count: items.length })
    items.forEach((item) => {
      if (previewNames.length < 5) {
        previewNames.push(item.name)
      }
    })
  })

  return {
    count: totalCount,
    categoryBreakdown: breakdown,
    previewNames,
  }
}
