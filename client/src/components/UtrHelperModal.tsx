import React from 'react';
import { X, HelpCircle, CheckCircle2 } from 'lucide-react';

interface UtrHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UtrHelperModal: React.FC<UtrHelperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e0e16] border border-[#6452f6]/40 p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#8c7dff]" />
            <h3 className="text-lg font-bold">Where to find 12-Digit UTR Number?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <h4 className="font-bold text-white flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Google Pay (GPay)
            </h4>
            <p className="text-zinc-400">
              Open the transaction detail in GPay. Look for <span className="text-[#8c7dff] font-mono font-bold">"UPI transaction ID"</span> at the bottom. It is a 12-digit number (e.g., 428948192841).
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <h4 className="font-bold text-white flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              PhonePe
            </h4>
            <p className="text-zinc-400">
              Tap on "Payment Details" of the successful transaction. Look for <span className="text-[#8c7dff] font-mono font-bold">"UTR"</span>. It contains exactly 12 digits.
            </p>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <h4 className="font-bold text-white flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Paytm / BHIM
            </h4>
            <p className="text-zinc-400">
              Check the payment passbook receipt. Look for <span className="text-[#8c7dff] font-mono font-bold">"UPI Ref No."</span> or <span className="text-[#8c7dff] font-mono font-bold">"Ref No."</span> (12 digits).
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#6452f6] hover:bg-[#5240eb] shadow-glow"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    </div>
  );
};
