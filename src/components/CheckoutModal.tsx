import React, { useState, useEffect } from 'react';
import { CartItem, Coupon, Order } from '../types';
import { X, QrCode, CreditCard, Upload, CheckCircle2, ShieldCheck, Clock, ArrowRight, Loader2, Copy } from 'lucide-react';
import { CONTACT_INFO } from '../data/products';
import { saveOrderToFirestore, updateProductInFirestore } from '../lib/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  appliedCoupon,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  
  // Customer Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'credit_card' | 'line'>('promptpay');
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Credit Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // PromptPay countdown
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins

  // Created Order
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('info');
      setSlipFile(null);
      setErrorMessage('');
      setCreatedOrder(null);
      return;
    }
    setTimeLeft(900);
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'payment') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  const shippingFee = subtotal >= 350 || appliedCoupon?.code === 'FREESHIP' ? 0 : 60;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('กรุณากรอกข้อมูลชื่อ เบอร์โทร และที่อยู่ให้ครบถ้วน');
      return;
    }
    setErrorMessage('');
    setStep('payment');
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSlipFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        notes,
        paymentMethod,
        items: cart.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          image: it.product.image,
        })),
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        couponCode: appliedCoupon?.code,
        slipImage: slipFile || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
      }

      // Sync with Firebase Cloud Firestore
      try {
        if (data.order) {
          await saveOrderToFirestore(data.order);
        }
        for (const it of cart) {
          const newStock = Math.max(0, it.product.stock - it.quantity);
          await updateProductInFirestore({
            ...it.product,
            stock: newStock,
          });
        }
      } catch (fErr) {
        console.warn('[Firebase] Firestore order sync:', fErr);
      }

      setCreatedOrder(data.order);
      setStep('success');
      onOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PromptPay QR image using high-contrast SVG QR
  const qrData = `PROMPTPAY|0939280599|${totalAmount}|EUPATORUS`;
  const promptPayQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    qrData
  )}&bgcolor=ffffff&color=000000&margin=1`;

  return (
    <div
      id="checkout-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        {step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'info'
                  ? 'bg-white text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              {step === 'info' ? '1' : <CheckCircle2 className="w-4 h-4" />}
            </span>
            <span className="text-xs text-zinc-300 font-medium">ที่อยู่จัดส่ง</span>
          </div>

          <div className="w-8 h-[1px] bg-zinc-800"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'payment'
                  ? 'bg-white text-black'
                  : step === 'success'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {step === 'success' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </span>
            <span
              className={`text-xs font-medium ${
                step === 'payment' || step === 'success' ? 'text-zinc-300' : 'text-zinc-500'
              }`}
            >
              ชำระเงินออนไลน์
            </span>
          </div>

          <div className="w-8 h-[1px] bg-zinc-800"></div>

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 'success' ? 'bg-[#00B900] text-black' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              3
            </span>
            <span
              className={`text-xs font-medium ${
                step === 'success' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
              }`}
            >
              สำเร็จ
            </span>
          </div>
        </div>

        {/* STEP 1: Delivery Information */}
        {step === 'info' && (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif text-white">ข้อมูลการจัดส่งด่วนคุมอุณหภูมิ</h3>
              <p className="text-zinc-400 text-xs mt-1">
                จัดส่งด้วยกล่องระบายอากาศพิเศษ พร้อมรับประกันการรอดชีวิต 100%
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                ชื่อ-นามสกุล ผู้รับ *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น นายสมชาย นักสะสม"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                เบอร์โทรศัพท์ติดต่อ (สำคัญสำหรับขนส่ง) *
              </label>
              <input
                type="tel"
                required
                placeholder="เช่น 081-234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                ที่อยู่จัดส่งอย่างละเอียด *
              </label>
              <textarea
                required
                rows={3}
                placeholder="บ้านเลขที่ หมู่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                หมายเหตุเพิ่มเติม (ถ้ามี)
              </label>
              <input
                type="text"
                placeholder="เช่น ฝากไว้ที่ป้อมยาม, โทรแจ้งก่อนส่ง"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Order Brief */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-400">ยอดชำระสุทธิ ({cart.length} รายการ):</span>
              <span className="text-lg font-bold text-[#00B900]">฿{totalAmount.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <span>ไปที่หน้าชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Online Payment System */}
        {step === 'payment' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-serif text-white">ชำระเงินออนไลน์แบบครบวงจร</h3>
              <p className="text-zinc-400 text-xs mt-1">
                ยอดที่ต้องชำระ: <strong className="text-[#00B900] text-base">฿{totalAmount.toLocaleString()}</strong>
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('promptpay')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'promptpay'
                    ? 'border-[#00B900] bg-[#00B900]/10 text-white shadow-[0_0_15px_rgba(0,185,0,0.15)]'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5 text-[#00B900]" />
                <span className="text-xs font-semibold">พร้อมเพย์ QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-sky-500 bg-sky-500/10 text-white shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-semibold">บัตรเครดิต/เดบิต</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('line')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'line'
                    ? 'border-[#00B900] bg-[#00B900]/10 text-white shadow-[0_0_15px_rgba(0,185,0,0.15)]'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 text-[#00B900]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.101.254.033.649.015.82-.023.186-.113.681-.223 1.127-.146.593-.728 2.871.353 2.417 1.082-.455 5.834-3.424 7.994-5.918 1.839-2.122 2.768-4.392 2.768-8.646zm-16.14 3.195h-2.162c-.171 0-.311-.139-.311-.311V8.653c0-.171.14-.311.311-.311.172 0 .311.14.311.311v4.223h1.851c.172 0 .311.139.311.311 0 .172-.139.312-.311.312zm3.896-.312c0 .172-.14.312-.312.312-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311.172 0 .312.14.312.311v4.535zm2.716 0c0 .172-.139.312-.311.312h-2.164c-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311h2.164c.172 0 .311.14.311.311 0 .172-.139.311-.311.311h-1.853v1.365h1.853c.172 0 .311.14.311.311 0 .172-.139.312-.311.312h-1.853v1.365h1.853c.172 0 .311.139.311.311zm3.842-2.589l-2.023 2.764c-.066.091-.173.136-.279.136-.089 0-.179-.036-.25-.107-.123-.122-.143-.314-.047-.456l2.008-2.744h-1.742c-.172 0-.311-.14-.312-.311V8.653c0-.171.14-.311.312-.311h2.333c.172 0 .311.14.311.311v4.256z" />
                </svg>
                <span className="text-xs font-semibold">ส่งสลิปใน LINE</span>
              </button>
            </div>

            {/* PromptPay View */}
            {paymentMethod === 'promptpay' && (
              <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>QR หมดอายุใน: {formatTime(timeLeft)}</span>
                </div>

                {/* Styled PromptPay Container */}
                <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
                  <div className="bg-[#1A3760] text-white px-4 py-1.5 rounded-md mb-2 font-bold text-xs tracking-wider flex items-center gap-1.5">
                    <span>PROMPTPAY พร้อมเพย์</span>
                  </div>
                  <img
                    src={promptPayQrUrl}
                    alt="PromptPay QR Code"
                    className="w-48 h-48 object-contain"
                  />
                  <span className="text-[10px] text-zinc-500 mt-2 font-mono">
                    สแกนจ่าย: ฿{totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1">
                  <p>ชื่อบัญชี: <strong className="text-white">EUPATORUS (วรัญญู / Art)</strong></p>
                  <p>เบอร์พร้อมเพย์: <span className="text-emerald-400 font-mono font-bold">093-928-0599</span></p>
                </div>

                {/* Slip Upload */}
                <div className="w-full pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-medium text-zinc-300 mb-2">
                    แนบสลิปโอนเงิน (เพื่อตรวจสอบและตัดสต็อกทันที):
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-xl p-4 cursor-pointer bg-zinc-950/60 transition-colors">
                    {slipFile ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>แนบสลิปเรียบร้อยแล้ว</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-400 text-xs">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <span>คลิกเพื่ออัปโหลดสลิปหลักฐานการโอน</span>
                        <span className="text-[10px] text-zinc-600">(JPG, PNG)</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlipUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Credit Card View */}
            {paymentMethod === 'credit_card' && (
              <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">หมายเลขบัตรเครดิต/เดบิต</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-sky-500 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">วันหมดอายุ (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="12/28"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">ชื่อผู้ถือบัตร</label>
                  <input
                    type="text"
                    placeholder="SOMCHAI PRO"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-sky-500 uppercase"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ระบบจำลองการเข้ารหัสความปลอดภัย 256-bit SSL มาตรฐานธนาคาร
                </p>
              </div>
            )}

            {/* LINE Payment View */}
            {paymentMethod === 'line' && (
              <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#00B900]/20 text-[#00B900] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-white font-medium text-sm">สั่งซื้อและส่งหลักฐานใน LINE Official</h4>
                <p className="text-zinc-400 text-xs leading-relaxed max-w-sm mx-auto">
                  ระบบจะบันทึกข้อมูลคำสั่งซื้อและตัดสต็อกในฐานข้อมูลให้ทันที จากนั้นท่านสามารถส่งสลิปยืนยันกับแอดมินผ่าน LINE ID: <strong className="text-white">Art0599</strong>
                </p>
              </div>
            )}

            {/* Back & Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="py-3.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#00B900] hover:bg-[#009900] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_5px_20px_rgba(0,185,0,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึกและตัดสต็อกเรียลไทม์...</span>
                  </>
                ) : (
                  <span>ยืนยันการชำระเงิน & สั่งซื้อ (฿{totalAmount.toLocaleString()})</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Order Success & Live Database Receipt */}
        {step === 'success' && createdOrder && (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#00B900]/20 text-[#00B900] rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,185,0,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[#00B900] text-xs font-bold uppercase tracking-widest block mb-1">
                Order Confirmed • Stock Deducted
              </span>
              <h3 className="text-2xl font-serif text-white">สั่งซื้อสำเร็จเรียบร้อย</h3>
              <p className="text-zinc-400 text-xs mt-1">
                ระบบได้บันทึกคำสั่งซื้อลงฐานข้อมูลเรียลไทม์และหักสต็อกสินค้าเรียบร้อยแล้ว
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">รหัสคำสั่งซื้อ:</span>
                <span className="text-amber-300 font-bold">{createdOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">ผู้รับ:</span>
                <span className="text-zinc-200">{createdOrder.customerName} ({createdOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">วิธีชำระเงิน:</span>
                <span className="text-emerald-400 uppercase">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-800 pt-2 text-sm font-bold">
                <span className="text-white">ยอดชำระทั้งสิ้น:</span>
                <span className="text-[#00B900]">฿{createdOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-300 leading-relaxed">
              📦 เตรียมจัดส่งด่วนคุมอุณหภูมิภายใน 24 ชม. พร้อมประกันการรอดชีวิต 100%
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={CONTACT_INFO.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-[#00B900] hover:bg-[#009900] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <span>แจ้งเลขออเดอร์ใน LINE</span>
              </a>
              <button
                onClick={onClose}
                className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
