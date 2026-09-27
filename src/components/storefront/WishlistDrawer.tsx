import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Heart, Trash2, ArrowRight, ShoppingBag, Plus, Check } from 'lucide-react';
import { Product } from '../../types';

interface WishlistDrawerProps {
  onOpenProductDetails: (product: Product) => void;
  onProceedToCheckout?: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  onOpenProductDetails,
  onProceedToCheckout
}) => {
  const {
    wishlist,
    products,
    toggleWishlist,
    clearWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    addToCart,
    setIsCartOpen
  } = useStore();

  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  if (!isWishlistOpen) return null;

  // Retrieve products in wishlist
  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.variants[0]?.size || 'M';
    addToCart(product, defaultSize, 1);
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121316] border-l border-[#d4af37]/30 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0e0f11]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#18191d] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                <Heart size={16} fill="#d4af37" className="text-[#d4af37]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                  My Favorites
                </h2>
                <span className="font-mono text-xs text-neutral-400">
                  {favoriteProducts.length} saved {favoriteProducts.length === 1 ? 'garment' : 'garments'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {favoriteProducts.length > 0 && (
                <button
                  onClick={clearWishlist}
                  className="text-[11px] text-neutral-400 hover:text-red-400 uppercase tracking-wider transition-colors px-2 py-1"
                  title="Remove all items from favorites"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close favorites"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {favoriteProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#18191d] border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] mb-4">
                  <Heart size={28} className="text-[#d4af37]" />
                </div>
                <p className="font-display text-base font-semibold uppercase tracking-wider text-white mb-2">
                  No Favorites Saved Yet
                </p>
                <p className="text-xs text-neutral-400 max-w-xs mb-6 font-light leading-relaxed">
                  Click the heart icon on any royal Panjabi, tailored suit, or luxury polo to curate your bespoke wardrobe.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-6 py-2.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e6c457] transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              favoriteProducts.map((prod) => {
                const isAdded = addedItemMap[prod.id];
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onOpenProductDetails(prod);
                      setIsWishlistOpen(false);
                    }}
                    className="flex gap-4 p-3 bg-[#18191d] border border-white/5 hover:border-[#d4af37]/35 transition-all cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 aspect-[3/4] bg-[#0c0d0e] overflow-hidden shrink-0 border border-white/10 relative">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {prod.tag && (
                        <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[#d4af37] font-semibold">
                          {prod.tag}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-semibold block">
                              {prod.category}
                            </span>
                            <h4 className="text-xs font-semibold text-white tracking-wide line-clamp-1 group-hover:text-[#d4af37] transition-colors">
                              {prod.title}
                            </h4>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(prod.id);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                            title="Remove from favorites"
                            aria-label="Remove from favorites"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1 font-light">
                          {prod.fabricDetails}
                        </div>
                      </div>

                      {/* Bottom Row: Price & Move to Bag */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                        <span className="font-mono text-xs font-bold text-white tabular-nums">
                          ৳{prod.price.toLocaleString()}
                        </span>

                        <button
                          onClick={(e) => handleQuickAdd(prod, e)}
                          className={`h-7 px-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold transition-all border ${
                            isAdded
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-[#121316] text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black'
                          }`}
                          title="Add to Shopping Bag"
                        >
                          {isAdded ? (
                            <>
                              <Check size={11} />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={11} />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {favoriteProducts.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0e0f11] space-y-3">
              <button
                onClick={() => {
                  // Add all favorites to cart
                  favoriteProducts.forEach((p) => {
                    addToCart(p, p.variants[0]?.size || 'M', 1);
                  });
                  setIsWishlistOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3.5 px-6 bg-[#d4af37] hover:bg-[#e5c458] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 gold-border-glow cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>Move All to Shopping Bag</span>
              </button>

              <p className="text-[11px] text-center text-neutral-500">
                Favorites are permanently saved to your browser session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
