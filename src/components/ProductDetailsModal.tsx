import React from 'react';
import { Product } from '../types';
import { X, Check, ShieldCheck, Sparkles, ShoppingBag, Eye } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOpenGallery: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenGallery,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      id="product-details-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Product Header */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="w-full sm:w-40 aspect-square rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 relative">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                onClose();
                onOpenGallery(product);
              }}
              className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 border border-white/20"
            >
              <Eye className="w-3 h-3" />
              10 รูป
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-400 text-xs font-mono uppercase tracking-wider">
                {product.specs.scientificName}
              </span>
              {product.badge && (
                <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">
                  {product.badge}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-serif text-white mb-2">{product.name}</h2>
            <p className="text-zinc-400 text-xs mb-4 leading-relaxed font-light">
              {product.longDescription || product.description}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl text-[#00B900] font-bold">฿{product.price.toLocaleString()}</span>
              <span className="text-xs text-red-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
              <span className="text-xs text-zinc-400 ml-auto font-medium">
                คงเหลือในสต็อก: <strong className="text-white">{product.stock} ตัว</strong>
              </span>
            </div>
          </div>
        </div>

        {/* In-Box Items */}
        <div className="mb-6 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>อุปกรณ์และสิ่งที่จะได้รับในเซ็ต:</span>
          </h3>
          <ul className="space-y-2 text-xs text-zinc-300">
            {product.inBoxIncludes.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#00B900] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Biological Specifications Table */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">ข้อมูลสเปกทางชีววิทยา:</h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">ชื่อไทย</span>
              <span className="text-zinc-200 font-medium">{product.specs.thaiName}</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">ขนาดตัว</span>
              <span className="text-amber-200 font-medium">{product.specs.size}</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">จำนวนเขา</span>
              <span className="text-zinc-200 font-medium">{product.specs.hornCount} แฉก</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">อุณหภูมิที่เหมาะสม</span>
              <span className="text-emerald-300 font-medium">{product.specs.temperature}</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">อาหารหลัก</span>
              <span className="text-zinc-200 font-medium">{product.specs.diet}</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
              <span className="text-zinc-500 block mb-0.5">ถิ่นกำเนิด</span>
              <span className="text-zinc-200 font-medium">{product.specs.origin}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenGallery(product);
            }}
            className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            ดูภาพ 10 มุมมอง
          </button>
          <button
            onClick={() => {
              onAddToCart(product);
              onClose();
            }}
            disabled={product.stock <= 0}
            className="flex-1 py-3.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{product.stock <= 0 ? 'สินค้าหมด' : 'ใส่ตะกร้าทันที'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
