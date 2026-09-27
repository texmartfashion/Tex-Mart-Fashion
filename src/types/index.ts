export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'editor' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Permission {
  id: string;
  code: string;
  description: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  itemCount?: number;
}

export interface ProductVariant {
  id: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string; // e.g. 'Panjabi', 'Suits & Blazers', 'Luxury Polos', 'Formal Shirts', 'Premium Denim', 'Waistcoats', 'Footwear', 'Fragrance'
  price: number;
  originalPrice?: number;
  description: string;
  fabricDetails: string;
  careInstructions?: string;
  images: string[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isNewArrival: boolean;
  stockTotal: number;
  tag?: string;
  createdAt: string;
}

export type PaymentMethod = 'prepaid' | 'cod_advance';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export type OrderStatus = 'pending_verification' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface PaymentRecord {
  id: string;
  orderId: string;
  trxId: string;
  method: PaymentMethod;
  amount: number; // For prepaid: full amount; for COD: delivery charge (80 or 150 BDT)
  remainingBalance: number; // For prepaid: 0; for COD: order subtotal
  status: PaymentStatus;
  bkashSenderPhone: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., TM-89201
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number; // 80 (inside dhaka) or 150 (outside dhaka)
  totalAmount: number;
  paymentMethod: PaymentMethod;
  payment: PaymentRecord;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type ThemePresetId = 'eid_ul_fitr' | 'eid_ul_adha' | 'winter' | 'summer' | 'special_occasion' | 'regular';

export interface ThemeConfig {
  id: ThemePresetId;
  name: string;
  isActive: boolean;
  primaryBg: string;
  surfaceColor: string;
  goldAccent: string;
  goldAccentLight: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBadge: string;
  bannerImage: string;
  announcementText: string;
  fontHeading: string;
  themeDescription: string;
}

export interface SiteSettings {
  brandName: string;
  brandTagline: string;
  merchantBkashNumber: string;
  deliveryChargeDhaka: number;
  deliveryChargeOutside: number;
  freeShippingThreshold: number;
  supportPhone: string;
  supportEmail: string;
  showroomAddress: string;
  activeThemeId: ThemePresetId;
}

export interface CMSContent {
  aboutStory: string;
  craftsmanshipText: string;
  shippingPolicy: string;
  returnsPolicy: string;
}
