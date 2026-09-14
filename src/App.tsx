import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Coupon, Order } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { testFirestoreConnection, seedFirestoreIfEmpty, subscribeToProducts } from './lib/firebase';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustBar } from './components/TrustBar';
import { StorySection } from './components/StorySection';
import { ProductCard } from './components/ProductCard';
import { GalleryModal } from './components/GalleryModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminModal } from './components/AdminModal';
import { ShareModal } from './components/ShareModal';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { FloatingSpeedDial } from './components/FloatingSpeedDial';
import { Sparkles, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('eupatorus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialProductId, setAdminInitialProductId] = useState<string | undefined>(undefined);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('eupatorus_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Firebase Firestore Connection & Real-time Synchronization
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    async function initFirebase() {
      try {
        const isOnline = await testFirestoreConnection();
        setIsFirebaseConnected(isOnline);
        if (isOnline) {
          // Seed Firestore if empty or retrieve cloud catalog
          await seedFirestoreIfEmpty();

          // Listen to real-time changes directly from Firestore
          unsubscribe = subscribeToProducts((liveProducts) => {
            if (liveProducts && liveProducts.length > 0) {
              setProducts(liveProducts);
            }
          });
        }
      } catch (err) {
        console.warn('[Firebase] Initialization notice:', err);
      }
    }

    initFirebase();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch real-time products & stock from Server fallback
  const fetchServerProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts((prev) =>
          prev.map((p) => {
            const serverProd = data.products.find((sp: any) => sp.id === p.id);
            if (!serverProd) return p;
            return {
              ...p,
              stock: serverProd.stock,
              price: serverProd.price ?? p.price,
              originalPrice: serverProd.originalPrice ?? p.originalPrice,
              remainingAlert: serverProd.remainingAlert ?? p.remainingAlert,
            };
          })
        );
      }
    } catch (err) {
      // Offline fallback: keep current state
      console.log('Real-time stock server offline, operating in resilient local mode');
    }
  }, []);

  useEffect(() => {
    fetchServerProducts();
    // Poll real-time stock every 15 seconds to ensure 100% database accuracy
    const interval = setInterval(fetchServerProducts, 15000);
    return () => clearInterval(interval);
  }, [fetchServerProducts]);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`ขออภัย ${product.name} สินค้าหมดชั่วคราว`, 'info');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`คุณเลือก ${product.name} เต็มจำนวนสต็อกที่มีแล้ว (${product.stock} ตัว)`, 'info');
          return prev;
        }
        showToast(`เพิ่มจำนวน ${product.name} ในตะกร้าแล้ว`);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        showToast(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            showToast(`สต็อกสูงสุดที่มีคือ ${item.product.stock} ตัว`, 'info');
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('ลบรายการออกจากตะกร้าแล้ว', 'info');
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // Clear cart on successful order
    setCart([]);
    setAppliedCoupon(null);
    showToast(`ยืนยันออเดอร์ ${order.id} เรียบร้อยแล้ว! ตัดสต็อกอัตโนมัติ`);
    fetchServerProducts();
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-zinc-700 selection:text-white relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl">
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#00B900] flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdminOpen}
        onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)}
        onOpenShare={() => setIsShareOpen(true)}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Hero Section (Cinematic Full-Screen 100% based on reference) */}
      <HeroSection
        products={products}
        onScrollToShop={() => scrollToSection('shop')}
        onScrollToStory={() => scrollToSection('story')}
      />

      {/* Trust Bar */}
      <TrustBar />

      {/* Story & Species Biological Presentation */}
      <StorySection />

      {/* Shop Section: The Collection */}
      <section id="shop" className="py-28 sm:py-36 relative bg-zinc-950/40 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif text-white mb-3">
              The Collection
            </h2>
            <p className="text-[#00B900] tracking-[0.25em] uppercase text-xs font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reserve Your Specimen • คัดสรรสายเลือดแท้</span>
              <Sparkles className="w-3.5 h-3.5" />
            </p>
            <div className="w-12 h-[2px] bg-emerald-500 mx-auto mt-4"></div>
          </div>

          {/* Product Cards Grid: Set 1, Set 2, Set 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onOpenGallery={(p) => setGalleryProduct(p)}
                onOpenDetails={(p) => setDetailsProduct(p)}
                onEditProduct={(p) => {
                  setAdminInitialProductId(p.id);
                  setIsAdminOpen(true);
                }}
              />
            ))}
          </div>

          {/* Live stock reassurance card */}
          <div className="mt-16 p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 max-w-2xl mx-auto text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-white text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00B900] animate-pulse"></span>
                <span>ระบบตัดสต็อกเรียลไทม์ (Live Inventory Sync)</span>
              </h4>
              <p className="text-zinc-400 text-xs mt-0.5 font-light">
                จำนวนที่แสดงเชื่อมต่อกับฐานข้อมูลคลังโดยตรง มั่นใจได้ตัวที่สั่งซื้อ 100%
              </p>
            </div>
            <button
              onClick={fetchServerProducts}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>เช็คสต็อกสด</span>
            </button>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />

      {/* Floating Speed Dial (Phone, FB, IG, LINE) */}
      <FloatingSpeedDial />

      {/* Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={handleProceedCheckout}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(c) => setAppliedCoupon(c)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      <GalleryModal
        product={galleryProduct}
        isOpen={galleryProduct !== null}
        onClose={() => setGalleryProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <ProductDetailsModal
        product={detailsProduct}
        isOpen={detailsProduct !== null}
        onClose={() => setDetailsProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenGallery={(p) => setGalleryProduct(p)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setAdminInitialProductId(undefined);
        }}
        products={products}
        onRefreshProducts={fetchServerProducts}
        initialProductId={adminInitialProductId}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

    </div>
  );
}
