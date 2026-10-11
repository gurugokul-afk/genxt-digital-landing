import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { PRODUCT_CONFIG } from '../config/productConfig';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#0c0c14] border border-white/10 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#10101a]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8c7dff]" />
            <h3 className="text-lg font-bold text-white">
              {isTerms ? 'Terms of Use' : 'Privacy Policy'} — {PRODUCT_CONFIG.brandShort}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-zinc-300 max-h-[70vh] overflow-y-auto leading-relaxed">
          {isTerms ? (
            <>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                <strong>Important Legal Notice:</strong><br />
                {PRODUCT_CONFIG.copyrightNotice}<br />
                {PRODUCT_CONFIG.importantNoticeText}
              </div>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">1. Personal License & Restrictions</h4>
              <p>
                Upon payment confirmation, GENXT grants you a single, non-transferable, non-exclusive license to access and read the digital guide "{PRODUCT_CONFIG.productName}" for your own personal educational use.
              </p>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">2. Prohibited Use</h4>
              <p>
                You may not: (a) re-sell, distribute, sub-license, rent, or lease the guide; (b) share digital download files or access links publicly or with third parties; (c) create derivative works for public redistribution without written authorization from GENXT.
              </p>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">3. Digital Delivery & Verification</h4>
              <p>
                Access to the guide is delivered via digital download link sent to your submitted email address upon UPI reference verification. Due to the immediate digital nature of the asset, all sales are final once delivered.
              </p>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">4. Support & Contact</h4>
              <p>
                If you encounter any issues accessing your files, contact our team directly via WhatsApp at {PRODUCT_CONFIG.whatsappDisplay} or email us at {PRODUCT_CONFIG.adminEmail}.
              </p>
            </>
          ) : (
            <>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">1. Information We Collect</h4>
              <p>
                When you purchase the guide, we collect your Full Name, Email Address, and optional WhatsApp number strictly for the purpose of order fulfillment, payment verification (UTR), and delivering your digital asset.
              </p>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">2. How We Use Your Data</h4>
              <p>
                Your contact details are used solely to send your purchase receipt, digital download credentials, and critical product updates. We do not sell, rent, or trade your personal information to any third parties.
              </p>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">3. Payment Security</h4>
              <p>
                Payment is processed peer-to-peer via official UPI protocols (Google Pay, PhonePe, Paytm, BHIM). We do not store your bank account passwords, UPI PIN, or card details.
              </p>

              <h4 className="text-white font-bold text-sm uppercase tracking-wider pt-2">4. Contact & Inquiries</h4>
              <p>
                For questions regarding your data privacy, reach out to {PRODUCT_CONFIG.adminEmail} or WhatsApp {PRODUCT_CONFIG.whatsappDisplay}.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] flex justify-end bg-[#0a0a10]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#6452f6] hover:bg-[#5240eb] shadow-glow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
