import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { COUPONS, CONTACT_INFO } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: () => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  // Free shipping above 350 or with coupon
  const shippingFee = subtotal >= 350 || appliedCoupon?.code === 'FREESHIP' ? 0 : 60;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const found = COUPONS.find((c) => c.code.toUpperCase() === couponInput.trim().toUpperCase());
    if (!found) {
      setCouponError('รหัสส่วนลดไม่ถูกต้อง');
      return;
    }
    if (subtotal < found.minSpend) {
      setCouponError(`โค้ดนี้ใช้ได้เมื่อซื้อขั้นต่ำ ฿${found.minSpend}`);
      return;
    }
    onApplyCoupon(found);
    setCouponInput('');
  };

  const checkoutToLineDirect = () => {
    if (cart.length === 0) return;
    let message = `สวัสดีครับ สนใจสั่งซื้อด้วงกว่างซางเหนือจาก EUPATORUS:\n\n`;
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.product.name} x ${item.quantity} ตัว = ฿${(item.product.price * item.quantity).toLocaleString()}\n`;
    });
    if (appliedCoupon) {
      message += `\nส่วนลด (${appliedCoupon.code}): -฿${discountAmount.toLocaleString()}`;
    }
    message += `\nค่าจัดส่งด่วน: ${shippingFee === 0 ? 'ฟรี' : '฿' + shippingFee}`;
    message += `\nยอดสุทธิ: ฿${totalAmount.toLocaleString()}`;
    message += `\n\nรบกวนแจ้งเลขบัญชีโอนเงินและยืนยันสต็อกด้วยครับ`;

    const encoded = encodeURIComponent(message);
    window.open(`${CONTACT_INFO.lineUrl}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/40">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-serif text-white">ตะกร้าของคุณ</h2>
              <span className="bg-[#00B900]/15 text-[#00B900] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#00B900]/30">
                {cart.reduce((acc, it) => acc + it.quantity, 0)} รายการ
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Tag className="w-7 h-7" />
                </div>
                <p className="text-zinc-400 text-sm font-light">ยังไม่มีสินค้าในตะกร้า</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-xs font-semibold tracking-wider transition-colors"
                >
                  เลือกชมคอลเลกชัน
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-xl bg-zinc-950 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">{item.product.name}</h4>
                    <p className="text-[#00B900] font-bold text-xs mt-0.5">
                      ฿{item.product.price.toLocaleString()}
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-zinc-700/80 rounded-lg bg-zinc-950 overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs text-white font-mono">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        (สต็อก: {item.product.stock})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-zinc-500 hover:text-red-400 p-2 transition-colors cursor-pointer"
                    title="ลบออกจากตะกร้า"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/70 space-y-4">
              
              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="โค้ดส่วนลด (เช่น EUPATORUS10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white uppercase placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer"
                  >
                    ใช้โค้ด
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-[11px] pl-1">{couponError}</p>}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg mt-1">
                    <span>ใช้โค้ด {appliedCoupon.code} ({appliedCoupon.description})</span>
                    <button
                      type="button"
                      onClick={() => onApplyCoupon(null)}
                      className="text-zinc-400 hover:text-white ml-2"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="text-zinc-200">฿{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>ส่วนลดโปรโมชั่น</span>
                    <span>-฿{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ค่าจัดส่งด่วนคุมอุณหภูมิ</span>
                  <span className={shippingFee === 0 ? 'text-emerald-400 font-medium' : 'text-zinc-200'}>
                    {shippingFee === 0 ? 'ฟรี (โปรโมชั่น)' : `฿${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-2xl text-[#00B900]">฿{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-2 pt-1">
                {/* Online Payment (PromptPay QR / Card) */}
                <button
                  id="checkout-online-btn"
                  onClick={onProceedCheckout}
                  className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ชำระเงินออนไลน์ (พร้อมเพย์ QR / บัตร)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* LINE Direct Checkout */}
                <button
                  id="checkout-line-btn"
                  onClick={checkoutToLineDirect}
                  className="w-full py-3.5 bg-[#00B900] hover:bg-[#009900] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(0,185,0,0.25)] cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.101.254.033.649.015.82-.023.186-.113.681-.223 1.127-.146.593-.728 2.871.353 2.417 1.082-.455 5.834-3.424 7.994-5.918 1.839-2.122 2.768-4.392 2.768-8.646zm-16.14 3.195h-2.162c-.171 0-.311-.139-.311-.311V8.653c0-.171.14-.311.311-.311.172 0 .311.14.311.311v4.223h1.851c.172 0 .311.139.311.311 0 .172-.139.312-.311.312zm3.896-.312c0 .172-.14.312-.312.312-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311.172 0 .312.14.312.311v4.535zm2.716 0c0 .172-.139.312-.311.312h-2.164c-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311h2.164c.172 0 .311.14.311.311 0 .172-.139.311-.311.311h-1.853v1.365h1.853c.172 0 .311.14.311.311 0 .172-.139.312-.311.312h-1.853v1.365h1.853c.172 0 .311.139.311.311zm3.842-2.589l-2.023 2.764c-.066.091-.173.136-.279.136-.089 0-.179-.036-.25-.107-.123-.122-.143-.314-.047-.456l2.008-2.744h-1.742c-.172 0-.312-.14-.312-.311V8.653c0-.171.14-.311.312-.311h2.333c.172 0 .311.14.311.311v4.256z" />
                  </svg>
                  <span>ส่งรายการสั่งซื้อผ่าน LINE</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>รับประกันรอดชีวิต 100% • ตัดสต็อกเรียลไทม์</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
