import React from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { MessageCircle, Mail, ArrowRight, ExternalLink } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-[#07070a] border-b border-white/[0.06] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-mono tracking-[0.25em] text-[#8c7dff] uppercase mb-2">
            SECTION 06
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
            {PRODUCT_CONFIG.brandName}
          </h2>
          <p className="text-sm text-zinc-400">
            Have questions before ordering or need download support? Get in touch with us directly.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <div className="rounded-2xl bg-[#0c0c14] border border-white/[0.08] hover:border-emerald-500/40 p-6 sm:p-8 flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                INSTANT CHAT SUPPORT
              </span>
              <h3 className="text-xl font-bold text-white mb-1">WhatsApp</h3>
              <p className="text-sm text-zinc-300 font-mono mb-4">
                {PRODUCT_CONFIG.whatsappDisplay}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Direct customer assistance for orders, payment verification, and guide questions.
              </p>
            </div>

            <a
              href={PRODUCT_CONFIG.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-glow active:scale-95"
            >
              <span>{PRODUCT_CONFIG.whatsappButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Instagram Card */}
          <div className="rounded-2xl bg-[#0c0c14] border border-white/[0.08] hover:border-purple-500/40 p-6 sm:p-8 flex flex-col justify-between transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-[#8c7dff] flex items-center justify-center mb-4">
                <svg className="w-6 h-6 fill-none stroke-currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-1">
                COMMUNITY & UPDATES
              </span>
              <h3 className="text-xl font-bold text-white mb-1">Official Instagram</h3>
              <p className="text-sm text-purple-300 font-mono mb-4">
                {PRODUCT_CONFIG.instagramHandle}
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Follow our official page for builder breakdowns, creator stories, and side-hustle case studies.
              </p>
            </div>

            <a
              href={PRODUCT_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#141420] hover:bg-[#1a1a2c] border border-purple-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Visit Official Instagram</span>
              <ExternalLink className="w-4 h-4 text-purple-300" />
            </a>
          </div>
        </div>

        {/* Admin Support Email Note */}
        <div className="mt-8 text-center text-xs text-zinc-500 font-mono">
          Official Support & Order Management Email: <span className="text-zinc-300">{PRODUCT_CONFIG.adminEmail}</span>
        </div>
      </div>
    </section>
  );
};
