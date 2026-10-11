import React from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { Check, ArrowRight, Download, Lock } from 'lucide-react';

interface ProductSectionProps {
  onOpenCheckout: () => void;
  product?: {
    id?: string;
    name?: string;
    headline?: string;
    description?: string;
    price?: number;
    coverImage?: string;
    fileName?: string;
    whatsIncluded?: string[];
  } | null;
}

export const ProductSection: React.FC<ProductSectionProps> = ({ onOpenCheckout, product }) => {
  const name = product?.name || PRODUCT_CONFIG.productName;
  const price = product?.price !== undefined ? product.price : PRODUCT_CONFIG.actualPrice;
  const coverImage = product?.coverImage || PRODUCT_CONFIG.coverImage;
  const description = product?.description || "Everything you need to conceptualize, package, and launch your first digital product while managing your college workload.";
  const whatsIncluded = product?.whatsIncluded && product.whatsIncluded.length > 0
    ? product.whatsIncluded
    : PRODUCT_CONFIG.whatsIncluded;

  return (
    <section id="product" className="py-24 bg-[#07070a] border-t border-b border-white/[0.06] relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6452f6]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center sm:text-left mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6452f6]/20 border border-[#6452f6]/40 text-[#8c7dff] text-xs font-mono uppercase mb-3 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8c7dff] animate-pulse" />
            <span>SECTION 04 • EXCLUSIVE PRODUCT SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            BUILD A SIDE HUSTLE BEFORE GRADUATION
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
            The complete step-by-step digital blueprint and resource kit. Instant digital access delivered directly to your email upon payment verification.
          </p>
        </div>

        {/* Product Card Container */}
        <div className="rounded-3xl bg-[#0c0c14] border-2 border-[#6452f6]/40 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Ebook Cover Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group max-w-[280px] sm:max-w-[320px] w-full">
                {/* Glow behind image */}
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition duration-500" />
                
                {/* Product Cover Box */}
                <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black shadow-2xl flex flex-col">
                  <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-auto object-cover max-h-[380px] select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/product_cover.jpg';
                    }}
                  />

                  {/* Cover overlay footer */}
                  <div className="p-4 bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-white/10 text-center">
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                      GENXT OFFICIAL EDITION
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase mt-0.5 line-clamp-1">
                      {name}
                    </h4>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-zinc-400 mt-4 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Digital PDF Delivery</span>
              </span>
            </div>

            {/* Product Details & Purchase Action */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono uppercase mb-3 font-semibold">
                  <span>OFFICIAL DIGITAL RELEASE</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {name}
                </h3>

                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Pricing Display */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-400 block uppercase">Actual Price</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {PRODUCT_CONFIG.currencySymbol}{price}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold ml-1">
                      (One-Time Payment)
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-zinc-400">
                  <span>Zero recurring fees</span><br />
                  <span className="text-zinc-500">Personal use license</span>
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-300 font-bold mb-3">
                  WHAT'S INCLUDED:
                </h4>
                <ul className="space-y-2.5">
                  {whatsIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buy Now Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={onOpenCheckout}
                  className="w-full py-4 sm:py-5 rounded-full text-base font-black uppercase tracking-wider text-white bg-[#6452f6] hover:bg-[#5240eb] shadow-glow hover:shadow-glow-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Buy Now • {PRODUCT_CONFIG.currencySymbol}{price}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Gateway Integration Status Note */}
                <div className="rounded-xl bg-purple-950/20 border border-purple-500/20 p-3 text-[11px] text-zinc-400 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-zinc-200">Payment Gateway Status:</strong> Active UPI Direct Verification (Google Pay, PhonePe, Paytm).
                    Connected to merchant UPI: <code className="text-purple-300">{PRODUCT_CONFIG.upiId}</code>.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
