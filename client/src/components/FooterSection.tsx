import React from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { Logo } from './Logo';

interface FooterSectionProps {
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onOpenLegal }) => {
  return (
    <footer className="py-14 bg-[#050508] border-t border-white/[0.08]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Brand Name & Logo */}
        <div className="flex flex-col items-center justify-center gap-2">
          <Logo size="md" />
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
            {PRODUCT_CONFIG.brandName}
          </h3>
          <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[#8c7dff] font-semibold">
            {PRODUCT_CONFIG.tagline}
          </p>
        </div>

        {/* Footer Links: Home | Contact | Terms of Use | Privacy Policy */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-zinc-400 font-medium">
          <a href="#main" className="hover:text-white transition-colors">Home</a>
          <span className="text-zinc-600">|</span>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          <span className="text-zinc-600">|</span>
          <button
            onClick={() => onOpenLegal('terms')}
            className="hover:text-white transition-colors"
          >
            Terms of Use
          </button>
          <span className="text-zinc-600">|</span>
          <button
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </button>
        </div>

        {/* Copyright notice */}
        <div className="pt-4 border-t border-white/[0.04] text-xs font-mono text-zinc-500">
          {PRODUCT_CONFIG.copyrightNotice}
        </div>
      </div>
    </footer>
  );
};
