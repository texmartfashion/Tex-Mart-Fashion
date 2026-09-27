import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const { products } = useStore();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = products.filter(p => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.fabricDetails.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#141518] border border-[#d4af37]/35 shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
          aria-label="Close search"
        >
          <X size={18} />
        </button>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Panjabi, Blazer, Polo, Raw Silk, Wool, Fragrance..."
            className="w-full bg-[#18191d] border border-white/15 pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Quick Suggestion Tags */}
        {!query && (
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 block mb-2">
              Popular Atelier Searches:
            </span>
            <div className="flex flex-wrap gap-2">
              {['Zari Panjabi', 'Italian Wool Blazer', 'Supima Polo', 'Giza Shirt', 'Eid Special'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-1 bg-[#18191d] hover:bg-[#22242a] text-xs text-neutral-300 border border-white/10 hover:border-[#d4af37]/40 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {query.trim() && filtered.length === 0 ? (
            <p className="text-center py-8 text-xs text-neutral-400">
              No garments found matching "{query}".
            </p>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="flex items-center justify-between p-3 bg-[#18191d] hover:bg-[#202227] border border-white/5 hover:border-[#d4af37]/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={prod.images[0]} alt={prod.title} className="w-10 h-12 object-cover bg-black" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{prod.title}</h4>
                    <p className="text-[11px] text-neutral-400">{prod.category} · {prod.fabricDetails}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#d4af37] tabular-nums">
                    ৳{prod.price.toLocaleString()}
                  </span>
                  <ArrowRight size={14} className="text-neutral-500" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
