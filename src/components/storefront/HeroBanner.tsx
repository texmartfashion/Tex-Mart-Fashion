import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { activeTheme } = useStore();

  return (
    <section className="relative w-full overflow-hidden bg-[#090a0c] border-b border-[#d4af37]/20">
      {/* Editorial Backdrop with Scrim */}
      <div className="relative min-h-[580px] md:min-h-[640px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeTheme.bannerImage}
            alt={activeTheme.bannerTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-60 md:brightness-75 transition-all duration-1000 scale-100"
          />
          {/* Measured Scrim for WCAG AA 4.5:1 text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090a0c] via-[#090a0c]/85 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0c] via-transparent to-black/40"></div>
          {/* Subtle gold noise ambient glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            {/* Unboxed editorial kicker */}
            <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#d4af37] font-semibold mb-4">
              <span className="w-8 h-[1px] bg-[#d4af37]"></span>
              <span>{activeTheme.bannerBadge}</span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400">Atelier Haute Menswear</span>
            </div>

            {/* Display Headline (Balanced, no orphan words) */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.1] mb-6 drop-shadow-md">
              <span className="gold-gradient-text block">{activeTheme.bannerTitle}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-xl mb-10">
              {activeTheme.bannerSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#featured"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#d4af37] text-black font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#e8c659] transition-all duration-200 gold-border-glow whitespace-nowrap"
              >
                <span>Explore Collection</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
