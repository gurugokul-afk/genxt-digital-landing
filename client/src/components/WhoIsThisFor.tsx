import React from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { GraduationCap, Video, Briefcase, Sparkles, Check } from 'lucide-react';

export const WhoIsThisFor: React.FC = () => {
  const icons = [GraduationCap, Video, Briefcase, Sparkles];

  return (
    <section id="who" className="py-20 bg-[#050508] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center sm:text-left mb-12">
          <p className="text-xs font-mono tracking-[0.25em] text-[#8c7dff] uppercase mb-2">
            SECTION 03
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Who Is This For?
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            If you fall into any of these categories, this guide is crafted specifically for you.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCT_CONFIG.whoIsThisFor.map((item, idx) => {
            const Icon = icons[idx] || Sparkles;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0c0c12] border border-white/[0.08] hover:border-purple-500/40 p-6 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#8c7dff] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <span>{item.title}</span>
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ideal Fit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
