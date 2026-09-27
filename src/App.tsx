/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { TopBar } from './components/storefront/TopBar';
import { HeroBanner } from './components/storefront/HeroBanner';
import { ProductCard } from './components/storefront/ProductCard';
import { ProductModal } from './components/storefront/ProductModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderLookup } from './components/storefront/OrderLookup';
import { GoogleAuthModal } from './components/storefront/GoogleAuthModal';
import { SearchModal } from './components/storefront/SearchModal';
import { WishlistDrawer } from './components/storefront/WishlistDrawer';
import { OrderStatusTracker } from './components/storefront/OrderStatusTracker';
import { AdminPortal } from './components/admin/AdminPortal';
import { Product, ThemePresetId, Order } from './types';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Palette,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Heart
} from 'lucide-react';

const StorefrontView: React.FC = () => {
  const {
    products,
    categories,
    activeTheme,
    themes,
    setActiveTheme,
    settings,
    currentView,
    setCurrentView,
    wishlist,
    wishlistCount,
    setIsWishlistOpen,
    currentUser
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter products by category or favorites
  const filteredProducts = selectedCategory === 'all'
    ? products
    : selectedCategory === 'favorites'
    ? products.filter(p => wishlist.includes(p.id))
    : products.filter(p => p.category.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, ''));

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0e] text-[#f4f4f5] selection:bg-[#d4af37] selection:text-black">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Campaign Hero */}
      <HeroBanner />

      {/* Featured Collection Section */}
      <section id="featured" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold mb-2">
              <span className="w-5 h-[1px] bg-[#d4af37]"></span>
              <span>{activeTheme.name}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white">
              Curated Menswear Collection
            </h2>
          </div>

          {/* Interactive Category Filter Bar */}
          <div className="flex items-center gap-1 p-1 bg-[#141518] border border-white/10 overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Garments
            </button>
            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'favorites'
                  ? 'bg-[#d4af37] text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Heart
                size={12}
                fill={selectedCategory === 'favorites' ? '#000000' : (wishlistCount > 0 ? '#d4af37' : 'none')}
                className={wishlistCount > 0 && selectedCategory !== 'favorites' ? 'text-[#d4af37]' : ''}
              />
              <span>My Favorites ({wishlistCount})</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === c.name
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid: 3-column desktop */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#141518] border border-white/10 p-8 my-4">
            <Heart size={36} className="mx-auto text-[#d4af37] mb-3 opacity-60" />
            <h3 className="font-display text-lg font-bold uppercase text-white mb-2">
              {selectedCategory === 'favorites' ? 'No Favorites Saved Yet' : 'No Garments Found'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
              {selectedCategory === 'favorites'
                ? 'Click the heart icon on any royal Panjabi, bespoke blazer, or luxury knit polo to save items to your personal atelier wishlist.'
                : 'No items found matching the selected category.'}
            </p>
            {selectedCategory === 'favorites' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-6 py-2.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider"
              >
                Browse All Garments
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Craftsmanship & Atelier Editorial Spotlight */}
      <section id="story" className="bg-[#090a0c] border-t border-b border-white/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold mb-3">
              <span className="w-5 h-[1px] bg-[#d4af37]"></span>
              <span>The Atelier Standard</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-white leading-tight mb-6">
              Precision Tailoring Meets Ancient Artisanship
            </h2>
            <p className="text-sm text-neutral-300 font-light leading-relaxed mb-6">
              At TEX-MART FASHION, each silhouette is developed through rigorous pattern making,
              utilizing hand-selected raw mulberry silks, Super 140s Italian virgin wool, and double-twisted Egyptian Giza 88 cottons.
              Our artisans spend up to 48 hours executing antique gold zari needlework across the collars of our signature festive Panjabis.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10 text-xs">
              <div>
                <p className="font-bold text-white font-mono uppercase tracking-wider mb-1">
                  100% Pure Raw Silk
                </p>
                <p className="text-neutral-400 font-light">
                  Loom-woven in natural textures for effortless, dignified fall and drape.
                </p>
              </div>
              <div>
                <p className="font-bold text-white font-mono uppercase tracking-wider mb-1">
                  Super 140s Italian Wool
                </p>
                <p className="text-neutral-400 font-light">
                  Tailored blazers structured with full canvas and hand-finished satin lapels.
                </p>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] bg-[#141518] overflow-hidden border border-[#d4af37]/25 gold-border-glow">
            <img
              src="/src/assets/images/hero_mens_luxury_fashion_1790494910412.jpg"
              alt="Artisan Craftsmanship"
              className="w-full h-full object-cover filter brightness-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-white">
              <span className="font-display uppercase tracking-widest text-[#d4af37]">
                TEX-MART ATELIER &bull; DHAKA
              </span>
              <span className="font-mono text-neutral-400">EST. 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Real-Time Order Status Tracker Section */}
      <section id="track-order" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <OrderStatusTracker />
      </section>

      {/* bKash Payment Policy & Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#121316] border border-[#d4af37]/30 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold mb-3">
              <ShieldCheck size={16} />
              <span>Official Payment Verification Framework</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white mb-4">
              All Orders Require Verified bKash Transactions
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed mb-8">
              To guarantee bespoke garment allocation and eliminate fake or bogus orders, TEX-MART FASHION operates an authentic bKash verification workflow with zero duplicate transaction tolerance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prepaid Card */}
              <div className="p-5 bg-[#18191d] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block text-[#d4af37]">
                  1. Prepaid Orders
                </span>
                <p className="text-xs text-neutral-300 font-light">
                  Customer pays full amount via bKash to <strong className="text-white font-mono">{settings.merchantBkashNumber}</strong> and submits Transaction ID.
                </p>
                <div className="text-[11px] text-neutral-400 font-mono pt-2">
                  Status: <strong>Pending Verification &rarr; Confirmed &rarr; Dispatched</strong>
                </div>
              </div>

              {/* COD Card */}
              <div className="p-5 bg-[#18191d] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block text-[#d4af37]">
                  2. Cash on Delivery (Advance Delivery Fee)
                </span>
                <p className="text-xs text-neutral-300 font-light">
                  Customer pays delivery fee in advance (<strong className="text-white">Inside Dhaka: ৳80</strong>, <strong className="text-white">Outside Dhaka: ৳150</strong>) via bKash. Remaining balance is paid upon receiving the parcel.
                </p>
                <div className="text-[11px] text-neutral-400 font-mono pt-2">
                  Status: <strong>Pending Verification &rarr; Confirmed &rarr; Dispatched</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Luxury Footer */}
      <footer className="mt-auto bg-[#08090a] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-white/5">
          <div>
            <span className="font-display text-xl font-bold tracking-[0.2em] gold-gradient-text uppercase block mb-1">
              TEX-MART FASHION
            </span>
            <p className="text-neutral-500 text-xs font-light max-w-sm">
              Haute gents menswear atelier. Specialized festive Panjabis, bespoke Italian wool blazers, and luxury knitwear.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs uppercase tracking-wider">
            <div>
              <p className="text-white font-semibold mb-2">Showroom</p>
              <p className="text-neutral-400 normal-case">{settings.showroomAddress}</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Official bKash</p>
              <p className="font-mono text-[#d4af37] font-semibold">{settings.merchantBkashNumber}</p>
            </div>
          </div>
        </div>

        {/* Quiet copyright */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>&copy; {new Date().getFullYear()} TEX-MART FASHION. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsLookupOpen(true)} className="hover:text-[#d4af37] transition-colors">
              Track Order & Invoice
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <WishlistDrawer
        onOpenProductDetails={(p) => setSelectedProduct(p)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(ord) => {
          // Keep open to show confirmation invoice
        }}
        onTrackOrder={(orderNum) => {
          setTrackingOrderId(orderNum);
          setIsLookupOpen(true);
        }}
      />

      <OrderLookup
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        defaultOrderId={trackingOrderId}
      />

      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppRouter />
    </StoreProvider>
  );
}

const MainAppRouter: React.FC = () => {
  const { currentView, currentUser } = useStore();

  // ONLY the authenticated Super Admin (texmartfashion01@gmail.com) can ever view the admin portal
  const isAuthorizedSuperAdmin =
    Boolean(currentUser) &&
    currentUser?.email?.toLowerCase() === 'texmartfashion01@gmail.com' &&
    currentUser?.role === 'super_admin';

  if (currentView === 'admin' && isAuthorizedSuperAdmin) {
    return <AdminPortal />;
  }

  // All normal users (whether signed in as customer or not signed in at all)
  // will only ever see the storefront. No admin portal or admin login is visible to them.
  return <StorefrontView />;
};
