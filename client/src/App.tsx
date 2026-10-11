import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MainHero } from './components/MainHero';
import { WhatYouWillLearn } from './components/WhatYouWillLearn';
import { WhoIsThisFor } from './components/WhoIsThisFor';
import { ProductSection } from './components/ProductSection';
import { ImportantNotice } from './components/ImportantNotice';
import { ContactSection } from './components/ContactSection';
import { FooterSection } from './components/FooterSection';
import { CheckoutModal } from './components/CheckoutModal';
import { SuccessScreen } from './components/SuccessScreen';
import { AdminDrawer } from './components/AdminDrawer';
import { LegalModal } from './components/LegalModal';
import { PRODUCT_CONFIG } from './config/productConfig';
import { ArrowRight, BookOpen } from 'lucide-react';

export function App() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);

  // Fetch currently active product from SQLite backend
  const fetchActiveProduct = async () => {
    try {
      const res = await fetch('/api/products/active');
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setActiveProduct(data.product);
        }
      }
    } catch (err) {
      console.log('Using default product config fallback');
    }
  };

  useEffect(() => {
    fetchActiveProduct();
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setIsAdminOpen(true);
    }
  }, []);

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleOrderSuccess = (orderData: any) => {
    setIsCheckoutOpen(false);
    setCompletedOrder(orderData);
  };

  const currentPrice = activeProduct?.price !== undefined ? activeProduct.price : PRODUCT_CONFIG.actualPrice;

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-[#6452f6]/30 selection:text-white relative">
      {/* Fixed Navbar */}
      <Navbar
        onOpenCheckout={handleOpenCheckout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      {/* Main Single-Page Sections (Matching Customer Requirements 1 to 7) */}
      <main>
        {/* 1. Main section: BUILD A SIDE HUSTLE BEFORE GRADUATION */}
        <MainHero onOpenCheckout={handleOpenCheckout} />

        {/* 2. What you'll learn */}
        <WhatYouWillLearn />

        {/* 3. Who is this for? */}
        <WhoIsThisFor />

        {/* 4. Product section: Dynamic cover, Actual price, What's included, Buy Now button */}
        <ProductSection
          onOpenCheckout={handleOpenCheckout}
          product={activeProduct}
        />

        {/* 5. Important notice & Terms of Use */}
        <ImportantNotice onOpenLegal={(type) => setLegalModalType(type)} />

        {/* 6. Contact section: Instagram & WhatsApp */}
        <ContactSection />
      </main>

      {/* 7. Footer */}
      <FooterSection
        onOpenLegal={(type) => setLegalModalType(type)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Checkout Modal (Real UPI QR Scanner & 12-digit UTR Verification) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        onSuccess={handleOrderSuccess}
      />

      {/* Order Success Screen (Confetti Fireworks & Backup Direct Download) */}
      {completedOrder && (
        <SuccessScreen
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* Admin Leads & Products CRUD Drawer */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductChanged={fetchActiveProduct}
      />

      {/* Terms of Use & Privacy Policy Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
        <button
          onClick={handleOpenCheckout}
          className="w-full py-4 px-6 rounded-full font-black text-sm uppercase tracking-wider text-white bg-[#6452f6] shadow-glow flex items-center justify-between active:scale-95"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span>{PRODUCT_CONFIG.heroButtonText}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span>{PRODUCT_CONFIG.currencySymbol}{currentPrice}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}

export default App;
