import React from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';

interface ImportantNoticeProps {
  onOpenLegal: (type: 'terms' | 'privacy') => void;
}

export const ImportantNotice: React.FC<ImportantNoticeProps> = ({ onOpenLegal }) => {
  return (
    <section className="py-16 bg-[#050508] border-b border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0c0c12] border border-white/[0.08] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-[#8c7dff] shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-[#8c7dff] uppercase font-bold">
                IMPORTANT NOTICE
              </span>

              <p className="text-xs font-mono text-zinc-400 font-semibold">
                {PRODUCT_CONFIG.copyrightNotice}
              </p>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {PRODUCT_CONFIG.importantNoticeText}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-400 hover:text-purple-300 underline underline-offset-4 font-semibold"
                >
                  <span>Read Full Terms of Use</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
