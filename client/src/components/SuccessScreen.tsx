import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PRODUCT_CONFIG } from '../config/productConfig';
import {
  CheckCircle2,
  Download,
  Mail,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface SuccessScreenProps {
  order: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    utrNumber: string;
    amount: number;
    createdAt: string;
    downloadToken?: string;
    status?: string;
  };
  onClose: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ order, onClose }) => {
  const [copiedId, setCopiedId] = React.useState(false);
  const isPending = order.status === 'PENDING' || !order.downloadToken;

  useEffect(() => {
    // Only fire confetti if payment is confirmed
    if (isPending) return;

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#6452f6', '#8c7dff', '#10b981'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#6452f6', '#ffffff', '#34d399'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#8c7dff', '#705bf7', '#f59e0b'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [isPending]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const downloadLink = order.downloadToken ? `/api/download/${order.downloadToken}` : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className={`relative w-full max-w-xl my-8 rounded-3xl bg-[#0c0c14] border-2 ${isPending ? 'border-amber-500/40' : 'border-emerald-500/40'} p-6 sm:p-10 text-white shadow-2xl text-center`}>
        
        {/* Animated Badge */}
        {isPending ? (
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <ShieldCheck className="w-10 h-10 animate-pulse" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>
        )}

        {isPending ? (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block mb-3">
            PAYMENT SUBMITTED • VERIFICATION IN PROGRESS
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-3">
            PAYMENT VERIFIED & CONFIRMED
          </span>
        )}

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {isPending ? 'Payment Details Recorded!' : `Welcome to ${PRODUCT_CONFIG.brandName}!`}
        </h2>

        {isPending ? (
          /* Pending Verification Explanation Box */
          <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-5 my-6 text-left space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>Verifying With Bank Records</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              We have recorded your 12-digit UTR. Because direct UPI transactions are verified against bank records to ensure the exact amount of <strong>{PRODUCT_CONFIG.currencySymbol}{order.amount}</strong> was received, your digital guide will be automatically dispatched to:
            </p>
            <div className="px-3.5 py-2 rounded-xl bg-[#141420] border border-white/5 font-mono text-sm text-[#8c7dff] font-bold break-all">
              {order.email}
            </div>
            <p className="text-[11px] text-zinc-400">
              ⏱️ Verification usually completes in <strong>5–15 minutes</strong>. If you need priority instant clearance, please message us on WhatsApp with your UTR.
            </p>
          </div>
        ) : (
          /* Confirmed: Email Dispatched Box */
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 my-6 text-left space-y-3">
            <div className="flex items-center gap-3 text-emerald-400">
              <Mail className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-white">
                Product Sent to Your Inbox!
              </h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              We have dispatched the complete digital access link and receipt to:
            </p>
            <div className="px-3.5 py-2 rounded-xl bg-[#141420] border border-white/5 font-mono text-sm text-[#8c7dff] font-bold break-all">
              {order.email}
            </div>
            <p className="text-[11px] text-zinc-400">
              Please check your Inbox (or Promotions/Spam tab if not visible immediately).
            </p>
          </div>
        )}

        {/* Instant Backup Direct Download Button (ONLY when confirmed) */}
        {!isPending && order.downloadToken && (
          <div className="space-y-3 mb-6">
            <a
              href={downloadLink}
              download={PRODUCT_CONFIG.digitalProductFileName}
              className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition-all duration-200 shadow-glow flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-5 h-5" />
              <span>Instant Direct Download ({PRODUCT_CONFIG.digitalProductFileName})</span>
            </a>
            <span className="text-[11px] font-mono text-zinc-400 block">
              ⚡ Instant backup download link enabled for your session
            </span>
          </div>
        )}

        {/* Order Details Receipt Box */}
        <div className="rounded-xl bg-[#08080c] border border-white/5 p-4 text-xs font-mono text-left space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Order ID:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">{order.id}</span>
              <button
                onClick={handleCopyOrderId}
                className="text-zinc-400 hover:text-white p-0.5"
                title="Copy Order ID"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Customer:</span>
            <span className="text-zinc-300">{order.fullName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">12-Digit UTR:</span>
            <span className="text-indigo-300 font-bold">{order.utrNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Amount Paid:</span>
            <span className="text-emerald-400 font-bold">{PRODUCT_CONFIG.currencySymbol}{order.amount}</span>
          </div>
        </div>

        {/* Support & Close Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={`https://wa.me/${PRODUCT_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi! I just purchased ${PRODUCT_CONFIG.productName}. My Order ID is ${order.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-full text-xs font-bold text-zinc-300 bg-[#161622] hover:bg-[#1e1e2d] border border-white/10 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Support</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Close & Back to Site
          </button>
        </div>
      </div>
    </div>
  );
};
