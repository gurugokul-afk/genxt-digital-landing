import React from 'react';
import { Logo } from './Logo';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { ArrowRight, ArrowDown, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface MainHeroProps {
  onOpenCheckout: () => void;
}

export const MainHero: React.FC<MainHeroProps> = ({ onOpenCheckout }) => {
  return (
    <section id="main" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-[#6452f6]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e12_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Prominent Brand Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Logo size="xl" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono tracking-[0.25em] text-zinc-300 uppercase mt-2 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#6452f6] shadow-glow" />
            <span>{PRODUCT_CONFIG.brandName}</span>
          </div>
        </div>

        {/* Brand Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[1.08] mb-6">
          DISCOVER. BUILD.<br />
          <span className="text-[#8c7dff] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#8c7dff] to-[#6452f6]">
            GROW. EARN.
          </span>
        </h1>

        {/* Brand Description */}
        <div className="max-w-2xl mx-auto space-y-3 mb-10">
          <p className="text-lg sm:text-xl font-medium text-white">
            The Next Generation Community & Platform for Student Builders.
          </p>
          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            GENXT empowers ambitious college students and creators to discover untapped problems, build high-leverage digital assets, and establish independent income before graduation.
          </p>
        </div>

        {/* Buy Now CTA (Navigates directly to dedicated Product Section) */}
        <div className="flex items-center justify-center mb-12">
          <a
            href="#product"
            className="inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full text-base font-bold text-white bg-[#6452f6] hover:bg-[#5240eb] transition-all duration-200 shadow-glow hover:shadow-glow-lg active:scale-95 group"
          >
            <span>Buy Now</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </a>
        </div>

        {/* Key Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant Digital Download</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#8c7dff]" />
            <span>Secure UPI Payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8c7dff]" />
            <span>Official GENXT Edition</span>
          </div>
        </div>
      </div>
    </section>
  );
};
