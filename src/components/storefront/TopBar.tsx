import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Search, Shield, User as UserIcon, LogOut, ExternalLink, X, Heart } from 'lucide-react';

interface TopBarProps {
  onOpenAuth: () => void;
  onOpenLookup: () => void;
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenAuth, onOpenLookup, onOpenSearch }) => {
  const {
    activeTheme,
    cartCount,
    setIsCartOpen,
    wishlistCount,
    setIsWishlistOpen,
    currentUser,
    logout,
    setCurrentView,
    settings
  } = useStore();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d0e]/95 backdrop-blur-md border-b border-[#d4af37]/15">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('store')}
            className="text-left group cursor-pointer"
          >
            <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.2em] gold-gradient-text uppercase">
              TEX-MART
            </span>
            <span className="block text-[9px] tracking-[0.35em] text-neutral-400 font-sans uppercase -mt-0.5 group-hover:text-[#d4af37] transition-colors">
              FASHION
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
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
            className="hover:text-[#d4af37] transition-colors text-left uppercase cursor-pointer"
          >
            Track Order
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-4">
          {/* Quick Admin Portal link */}
          <button
            onClick={() => setCurrentView('admin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#18191d] border border-[#d4af37]/30 text-[11px] font-medium uppercase tracking-wider text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
            title="Open Admin Dashboard (admin.texmartfashion.vercel.app)"
          >
            <Shield size={13} />
            <span>Admin Portal</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-300 hover:text-[#d4af37] transition-colors"
            aria-label="Search Collection"
          >
            <Search size={18} />
          </button>

          {/* User Auth Profile */}
          {currentUser ? (
            <div className="relative group">
              <button
                className="flex items-center gap-2 p-1.5 rounded text-xs text-neutral-200 hover:text-[#d4af37] transition-colors"
                title={`Signed in as ${currentUser.name}`}
              >
                <div className="w-7 h-7 rounded-full bg-[#1e2025] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-xs font-semibold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden md:inline text-xs font-medium max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#141518] border border-[#d4af37]/20 shadow-xl rounded-sm py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                <div className="px-3 py-1 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{currentUser.email}</p>
                  <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-mono">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={onOpenLookup}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5 hover:text-white"
                >
                  My Orders & Invoices
                </button>
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5 hover:text-white flex items-center justify-between"
                >
                  <span>My Saved Favorites</span>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] font-mono text-[#d4af37] font-semibold">{wishlistCount}</span>
                  )}
                </button>
                {currentUser.email?.toLowerCase() === 'texmartfashion01@gmail.com' && currentUser.role === 'super_admin' && (
                  <>
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
                    >
                      Admin Console (This Tab)
                    </button>
                    <a
                      href="?view=admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 flex items-center justify-between"
                    >
                      <span>Admin Console (New Tab)</span>
                      <ExternalLink size={11} />
                    </a>
                  </>
                )}
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/5 flex items-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-neutral-300 hover:text-[#d4af37] transition-colors p-1"
            >
              <UserIcon size={18} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

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
