import { Product, ProductCategory, ThemeConfig, SiteSettings, Order, User } from '../types';

export const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: 'cat_1', name: 'Royal Panjabi', slug: 'royal-panjabi', description: 'Handcrafted luxury festive Panjabis with antique gold embroidery', itemCount: 6 },
  { id: 'cat_2', name: 'Suits & Blazers', slug: 'suits-blazers', description: 'Bespoke Italian wool tailored jackets and midnight tuxedos', itemCount: 4 },
  { id: 'cat_3', name: 'Luxury Polos', slug: 'luxury-polos', description: 'Egyptian cotton and fine-gauge Supima knit polos', itemCount: 4 },
  { id: 'cat_4', name: 'Formal Shirts', slug: 'formal-shirts', description: 'Giza 88 luxury double-twisted cotton shirts with French cuffs', itemCount: 5 },
  { id: 'cat_5', name: 'Velvet Waistcoats', slug: 'waistcoats', description: 'Hand-embroidered festive vests and Nehru jackets', itemCount: 3 },
  { id: 'cat_6', name: 'Handcrafted Footwear', slug: 'footwear', description: 'Blake-stitched Italian calfskin Oxfords and Loafers', itemCount: 3 },
  { id: 'cat_7', name: 'Haute Fragrance', slug: 'fragrance', description: 'Extrait de Parfum featuring rich amber, oud and black saffron', itemCount: 2 },
];

