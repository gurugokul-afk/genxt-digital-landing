import React from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { Lightbulb, Target, BookOpen, Rocket, ShoppingCart } from 'lucide-react';

export const WhatYouWillLearn: React.FC = () => {
  const icons = [Lightbulb, Target, BookOpen, Rocket, ShoppingCart];

  const subDescriptions = [
    "Discover untapped problems and validate practical ideas that fit your college schedule.",
    "Define who needs your solution and understands the real value you provide.",
    "Understand high-leverage digital assets, guides, and templates with zero production cost.",
    "Structure an actionable launch timeline without feeling overwhelmed before exams.",
    "Master the core principles of online positioning, checkout simplicity, and customer trust."
  ];

  return (
    <section id="learn" className="py-20 bg-[#07070a] border-t border-b border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center sm:text-left mb-12">
          <p className="text-xs font-mono tracking-[0.25em] text-[#8c7dff] uppercase mb-2">
            SECTION 02
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            What You'll Learn
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Actionable foundations designed specifically for student builders and ambitious creators.
          </p>
        </div>

        {/* 5 Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCT_CONFIG.whatYouWillLearn.map((item, idx) => {
            const Icon = icons[idx] || Lightbulb;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0c0c11] border border-white/[0.08] hover:border-[#6452f6]/40 p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-glow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#8c7dff]">
                      0{idx + 1}
                    </span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-[#8c7dff]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {item}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {subDescriptions[idx]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
