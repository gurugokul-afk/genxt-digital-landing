import React, { useState, useEffect } from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { UtrHelperModal } from './UtrHelperModal';
import {
  X,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Loader2,
  Mail,
  User,
  Phone
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderData: any) => void;
  product?: {
    id?: string;
    name?: string;
    price?: number;
    description?: string;
    coverImage?: string;
  } | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
  const productName = product?.name || PRODUCT_CONFIG.productName;
  const price = product?.price !== undefined ? product.price : PRODUCT_CONFIG.actualPrice;

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  
  // Validation and UI states
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUtrHelper, setShowUtrHelper] = useState(false);

  // Dynamic payment config state
  const [paymentConfig, setPaymentConfig] = useState({
    qrImageUrl: PRODUCT_CONFIG.paymentQrImage || '/images/payment_qr.jpg',
    merchantName: PRODUCT_CONFIG.merchantName,
    upiId: PRODUCT_CONFIG.upiId,
    upiUri: PRODUCT_CONFIG.upiUri,
    razorpayEnabled: false,
    razorpayKeyId: '',
  });

  useEffect(() => {
    fetch('/api/payment-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPaymentConfig({
            qrImageUrl: data.qrImageUrl || PRODUCT_CONFIG.paymentQrImage || '/images/payment_qr.jpg',
            merchantName: data.payeeName || PRODUCT_CONFIG.merchantName,
            upiId: data.upiId || PRODUCT_CONFIG.upiId,
            upiUri: data.upiUri || PRODUCT_CONFIG.upiUri,
            razorpayEnabled: Boolean(data.razorpayEnabled),
            razorpayKeyId: data.razorpayKeyId || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  // Strict email validation regex
  const validateEmail = (val: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(val.trim());
  };

  // UPI payment intent URI
  const effectiveUpiUri = paymentConfig.upiUri || `upi://pay?pa=${encodeURIComponent(paymentConfig.upiId)}&pn=${encodeURIComponent(
    paymentConfig.merchantName
  )}&am=${encodeURIComponent(price.toString())}&cu=INR&tn=${encodeURIComponent(
    PRODUCT_CONFIG.paymentNote
  )}`;

  // Handle Pay via Razorpay (Instant Automated Verification)
  const handlePayWithRazorpay = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Razorpay order on backend
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          productTitle: productName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to initiate payment gateway.');
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: PRODUCT_CONFIG.brandName,
        description: productName,
        image: '/images/product_cover.jpg',
        order_id: data.orderId,
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        theme: {
          color: '#6452f6',
        },
        handler: async (response: any) => {
          setIsSubmitting(true);
          try {
            // 3. Cryptographically verify signature on backend
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                amount: price,
                productTitle: productName,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              onSuccess(verifyData.order);
            } else {
              alert(verifyData.message || 'Payment verification failed. Please contact support.');
            }
          } catch (err: any) {
            alert('Error verifying payment: ' + err.message);
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        alert('Payment failed: ' + (resp.error?.description || 'Transaction declined'));
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Could not connect to payment gateway.');
      setIsSubmitting(false);
    }
  };

  // Step 1 Validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!fullName.trim() || fullName.trim().length < 2) {
      setNameError('Please enter your full name (minimum 2 characters)');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid, active email address for digital delivery');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!hasError) {
      if (paymentConfig.razorpayEnabled && (window as any).Razorpay) {
        handlePayWithRazorpay();
      } else {
        setStep(2);
      }
    }
  };

  // Step 2 Final Submission
  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');

    // Strictly validate 12-digit UTR
    if (!/^\d{12}$/.test(cleanUtr)) {
      setUtrError('UPI Reference / UTR Number must be exactly 12 numeric digits');
      return;
    }
    setUtrError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders/verify-and-deliver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          utrNumber: cleanUtr,
          amount: price,
          productTitle: productName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment verification failed. Please check your UTR number.');
      }

      // Success callback
      onSuccess(data.order);
    } catch (err: any) {
      setUtrError(err.message || 'Something went wrong while verifying. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-xl my-8 rounded-3xl bg-[#0c0c14] border border-white/10 shadow-2xl text-white overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#10101a]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#8c7dff] uppercase font-bold">
                  STEP {step} OF 2
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">Personal License Access</span>
              </div>
              <h3 className="text-xl font-black text-white mt-0.5">
                {step === 1 ? 'Customer Information' : 'Scan & Pay via UPI'}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="grid grid-cols-2 bg-black/30 text-xs font-mono text-center">
            <div
              className={`py-2.5 border-b-2 flex items-center justify-center gap-2 ${
                step === 1
                  ? 'border-[#6452f6] text-white font-bold bg-[#6452f6]/10'
                  : 'border-emerald-500/80 text-emerald-400 bg-transparent'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center bg-white/10 text-[10px]">
                {step > 1 ? '✓' : '1'}
              </span>
              <span>1. Your Details</span>
            </div>

            <div
              className={`py-2.5 border-b-2 flex items-center justify-center gap-2 ${
                step === 2
                  ? 'border-[#6452f6] text-white font-bold bg-[#6452f6]/10'
                  : 'border-transparent text-zinc-500'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center bg-white/10 text-[10px]">
                2
              </span>
              <span>2. UPI Payment</span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8">
            {step === 1 ? (
              /* ================= STEP 1: CUSTOMER DETAILS ================= */
              <form onSubmit={handleProceedToPayment} className="space-y-5">
                {/* Product Summary Mini Card */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{productName}</h4>
                    <span className="text-xs text-purple-400 font-mono">
                      Personal Use License
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 font-mono block">Price</span>
                    <span className="text-xl font-black text-white">
                      {PRODUCT_CONFIG.currencySymbol}{price}
                    </span>
                  </div>
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#14141f] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#6452f6] focus:ring-1 focus:ring-[#6452f6] text-sm"
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Email Address Field (Strictly Validated) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#8c7dff]">
                      Strictly Validated For Delivery
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#14141f] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#6452f6] focus:ring-1 focus:ring-[#6452f6] text-sm"
                    />
                  </div>
                  {emailError ? (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {emailError}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-zinc-400">
                      📦 The digital guide and purchase receipt will be delivered immediately to this email.
                    </p>
                  )}
                </div>

                {/* WhatsApp / Phone Number Field (Optional) */}
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">
                    WhatsApp Number <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9789734732"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#14141f] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#6452f6] focus:ring-1 focus:ring-[#6452f6] text-sm"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-500">
                    Used only for priority customer support if needed.
                  </p>
                </div>

                {/* Step 1 Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white bg-[#6452f6] hover:bg-[#5240eb] shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Secure Gateway...</span>
                      </>
                    ) : paymentConfig.razorpayEnabled ? (
                      <>
                        <span>Pay via Razorpay ({PRODUCT_CONFIG.currencySymbol}{price})</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        <span>Proceed to UPI Payment ({PRODUCT_CONFIG.currencySymbol}{price})</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  {paymentConfig.razorpayEnabled && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-[11px] font-mono text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Instant 1-Click Delivery • GPay, PhonePe, Cards, UPI</span>
                    </div>
                  )}
                </div>
              </form>
            ) : (
              /* ================= STEP 2: UPI PAYMENT & SCANNER ================= */
              <form onSubmit={handleVerifyPayment} className="space-y-6">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Details ({email})</span>
                </button>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#08080d] border border-white/10 relative">
                  <div className="flex items-center justify-between w-full mb-3 text-xs font-mono">
                    <span className="text-zinc-400 font-semibold">MERCHANT: {paymentConfig.merchantName}</span>
                    <span className="text-emerald-400 font-bold">AMOUNT: {PRODUCT_CONFIG.currencySymbol}{price}</span>
                  </div>

                  {/* Real QR Code Image Display */}
                  <div className="p-3 rounded-2xl bg-white shadow-2xl relative flex items-center justify-center">
                    <img
                      src={paymentConfig.qrImageUrl}
                      alt="Official Payment QR Code"
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                  </div>

                  {/* UPI Apps supported tag */}
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Smartphone className="w-4 h-4 text-[#8c7dff]" />
                    <span>Scan with Google Pay, PhonePe, Paytm, or any UPI App</span>
                  </div>

                  {/* Mobile Direct Pay Button */}
                  <div className="w-full mt-4">
                    <a
                      href={effectiveUpiUri}
                      className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pay via UPI App (GPay / PhonePe / Paytm)</span>
                    </a>
                  </div>
                </div>

                {/* 3 Step Instructions */}
                <div className="rounded-xl bg-[#111119] border border-white/5 p-4 space-y-2 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#6452f6]/30 text-[#8c7dff] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Scan the QR code and pay {PRODUCT_CONFIG.currencySymbol}{price}.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#6452f6]/30 text-[#8c7dff] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Note down the 12-digit UPI Reference / UTR Number from your payment app.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#6452f6]/30 text-[#8c7dff] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Enter the 12-digit number below to verify and receive instant download access.</span>
                  </div>
                </div>

                {/* 12-digit UTR Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider">
                      12-Digit UPI Ref / UTR Number <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUtrHelper(true)}
                      className="text-xs text-[#8c7dff] hover:underline flex items-center gap-1 font-medium"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Where to find UTR?</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      required
                      value={utrNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setUtrNumber(val);
                        if (utrError) setUtrError('');
                      }}
                      placeholder="e.g. 428938192841 (12 digits)"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#14141f] border border-white/10 text-white font-mono text-base placeholder-zinc-500 focus:outline-none focus:border-[#6452f6] focus:ring-1 focus:ring-[#6452f6] tracking-widest text-center"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
                      {utrNumber.length}/12
                    </div>
                  </div>

                  {utrError && (
                    <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {utrError}
                    </p>
                  )}
                </div>

                {/* Final Verify and Claim Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || utrNumber.length !== 12}
                  className={`w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white shadow-glow transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSubmitting || utrNumber.length !== 12
                      ? 'bg-zinc-700/50 cursor-not-allowed opacity-60'
                      : 'bg-[#6452f6] hover:bg-[#5240eb] active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying Payment & Delivering Guide...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Verify Payment & Get Guide</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* UTR helper modal */}
      <UtrHelperModal isOpen={showUtrHelper} onClose={() => setShowUtrHelper(false)} />
    </>
  );
};
