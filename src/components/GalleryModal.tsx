import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, ChevronLeft, ChevronRight, ShoppingBag, Eye, ShieldCheck, Sparkles } from 'lucide-react';

interface GalleryModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const ANGLE_LABELS = [
  'มุมมองด้านหน้า (Front View): เขา 5 แฉกเด่นสง่า',
  'มุมมองด้านบน (Dorsal View): ปีกสีทองอำพันสุกปลั่ง',
  'มุมมองเอียง 45 องศา (Isometric View): มิติความโค้งของเขา',
  'มุมโคลสอัพเขาหน้าผาก (Cephalic Horn Detail): โค้งงอนดุจคันศร',
  'มุมเขาอก 4 ทิศ (Thoracic Horns): แหลมคมประดุจมงกุฎ',
  'วัดขนาดด้วยเวอร์เนียร์คาลิปเปอร์ (Measurement): ไซส์ตรงปก 100%',
  'ใต้ท้องและข้อต่อขา (Ventral View & Spiny Legs): แข็งแรง ไร้ตำหนิ',
  'บรรจุภัณฑ์กล่องอะคริลิคโชว์ (Display Case): พร้อมตั้งโชว์',
  'ชุดของขวัญผูกโบว์สีทอง (Luxury Gift Packaging): หรูหราล้ำค่า',
  'ใบรับรองสายพันธุ์ & Live Arrival (Certificate of Authenticity)'
];

export const GalleryModal: React.FC<GalleryModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, product, activeIndex]);

  if (!isOpen || !product) return null;

  const images = product.galleryImages || [product.image];

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      id="gallery-modal"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between animate-in fade-in duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/70">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-white font-serif text-lg tracking-wide flex items-center gap-2">
              <span>{product.name}</span>
              <span className="text-zinc-500 font-sans text-xs">({product.subname})</span>
            </h2>
            <p className="text-emerald-400 text-xs font-mono mt-0.5">
              {ANGLE_LABELS[activeIndex] || `รูปมุมมองที่ ${activeIndex + 1}`}
            </p>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-[#00B900]/15 text-[#00B900] text-[10px] rounded-full font-bold uppercase tracking-widest border border-[#00B900]/30 ml-2">
            10 Photos Gallery
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            disabled={product.stock <= 0}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-full transition-all cursor-pointer shadow-[0_0_15px_rgba(0,185,0,0.3)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>สั่งซื้อ ฿{product.price.toLocaleString()}</span>
          </button>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="ปิดแกลเลอรี"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden group/stage">
        <img
          id="gallery-main-img"
          src={images[activeIndex]}
          alt={`${product.name} angle ${activeIndex + 1}`}
          referrerPolicy="no-referrer"
          className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-2xl transition-opacity duration-300"
        />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 sm:left-8 text-white/70 hover:text-white p-3 sm:p-4 bg-black/40 hover:bg-black/75 border border-white/10 rounded-full backdrop-blur-md transition-all hover:scale-110 cursor-pointer"
          aria-label="รูปก่อนหน้า"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-4 sm:right-8 text-white/70 hover:text-white p-3 sm:p-4 bg-black/40 hover:bg-black/75 border border-white/10 rounded-full backdrop-blur-md transition-all hover:scale-110 cursor-pointer"
          aria-label="รูปถัดไป"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Floating Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-xs text-zinc-300 font-mono">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* 10-Thumbnail Strip */}
      <div className="h-28 sm:h-32 border-t border-zinc-800/80 bg-zinc-950 flex items-center px-4 sm:px-6 overflow-x-auto">
        <div className="flex gap-2.5 sm:gap-3 mx-auto py-2">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-[#00B900] opacity-100 scale-105 shadow-[0_0_15px_rgba(0,185,0,0.35)]'
                    : 'border-transparent opacity-40 hover:opacity-90 hover:scale-95'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover bg-zinc-900"
                />
                <div className="absolute bottom-0 right-0 bg-black/70 px-1.5 py-0.5 text-[9px] text-white font-mono backdrop-blur-sm rounded-tl-md">
                  {idx + 1}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
