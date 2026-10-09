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
      price: 148,
      compareAtPrice: 180,
      stock: 24,
      sku: 'HL-LMP-01',
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Finish', options: ['Matte Black', 'Brushed Bone', 'Terracotta'] }],
      featured: true,
    },
    {
      name: 'Hand-thrown Ceramic Mug',
      description: 'Locally crafted stoneware mug with raw volcanic clay base and silky white satin interior glaze.',
      category: 'Home & Living',
      price: 34,
      compareAtPrice: 42,
      stock: 4,
      sku: 'HL-CRM-02',
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Glaze', options: ['Speckled Sand', 'Chalk White'] }],
      featured: true,
    },
    {
      name: 'Woven Belgian Linen Duvet Cover',
      description: 'Pre-washed pure French flax linen for lived-in softness with concealed coconut shell button closure.',
      category: 'Home & Living',
      price: 195,
      compareAtPrice: 230,
      stock: 12,
      sku: 'HL-BED-03',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['Queen', 'King'] }, { name: 'Color', options: ['Natural Oat', 'Olive Sage'] }],
    },
    {
      name: 'Walnut Floating Wall Shelf',
      description: 'Solid American black walnut with invisible powder-coated steel mounting brackets.',
      category: 'Home & Living',
      price: 89,
      stock: 16,
      sku: 'HL-WOD-04',
      images: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Length', options: ['24 inch', '36 inch'] }],
    },
    {
      name: 'Honed Travertine Coaster Set',
      description: 'Set of 4 heavy Italian travertine coasters with cork backing to protect fine furniture.',
      category: 'Home & Living',
      price: 42,
      stock: 30,
      sku: 'HL-CST-05',
      images: ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  'Fashion': [
    {
      name: 'Double-Breasted Wool Trench',
      description: 'Structured silhouette tailored from water-repellent Melton wool with horn buttons and storm flap.',
      category: 'Fashion',
      price: 495,
      compareAtPrice: 550,
      stock: 12,
      sku: 'FA-OUT-01',
      images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Camel', 'Midnight Black'] }],
      featured: true,
    },
    {
      name: 'Heavyweight Supima Cotton Tee',
      description: '280 GSM combed organic cotton with relaxed drop-shoulder cut and ribbed collar.',
      category: 'Fashion',
      price: 58,
      stock: 45,
      sku: 'FA-TOP-02',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['Bone White', 'Washed Olive', 'Black'] }],
    },
    {
      name: 'Pleated Relaxed Trousers',
      description: 'Italian wool-blend wide-leg trouser featuring double forward pleats and adjusters at waist.',
      category: 'Fashion',
      price: 168,
      compareAtPrice: 195,
      stock: 8,
      sku: 'FA-BTM-03',
      images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Waist', options: ['30', '32', '34', '36'] }],
    },
    {
      name: 'Vegetable-Tanned Leather Tote',
      description: 'Full-grain Tuscan bridle leather tote with interior zip pocket and solid brass hardware.',
      category: 'Fashion',
      price: 240,
      stock: 3,
      sku: 'FA-BAG-04',
      images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Color', options: ['Cognac Tan', 'Pitch Black'] }],
      featured: true,
    },
  ],
  'Electronics': [
    {
      name: 'Tactile Mechanical Keyboard',
      description: 'CNC machined anodized aluminum chassis, hot-swappable PCB, and PBT dye-sublimated keycaps.',
      category: 'Electronics',
      price: 189,
      compareAtPrice: 219,
      stock: 18,
      sku: 'TC-KEY-01',
      images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Switch', options: ['Gateron Brown (Tactile)', 'Gateron Red (Linear)'] }],
      featured: true,
    },
    {
      name: 'Studio Wireless ANC Headphones',
      description: 'Custom 40mm biocellulose drivers with hybrid active noise cancellation and 40h battery.',
      category: 'Electronics',
      price: 279,
      compareAtPrice: 320,
      stock: 9,
      sku: 'TC-AUD-02',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Color', options: ['Matte Charcoal', 'Lunar Silver'] }],
    },
    {
      name: 'Magnetic Wireless Charging Stand',
      description: 'Fast 15W MagSafe charging stand for phone, earbuds, and smartwatch with weighted base.',
      category: 'Electronics',
      price: 79,
      stock: 25,
      sku: 'TC-PWR-03',
      images: ['https://images.unsplash.com/photo-1622445262464-84b14e073541?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Ultra-Slim USB-C Multiport Dock',
      description: '8-in-1 aluminum hub with dual 4K60Hz HDMI, 100W Power Delivery, and Gigabit Ethernet.',
      category: 'Electronics',
      price: 65,
      stock: 14,
      sku: 'TC-HUB-04',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  'Beauty & Skincare': [
    {
      name: 'Botanical Barrier Repair Serum',
      description: 'Formulated with cold-pressed rosehip seed, plant squalane, and multi-molecular ceramides.',
      category: 'Beauty & Skincare',
      price: 64,
      compareAtPrice: 75,
      stock: 35,
      sku: 'BS-SRM-01',
      images: ['https://images.unsplash.com/photo-1608248597359-0a68d0f19c96?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Volume', options: ['30ml', '50ml'] }],
      featured: true,
    },
    {
      name: 'Squalane & Peptide Facial Cream',
      description: 'Deep hydration cream for compromised skin barriers without greasy residue.',
      category: 'Beauty & Skincare',
      price: 48,
      stock: 22,
      sku: 'BS-CRM-02',
      images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Enzyme Gentle Cleansing Oil',
      description: 'Rinses clean with warm water, dissolving makeup and sunscreen while balancing moisture.',
      category: 'Beauty & Skincare',
      price: 36,
      stock: 18,
      sku: 'BS-CLN-03',
      images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  'Food & Beverages': [
    {
      name: 'Single-Origin Ethiopian Yirgacheffe Coffee',
      description: 'Washed heirloom beans with notes of bergamot, jasmine florals, and Meyer lemon candy.',
      category: 'Food & Beverages',
      price: 24,
      stock: 40,
      sku: 'FB-COF-01',
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Roast', options: ['Whole Bean (Light)', 'Filter Ground'] }],
      featured: true,
    },
    {
      name: 'Cold-Pressed Early Harvest Olive Oil',
      description: 'Single-estate Koroneiki olives harvested by hand in Crete with high polyphenol count.',
      category: 'Food & Beverages',
      price: 38,
      compareAtPrice: 45,
      stock: 15,
      sku: 'FB-OIL-02',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Ceremonial Grade Uji Matcha',
      description: 'First-harvest shade-grown green tea ground on granite mills in Kyoto Prefecture.',
      category: 'Food & Beverages',
      price: 34,
      stock: 5,
      sku: 'FB-MTC-03',
      images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  'Books & Stationery': [
    {
      name: 'Hardcover Dot Grid Studio Journal',
      description: '160gsm archival bleed-proof bamboo paper with flat-lay binding and dual ribbon markers.',
      category: 'Books & Stationery',
      price: 28,
      stock: 50,
      sku: 'BK-JRN-01',
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Cover', options: ['Forest Green', 'Oatmeal Cloth', 'Charcoal'] }],
    },
    {
      name: 'Solid Brass Heavyweight Rollerball Pen',
      description: 'Balanced untreated raw brass that develops a personal rich patina over years of writing.',
      category: 'Books & Stationery',
      price: 58,
      stock: 8,
      sku: 'BK-PEN-02',
      images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'],
    },
  ],
  'Sports & Fitness': [
    {
      name: 'High-Density Natural Cork Yoga Mat',
      description: 'Self-sanitizing organic cork surface over dense tree-rubber base for non-slip grip.',
      category: 'Sports & Fitness',
      price: 88,
      compareAtPrice: 105,
      stock: 14,
      sku: 'SF-MAT-01',
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'],
    },
    {
      name: 'Vacuum-Insulated Steel Sports Bottle',
      description: 'Keeps liquids iced for 24 hours with powder-coated sweat-proof exterior finish.',
      category: 'Sports & Fitness',
      price: 36,
      stock: 20,
      sku: 'SF-BTL-02',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Capacity', options: ['750ml', '1000ml'] }],
    },
  ],
  'Jewelry & Accessories': [
    {
      name: '14k Gold Vermeil Herringbone Necklace',
      description: 'Silky fluid 4mm flat herringbone chain crafted in 14k gold over recycled 925 sterling silver.',
      category: 'Jewelry & Accessories',
      price: 120,
      compareAtPrice: 145,
      stock: 10,
      sku: 'JA-NCK-01',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'],
      variants: [{ name: 'Length', options: ['16 inch', '18 inch'] }],
    },
  ]
}

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
