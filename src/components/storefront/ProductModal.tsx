import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { X, Check, ShieldCheck, Truck, RotateCcw, Sparkles, Heart } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onProceedToCheckout?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onProceedToCheckout }) => {
  const { addToCart, setIsCartOpen, isInWishlist, toggleWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const currentVariant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    onClose();
    if (onProceedToCheckout) {
      onProceedToCheckout();
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121316] border border-[#d4af37]/30 shadow-2xl my-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-[#0c0d0e]/80 text-neutral-400 hover:text-white border border-white/10 hover:border-[#d4af37] transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-[#0c0d0e] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/5">
            <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden bg-[#16171b] border border-[#d4af37]/15">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              {product.tag && (
                <div className="absolute top-3 left-3 bg-[#0c0d0e]/90 px-3 py-1 border border-[#d4af37]/40 text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                  {product.tag}
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 border overflow-hidden transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#d4af37] ring-1 ring-[#d4af37]'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contiguous Purchase Module */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#141518]">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-2 font-medium">
                <span>{product.category}</span>
                <span className="text-neutral-400 font-mono">
                  SKU: {currentVariant?.sku || 'TM-HAUTE-01'}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl font-bold text-white tracking-wide uppercase mb-3">
                {product.title}
              </h2>

              {/* Price & Tax */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl font-bold text-white font-mono tabular-nums">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-neutral-500 line-through font-mono tabular-nums">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-neutral-400">· Inclusive of VAT & Packaging</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light mb-5">
                {product.description}
              </p>

              {/* Fabric Specs */}
              <div className="bg-[#18191d] p-3.5 border border-white/5 mb-6 text-xs">
                <div className="text-[#d4af37] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  <span>Fabric & Craftsmanship</span>
                </div>
                <p className="text-neutral-300 font-light">{product.fabricDetails}</p>
                {product.careInstructions && (
                  <p className="text-neutral-400 text-[11px] mt-1 italic">Care: {product.careInstructions}</p>
                )}
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="uppercase tracking-widest text-neutral-300 font-medium">
                    Select Atelier Size
                  </span>
                  <span className="text-neutral-400 text-[11px]">
                    Available: <strong className="text-[#d4af37]">{currentVariant?.stock || 0} units</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedSize(v.size)}
                      className={`min-w-12 h-10 px-3 text-xs font-mono font-semibold transition-all border ${
                        selectedSize === v.size
                          ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-sm'
                          : 'bg-[#18191d] text-neutral-300 border-white/10 hover:border-[#d4af37]/60'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs uppercase tracking-widest text-neutral-300 font-medium">
                  Quantity
                </span>
                <div className="flex items-center border border-white/15 bg-[#18191d]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-xs font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentVariant?.stock || 10, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`py-3.5 px-4 shrink-0 flex items-center justify-center gap-2 border text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37]'
                      : 'bg-[#18191d] border-white/15 text-neutral-400 hover:text-white hover:border-[#d4af37]/60'
                  }`}
                  title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  aria-label="Toggle favorite"
                >
                  <Heart size={16} fill={isFavorite ? '#d4af37' : 'none'} className={isFavorite ? 'text-[#d4af37]' : ''} />
                  <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Favorite'}</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 font-semibold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${
                    justAdded
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-[#1c1d22] text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37]/10'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check size={14} />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : (
                    <span>Add to Shopping Bag</span>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 bg-[#d4af37] text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#eac85a] transition-all gold-border-glow"
                >
                  Buy Now with bKash
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <Truck size={13} className="text-[#d4af37]" />
                  <span>Dhaka: ৳80 · Outside: ৳150</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-[#d4af37]" />
                  <span>Manual bKash Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
