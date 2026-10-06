import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Search, Heart, PackageCheck } from 'lucide-react';

interface TopBarProps {
  onOpenLookup: () => void;
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenLookup, onOpenSearch }) => {
  const {
    cartCount,
    setIsCartOpen,
    wishlistCount,
    setIsWishlistOpen
  } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d0e]/95 backdrop-blur-md border-b border-[#d4af37]/15">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-left group cursor-pointer"
          >
            <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.2em] gold-gradient-text uppercase">
              TEX-MART
            </span>
            <span className="block text-[9px] tracking-[0.35em] text-neutral-400 font-sans uppercase -mt-0.5 group-hover:text-[#d4af37] transition-colors">
              FASHION
            </span>
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.18em] font-medium text-neutral-300">
          <a href="#featured" className="hover:text-[#d4af37] transition-colors">Royal Panjabi</a>
          <a href="#featured" className="hover:text-[#d4af37] transition-colors">Suits & Blazers</a>
          <a href="#featured" className="hover:text-[#d4af37] transition-colors">Luxury Polos</a>
          <a href="#featured" className="hover:text-[#d4af37] transition-colors">Footwear</a>
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="hover:text-[#d4af37] transition-colors text-left uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span>My Favorites</span>
            {wishlistCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#d4af37] text-black text-[9px] font-bold flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenLookup}
            className="hover:text-[#d4af37] transition-colors text-left uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <PackageCheck size={14} className="text-[#d4af37]" />
            <span>Track Order</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions (Search, Wishlist, Bag) */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Order lookup button for mobile */}
          <button
            onClick={onOpenLookup}
            className="lg:hidden p-2 text-neutral-300 hover:text-[#d4af37] transition-colors cursor-pointer"
            aria-label="Track Order"
            title="Track Order & Invoice"
          >
            <PackageCheck size={19} />
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-300 hover:text-[#d4af37] transition-colors cursor-pointer"
            aria-label="Search Collection"
            title="Search Collection"
          >
            <Search size={18} />
          </button>

          {/* Favorites Wishlist Trigger */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 text-neutral-200 hover:text-[#d4af37] transition-colors cursor-pointer"
            aria-label="My Favorites"
            title="View My Favorites"
          >
            <Heart
              size={19}
              className={wishlistCount > 0 ? 'text-[#d4af37]' : ''}
              fill={wishlistCount > 0 ? '#d4af37' : 'none'}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#d4af37] text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-neutral-200 hover:text-[#d4af37] transition-colors cursor-pointer"
            aria-label="Shopping Bag"
            title="View Shopping Bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#d4af37] text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
