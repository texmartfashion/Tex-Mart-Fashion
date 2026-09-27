import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartCount
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121316] border-l border-[#d4af37]/25 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0e0f11]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#d4af37]" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                Shopping Bag
              </h2>
              <span className="font-mono text-xs text-neutral-400">({cartCount} items)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close bag"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#18191d] border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] mb-4">
                  <ShoppingBag size={24} />
                </div>
                <p className="font-display text-base font-semibold uppercase tracking-wider text-white mb-2">
                  Your bag is empty
                </p>
                <p className="text-xs text-neutral-400 max-w-xs mb-6 font-light">
                  Explore our handcrafted Panjabis, bespoke wool blazers, and luxury knitwear.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e6c457] transition-colors"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-[#18191d] border border-white/5 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 aspect-[3/4] bg-[#0c0d0e] overflow-hidden shrink-0 border border-white/10">
                    <img
                      src={item.image}
                      alt={item.productTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white tracking-wide line-clamp-1">
                          {item.productTitle}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <span>Size: <strong className="text-[#d4af37] font-mono">{item.size}</strong></span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">৳{item.price.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Stepper & Total */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <div className="flex items-center border border-white/15 bg-[#121316]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-mono text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-white tabular-nums">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0e0f11] space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-mono text-white font-semibold tabular-nums">
                    ৳{cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Delivery Fee</span>
                  <span>Calculated at checkout (৳80 / ৳150)</span>
                </div>
              </div>

              <div className="p-3 bg-[#18191d] border border-[#d4af37]/20 flex items-center gap-2.5 text-[11px] text-neutral-300">
                <ShieldCheck size={16} className="text-[#d4af37] shrink-0" />
                <span>
                  All orders verified via official bKash merchant gateway: <strong>01878928045</strong>
                </span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-6 bg-[#d4af37] hover:bg-[#e5c458] text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 gold-border-glow"
              >
                <span>Proceed to bKash Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