export const INITIAL_THEMES: ThemeConfig[] = [
  {
    id: 'eid_ul_fitr',
    name: 'Eid-ul-Fitr Royal Couture',
    isActive: true,
    primaryBg: '#090a0c',
    surfaceColor: '#121418',
    goldAccent: '#d4af37',
    goldAccentLight: '#f6e7b0',
    bannerTitle: 'EID-UL-FITR HAUTE COUTURE',
    bannerSubtitle: 'Hand-loomed silk Panjabis and bespoke waistcoats adorned with antique gold zari work.',
    bannerBadge: 'Festive Exclusive 2026',
    bannerImage: '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg',
    announcementText: '✨ EID EXCLUSIVE: Book your festive ensemble now. Delivery guaranteed before Eid. bKash Advance / Prepaid enabled.',
    fontHeading: "'Cinzel', serif",
    themeDescription: 'Regal black & burnished gold aesthetic with festive star & crescent accents, curated for Eid celebrations.'
  },
  {
    id: 'eid_ul_adha',
    name: 'Eid-ul-Adha Grand Heritage',
    isActive: false,
    primaryBg: '#0b0c0a',
    surfaceColor: '#141612',
    goldAccent: '#c5a059',
    goldAccentLight: '#e8d4a2',
    bannerTitle: 'HERITAGE CELEBRATION',
    bannerSubtitle: 'Impeccable raw silk and linen garments engineered for enduring elegance and warmth.',
    bannerBadge: 'Sacred Celebration',
    bannerImage: '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg',
    announcementText: '🌙 EID-UL-ADHA COLLECTION: Pure fabric craftsmanship for sacred gatherings. Flat shipping inside Dhaka 80 BDT.',
    fontHeading: "'Cinzel', serif",
    themeDescription: 'Deep emerald-shadowed black palette with warm brass gold accents.'
  },
  {
    id: 'winter',
    name: 'Winter Nocturne',
    isActive: false,
    primaryBg: '#08080a',
    surfaceColor: '#101014',
    goldAccent: '#d9a74a',
    goldAccentLight: '#f5d998',
    bannerTitle: 'WINTER NOCTURNE MENSWEAR',
    bannerSubtitle: 'Cashmere-infused blazers, heavy woven waistcoats, and double-breasted structured coats.',
    bannerBadge: 'Autumn/Winter Edition',
    bannerImage: '/src/assets/images/product_tailored_suit_1790494937644.jpg',
    announcementText: '❄️ WINTER DRAPES: Tailored Italian wool blazers & luxury knitwear now available.',
    fontHeading: "'Playfair Display', serif",
    themeDescription: 'Crisp midnight shadows, brushed gold hardware, and heavy textures.'
  },
  {
    id: 'summer',
    name: 'Summer Riviera & Linen',
    isActive: false,
    primaryBg: '#0d0d0f',
    surfaceColor: '#16171b',
    goldAccent: '#deb853',
    goldAccentLight: '#f7e399',
    bannerTitle: 'THE RIVIERA EDIT',
    bannerSubtitle: 'Breathable Irish linen, Supima knit polos, and featherlight evening Panjabis.',
    bannerBadge: 'Spring/Summer Collection',
    bannerImage: '/src/assets/images/product_luxury_polo_1790494949886.jpg',
    announcementText: '☀️ SUMMER LUXURY: Ultra-breathable Supima cotton and soft linen tailored for humid climates.',
    fontHeading: "'Cinzel', serif",
    themeDescription: 'Minimalist airy luxury with champagne gold highlights.'
  },
  {
    id: 'special_occasion',
    name: 'Bespoke Wedding & Gala',
    isActive: false,
    primaryBg: '#070708',
    surfaceColor: '#121215',
    goldAccent: '#e5b842',
    goldAccentLight: '#fae8a7',
    bannerTitle: 'GALA & WEDDING EDITION',
    bannerSubtitle: 'Double-faced silk tuxedo lapels, zardozi embroidered ceremonial attire, and heirloom craft.',
    bannerBadge: 'Bespoke Ceremonial',
    bannerImage: '/src/assets/images/product_eid_panjabi_1790494923642.jpg',
    announcementText: '👑 CEREMONIAL SUITE: Hand-beaded waistcoats and bespoke groom attire available for reservation.',
    fontHeading: "'Cinzel', serif",
    themeDescription: 'Ultra-luxurious high-contrast gold leaf styling with dramatic focal points.'
  },
  {
    id: 'regular',
    name: 'Atelier Minimalist (Standard)',
    isActive: false,
    primaryBg: '#0a0a0c',
    surfaceColor: '#131317',
    goldAccent: '#cfad4d',
    goldAccentLight: '#eedb97',
    bannerTitle: 'HAUTE MENSWEAR ESSENTIALS',
    bannerSubtitle: 'Timeless silhouettes, impeccable tailoring, and modern masculine refinement.',
    bannerBadge: 'Signature Line',
    bannerImage: '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg',
    announcementText: 'TEX-MART FASHION: Nationwide delivery with bKash verification · Dhaka 80 BDT · Outside 150 BDT',
    fontHeading: "'Cinzel', serif",
    themeDescription: 'Understated luxury black & gold minimalist design for daily premium menswear.'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    title: 'Imperial Noir Zari Raw-Silk Panjabi',
    slug: 'imperial-noir-zari-panjabi',
    category: 'Royal Panjabi',
    price: 8950,
    originalPrice: 10500,
    description: 'An exquisite black raw silk Panjabi featuring hand-stitched antique gold zari motifs on collar, cuff, and concealed button placket. Tailored with a modern tapered drape.',
    fabricDetails: '100% Pure Mulberry Raw Silk (80 GSM) with metallic gold thread embroidery',
    careInstructions: 'Dry clean only. Steam iron on reverse.',
    images: [
      '/src/assets/images/product_eid_panjabi_1790494923642.jpg',
      '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg'
    ],
    variants: [
      { id: 'v1_s', size: 'S', color: 'Obsidian Black', stock: 12, sku: 'TM-PJ-001-S' },
      { id: 'v1_m', size: 'M', color: 'Obsidian Black', stock: 18, sku: 'TM-PJ-001-M' },
      { id: 'v1_l', size: 'L', color: 'Obsidian Black', stock: 15, sku: 'TM-PJ-001-L' },
      { id: 'v1_xl', size: 'XL', color: 'Obsidian Black', stock: 8, sku: 'TM-PJ-001-XL' },
      { id: 'v1_xxl', size: 'XXL', color: 'Obsidian Black', stock: 4, sku: 'TM-PJ-001-XXL' }
    ],
    isFeatured: true,
    isNewArrival: true,
    stockTotal: 57,
    tag: 'Eid Special',
    createdAt: '2026-03-15T10:00:00Z'
  },
  {
    id: 'prod_2',
    title: 'Midnight Peak Lapel Bespoke Wool Blazer',
    slug: 'midnight-peak-lapel-bespoke-blazer',
    category: 'Suits & Blazers',
    price: 18500,
    originalPrice: 21000,
    description: 'Super 140s Italian wool tailored single-breasted evening jacket. Accented with lustrous silk grosgrain peak lapels, gold-toned interior piped seams, and horn buttons.',
    fabricDetails: 'Italian Super 140s Virgin Wool with 100% Cupro Bemberg lining',
    careInstructions: 'Specialist dry clean. Store on broad wooden suit hanger.',
    images: [
      '/src/assets/images/product_tailored_suit_1790494937644.jpg',
      '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg'
    ],
    variants: [
      { id: 'v2_s', size: 'S', color: 'Charcoal Noir', stock: 5, sku: 'TM-BLZ-002-S' },
      { id: 'v2_m', size: 'M', color: 'Charcoal Noir', stock: 10, sku: 'TM-BLZ-002-M' },
      { id: 'v2_l', size: 'L', color: 'Charcoal Noir', stock: 8, sku: 'TM-BLZ-002-L' },
      { id: 'v2_xl', size: 'XL', color: 'Charcoal Noir', stock: 3, sku: 'TM-BLZ-002-XL' }
    ],
    isFeatured: true,
    isNewArrival: true,
    stockTotal: 26,
    tag: 'Atelier Edition',
    createdAt: '2026-03-12T14:30:00Z'
  },
  {
    id: 'prod_3',
    title: 'Sovereign Supima Knit Polo with Gold Tipping',
    slug: 'sovereign-supima-knit-polo',
    category: 'Luxury Polos',
    price: 4200,
    originalPrice: 4800,
    description: 'Ultra-fine 18-gauge knit polo shirt made from long-staple California Supima cotton. Finished with subtle antique gold micro-piping on the collar and engraved genuine mother-of-pearl buttons.',
    fabricDetails: '100% Extra-Long Staple Supima Cotton Knit',
    careInstructions: 'Gentle hand wash inside out in cold water. Flat dry.',
    images: [
      '/src/assets/images/product_luxury_polo_1790494949886.jpg',
      '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg'
    ],
    variants: [
      { id: 'v3_s', size: 'S', color: 'Deep Black', stock: 14, sku: 'TM-POLO-003-S' },
      { id: 'v3_m', size: 'M', color: 'Deep Black', stock: 22, sku: 'TM-POLO-003-M' },
      { id: 'v3_l', size: 'L', color: 'Deep Black', stock: 19, sku: 'TM-POLO-003-L' },
      { id: 'v3_xl', size: 'XL', color: 'Deep Black', stock: 9, sku: 'TM-POLO-003-XL' },
      { id: 'v3_xxl', size: 'XXL', color: 'Deep Black', stock: 6, sku: 'TM-POLO-003-XXL' }
    ],
    isFeatured: true,
    isNewArrival: false,
    stockTotal: 70,
    tag: 'Best Seller',
    createdAt: '2026-02-28T09:15:00Z'
  },
  {
    id: 'prod_4',
    title: 'Giza 88 French-Cuff Dress Shirt',
    slug: 'giza-88-french-cuff-dress-shirt',
    category: 'Formal Shirts',
    price: 5400,
    originalPrice: 6200,
    description: 'Crisp Egyptian Giza 88 double-ply cotton formal shirt. Features an Italian spread collar, dual French cuffs designed for gold cufflinks, and a reinforced curved hem.',
    fabricDetails: '100% Egyptian Giza 88 Long Staple Cotton (120/2 yarn count)',
    careInstructions: 'Machine wash warm, warm iron with steam.',
    images: [
      '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg',
      '/src/assets/images/product_tailored_suit_1790494937644.jpg'
    ],
    variants: [
      { id: 'v4_s', size: 'S', color: 'Jet Black', stock: 10, sku: 'TM-SHT-004-S' },
      { id: 'v4_m', size: 'M', color: 'Jet Black', stock: 15, sku: 'TM-SHT-004-M' },
      { id: 'v4_l', size: 'L', color: 'Jet Black', stock: 12, sku: 'TM-SHT-004-L' },
      { id: 'v4_xl', size: 'XL', color: 'Jet Black', stock: 7, sku: 'TM-SHT-004-XL' }
    ],
    isFeatured: false,
    isNewArrival: true,
    stockTotal: 44,
    tag: 'Formal Luxury',
    createdAt: '2026-03-01T11:00:00Z'
  },
  {
    id: 'prod_5',
    title: 'Antique Brocade Velvet Ceremonial Waistcoat',
    slug: 'antique-brocade-velvet-waistcoat',
    category: 'Velvet Waistcoats',
    price: 7600,
    originalPrice: 8900,
    description: 'Plush midnight velvet waistcoat adorned with intricate floral bullion gold embroidery along the mandarin neckline and front panels. Hand-cast brass metal buttons.',
    fabricDetails: 'Silk Velvet blend with pure cotton canvas structuring',
    careInstructions: 'Specialist dry clean only.',
    images: [
      '/src/assets/images/product_eid_panjabi_1790494923642.jpg',
      '/src/assets/images/product_tailored_suit_1790494937644.jpg'
    ],
    variants: [
      { id: 'v5_m', size: 'M', color: 'Obsidian & Gold', stock: 8, sku: 'TM-WC-005-M' },
      { id: 'v5_l', size: 'L', color: 'Obsidian & Gold', stock: 12, sku: 'TM-WC-005-L' },
      { id: 'v5_xl', size: 'XL', color: 'Obsidian & Gold', stock: 5, sku: 'TM-WC-005-XL' }
    ],
    isFeatured: true,
    isNewArrival: true,
    stockTotal: 25,
    tag: 'Wedding Gala',
    createdAt: '2026-03-10T16:00:00Z'
  },
  {
    id: 'prod_6',
    title: 'Amber Noir Extrait de Parfum (100ml)',
    slug: 'amber-noir-extrait-de-parfum',
    category: 'Haute Fragrance',
    price: 6800,
    originalPrice: 7500,
    description: 'An intoxicating masculine olfactory signature. Opens with black saffron and smoked bergamot, leading to aged royal agarwood (oud), raw leather, and warm golden ambergris.',
    fabricDetails: '35% Oil Concentration (Extrait de Parfum)',
    careInstructions: 'Keep in dark cool space away from direct sunlight.',
    images: [
      '/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg'
    ],
    variants: [
      { id: 'v6_std', size: 'M', color: 'Obsidian Flask', stock: 30, sku: 'TM-FRAG-006-100ML' }
    ],
    isFeatured: false,
    isNewArrival: false,
    stockTotal: 30,
    tag: 'Exclusive Essence',
    createdAt: '2026-02-14T08:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'TM-94281',
    customerName: 'Tanvir Hossain',
    customerPhone: '01712984561',
    customerEmail: 'tanvir.dhaka@gmail.com',
    shippingAddress: {
      fullName: 'Tanvir Hossain',
      phone: '01712984561',
      email: 'tanvir.dhaka@gmail.com',
      deliveryZone: 'inside_dhaka',
      address: 'House 42, Road 11, Block D, Banani',
      city: 'Dhaka',
      notes: 'Please call before arrival'
    },
    items: [
      {
        productId: 'prod_1',
        productTitle: 'Imperial Noir Zari Raw-Silk Panjabi',
        price: 8950,
        size: 'L',
        quantity: 1,
        image: '/src/assets/images/product_eid_panjabi_1790494923642.jpg'
      }
    ],
    subtotal: 8950,
    deliveryCharge: 80,
    totalAmount: 9030,
    paymentMethod: 'prepaid',
    payment: {
      id: 'pay_1',
      orderId: 'ord_1',
      trxId: 'BKS94827104',
      method: 'prepaid',
      amount: 9030,
      remainingBalance: 0,
      status: 'pending',
      bkashSenderPhone: '01712984561',
      submittedAt: '2026-03-26T18:22:10Z'
    },
    status: 'pending_verification',
    createdAt: '2026-03-26T18:22:10Z',
    updatedAt: '2026-03-26T18:22:10Z'
  },
  {
    id: 'ord_2',
    orderNumber: 'TM-94280',
    customerName: 'Mahmudur Rahman',
    customerPhone: '01819345678',
    customerEmail: 'm.rahman@outlook.com',
    shippingAddress: {
      fullName: 'Mahmudur Rahman',
      phone: '01819345678',
      email: 'm.rahman@outlook.com',
      deliveryZone: 'outside_dhaka',
      address: 'GEC Circle, Nasirabad Housing Society',
      city: 'Chittagong',
      notes: 'Deliver afternoon'
    },
    items: [
      {
        productId: 'prod_3',
        productTitle: 'Sovereign Supima Knit Polo with Gold Tipping',
        price: 4200,
        size: 'M',
        quantity: 1,
        image: '/src/assets/images/product_luxury_polo_1790494949886.jpg'
      }
    ],
    subtotal: 4200,
    deliveryCharge: 150,
    totalAmount: 4350,
    paymentMethod: 'cod_advance',
    payment: {
      id: 'pay_2',
      orderId: 'ord_2',
      trxId: 'BKS77319082',
      method: 'cod_advance',
      amount: 150, // Delivery charge advance
      remainingBalance: 4200, // Payable at delivery
      status: 'verified',
      bkashSenderPhone: '01819345678',
      submittedAt: '2026-03-25T14:10:00Z',
      verifiedAt: '2026-03-25T14:45:00Z',
      verifiedBy: 'Texmartf@gmail.com'
    },
    status: 'confirmed',
    createdAt: '2026-03-25T14:10:00Z',
    updatedAt: '2026-03-25T14:45:00Z'
  },
  {
    id: 'ord_3',
    orderNumber: 'TM-94279',
    customerName: 'Sakibul Alam',
    customerPhone: '01911432190',
    customerEmail: 'sakib.alam@gmail.com',
    shippingAddress: {
      fullName: 'Sakibul Alam',
      phone: '01911432190',
      email: 'sakib.alam@gmail.com',
      deliveryZone: 'inside_dhaka',
      address: 'Sector 4, Uttara Model Town',
      city: 'Dhaka'
    },
    items: [
      {
        productId: 'prod_2',
        productTitle: 'Midnight Peak Lapel Bespoke Wool Blazer',
        price: 18500,
        size: 'L',
        quantity: 1,
        image: '/src/assets/images/product_tailored_suit_1790494937644.jpg'
      }
    ],
    subtotal: 18500,
    deliveryCharge: 80,
    totalAmount: 18580,
    paymentMethod: 'cod_advance',
    payment: {
      id: 'pay_3',
      orderId: 'ord_3',
      trxId: 'BKS66291044',
      method: 'cod_advance',
      amount: 80,
      remainingBalance: 18500,
      status: 'pending',
      bkashSenderPhone: '01911432190',
      submittedAt: '2026-03-26T21:05:00Z'
    },
    status: 'pending_verification',
    createdAt: '2026-03-26T21:05:00Z',
    updatedAt: '2026-03-26T21:05:00Z'
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  brandName: 'TEX-MART FASHION',
  brandTagline: 'HAUTE MENSWEAR COUTURE',
  merchantBkashNumber: '01878928045',
  deliveryChargeDhaka: 80,
  deliveryChargeOutside: 150,
  freeShippingThreshold: 25000,
  supportPhone: '+880 1878-928045',
  supportEmail: 'texmartfashion01@gmail.com',
  showroomAddress: 'Level 4, Gulshan Pink City, Dhaka-1212, Bangladesh',
  activeThemeId: 'eid_ul_fitr'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_super_owner',
    email: 'texmartfashion01@gmail.com',
    name: 'Chief Executive (Super Admin)',
    role: 'super_admin',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_super',
    email: 'Texmartf@gmail.com',
    name: 'Executive (Super Admin)',
    role: 'super_admin',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_admin',
    email: 'operations@texmartfashion.com',
    name: 'Kazi Farhan (Operations Admin)',
    role: 'admin',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'usr_moderator',
    email: 'finance@texmartfashion.com',
    name: 'Nayeem Hasan (bKash Payment Verifier)',
    role: 'moderator',
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'usr_editor',
    email: 'creative@texmartfashion.com',
    name: 'Rafi Ahmed (Visual Designer & Editor)',
    role: 'editor',
    createdAt: '2026-02-10T00:00:00Z'
  }
];
