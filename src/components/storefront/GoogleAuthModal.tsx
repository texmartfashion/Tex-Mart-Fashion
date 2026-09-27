import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ShieldCheck, Check } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithGoogle();
      setIsLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#141518] border border-[#d4af37]/35 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <span className="font-display text-2xl font-bold tracking-[0.2em] gold-gradient-text uppercase block">
            TEX-MART
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono">
            Haute Menswear &bull; Atelier Portal
          </span>
        </div>

        {/* Customer Google Login via Firebase */}
        <div className="space-y-6">
          <p className="text-xs text-neutral-300 text-center leading-relaxed">
            Sign in with your Google account to access your bespoke orders, track bKash verification statuses, and view saved atelier favorites.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-md rounded-xs cursor-pointer"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="pt-2 text-center text-[11px] text-neutral-500">
            <span>Secure authentication protected by Firebase &bull; 256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
