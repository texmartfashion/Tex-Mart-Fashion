import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Eye, Plus, Check, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0]?.size || 'M');
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const isFavorite = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#141518] border border-[#d4af37]/15 hover:border-[#d4af37]/45 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Product Image Slot (68% height) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18191d]">
        <img
          src={product.images[0]}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Minimal Unboxed Editorial Tag */}
        {product.tag && (
          <div className="absolute top-3 left-3 bg-[#0c0d0e]/80 backdrop-blur-sm px-2.5 py-1 border border-[#d4af37]/30 text-[10px] uppercase tracking-[0.2em] font-medium text-[#d4af37]">
            {product.tag}
          </div>
        )}

        {/* Heart Favorite Icon Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border cursor-pointer ${
            isFavorite
              ? 'bg-[#0c0d0e]/90 text-[#d4af37] border-[#d4af37]/60 shadow-md scale-105'
              : 'bg-[#0c0d0e]/70 text-neutral-300 border-white/15 hover:border-[#d4af37] hover:text-[#d4af37] hover:bg-[#0c0d0e]/95 opacity-80 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
          aria-label={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
        >
          <Heart
            size={15}
            fill={isFavorite ? '#d4af37' : 'none'}
            className={`transition-transform duration-200 ${isFavorite ? 'scale-110' : 'group-hover:scale-105'}`}
          />
        </button>

        {/* Quick View Button Overlay */}
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c0d0e]/90 border border-[#d4af37] text-xs uppercase tracking-wider text-white hover:bg-[#d4af37] hover:text-black transition-colors"
          >
            <Eye size={14} />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#141518]">
        <div>
          {/* Unboxed Metadata Header */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-neutral-400 mb-1.5 font-medium">
            <span>{product.category}</span>
            <span className="font-mono text-[10px] text-neutral-500">
              {product.stockTotal > 0 ? `${product.stockTotal} in Atelier` : 'Pre-Order'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-white tracking-wide group-hover:text-[#d4af37] transition-colors line-clamp-1 mb-2">
            {product.title}
          </h3>

          {/* Fabric Line */}
          <p className="text-xs text-neutral-400 line-clamp-1 mb-3 font-light">
            {product.fabricDetails}
          </p>
        </div>

        {/* Bottom Row: Price & Size / Add */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white tabular-nums tracking-tight font-mono">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-neutral-500 line-through tabular-nums font-mono">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
              bKash Verified
            </span>
          </div>

          {/* Quick Size Selector */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedSize(v.size)}
                  className={`w-7 h-7 text-[11px] font-mono font-medium transition-colors border ${
                    selectedSize === v.size
                      ? 'bg-[#d4af37] text-black border-[#d4af37]'
                      : 'bg-[#18191d] text-neutral-300 border-white/10 hover:border-[#d4af37]/50'
                  }`}
                  title={`Size ${v.size} (${v.stock} in stock)`}
                >
                  {v.size}
                </button>
              ))}
            </div>

            <button
              onClick={handleQuickAdd}
              className={`h-7 px-3 flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold transition-all ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1e2025] hover:bg-[#d4af37] text-neutral-200 hover:text-black border border-white/10 hover:border-[#d4af37]'
              }`}
              title="Add to Shopping Bag"
            >
              {addedAnimation ? (
                <>
                  <Check size={12} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus size={12} />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
