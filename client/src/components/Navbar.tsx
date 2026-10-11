import React, { useState } from 'react';
import { Logo } from './Logo';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { Menu, X, ArrowRight, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCheckout: () => void;
  onOpenAdmin: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCheckout, onOpenAdmin, onOpenLegal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <Logo size="sm" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
                {PRODUCT_CONFIG.brandShort}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase hidden sm:inline-block">
                The Next Generation Builders
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium text-zinc-300">
            <a href="#main" className="hover:text-white transition-colors">Home</a>
            <a href="#learn" className="hover:text-white transition-colors">What You'll Learn</a>
            <a href="#who" className="hover:text-white transition-colors">Who It's For</a>
            <a href="#product" className="hover:text-white transition-colors">The Guide</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1"
              title="Admin Orders Panel"
            >
              Orders Log
            </button>
            <button
              onClick={onOpenCheckout}
              className="relative group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#6452f6] hover:bg-[#5240eb] transition-all duration-200 shadow-glow active:scale-95"
            >
              <span>{PRODUCT_CONFIG.heroButtonText}</span>
              <span className="text-purple-200">({PRODUCT_CONFIG.currencySymbol}{PRODUCT_CONFIG.actualPrice})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenCheckout}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#6452f6] shadow-glow"
            >
              {PRODUCT_CONFIG.currencySymbol}{PRODUCT_CONFIG.actualPrice}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-b border-white/10 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-zinc-300">
            <a
              href="#main"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Home
            </a>
            <a
              href="#learn"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              What You'll Learn
            </a>
            <a
              href="#who"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Who It's For
            </a>
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Product & Pricing
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Contact Us
            </a>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCheckout();
              }}
              className="w-full py-3 rounded-full text-center font-bold text-white bg-[#6452f6] shadow-glow flex items-center justify-center gap-2 text-sm"
            >
              <span>{PRODUCT_CONFIG.heroButtonText}</span>
              <span>({PRODUCT_CONFIG.currencySymbol}{PRODUCT_CONFIG.actualPrice})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={PRODUCT_CONFIG.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-full text-center font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support ({PRODUCT_CONFIG.whatsappDisplay})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
