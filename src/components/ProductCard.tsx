import React from 'react';
import { Product } from '../types';
import { Sparkles, Image as ImageIcon, Check, Eye, Package, ShieldCheck, Settings } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenGallery: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenGallery,
  onOpenDetails,
  onEditProduct,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 2;
  const isMasterpiece = product.badge === 'Masterpiece' || product.isBestSeller;

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group rounded-[2rem] p-4 flex flex-col relative transition-all duration-300 backdrop-blur-md ${
        isMasterpiece
          ? 'bg-zinc-900/90 border border-zinc-500/60 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)] md:-translate-y-4 z-20 hover:border-zinc-400'
          : 'bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-600/80'
      }`}
    >
      {/* Masterpiece Top Pill */}
      {product.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 px-5 py-1.5 bg-white text-black text-[10px] font-extrabold rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.35)] flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{product.badge}</span>
        </div>
      )}

      {/* Scarcity / Stock Badge */}
      <div className="absolute top-7 right-7 z-30 flex flex-col items-end pointer-events-none">
        {isOutOfStock ? (
          <div className="px-3 py-1 bg-zinc-800/90 border border-zinc-700 rounded-full backdrop-blur-md shadow-lg">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              สินค้าหมดชั่วคราว
            </span>
          </div>
        ) : isLowStock ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/40 rounded-full backdrop-blur-md shadow-lg animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
              {product.remainingAlert || `Only ${product.stock} Left`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full backdrop-blur-md shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B900]"></span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              มีของ ({product.stock} ตัว)
            </span>
          </div>
        )}
      </div>

      {/* Image Container with "View 10 Photos" */}
      <div
        onClick={() => onOpenGallery(product)}
        className="w-full aspect-[4/5] bg-zinc-950 rounded-[1.5rem] mb-6 overflow-hidden relative cursor-pointer group/img"
        title="คลิกเพื่อดูแกลเลอรีภาพ 10 มุม"
      >
        {/* Overlay on hover */}
        <div className="absolute inset-0 z-30 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="text-white text-[11px] tracking-[0.2em] uppercase border border-white/30 px-4 py-2 rounded-full backdrop-blur-md bg-black/50 flex items-center gap-2 shadow-2xl">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>View 10 Photos</span>
          </span>
        </div>

        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105 relative z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent opacity-85 pointer-events-none z-20"></div>

        {/* Small photo indicator chip */}
        <div className="absolute bottom-3 left-3 z-30 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-zinc-300 font-mono flex items-center gap-1">
          <Eye className="w-3 h-3 text-emerald-400" />
          <span>10 ภาพมุมมอง</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-3 pb-2 z-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg text-white font-medium group-hover:text-amber-100 transition-colors">
              {product.name}
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">{product.subname}</p>
          </div>

          {/* Price with strikethrough */}
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-red-400/80 line-through mb-[-2px]">
              ฿{product.originalPrice.toLocaleString()}
            </span>
            <span className="text-2xl text-[#00B900] font-bold tracking-tight">
              ฿{product.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4 flex-1 leading-relaxed font-light line-clamp-3">
          {product.description}
        </p>

        {/* Action buttons */}
        <div className="space-y-2 mt-auto">
          <div className="flex gap-1.5">
            <button
              onClick={() => onOpenDetails(product)}
              className="flex-1 py-2 text-[11px] text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1 border border-zinc-800/80 hover:border-zinc-700 rounded-lg cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-zinc-400" />
              <span>อุปกรณ์ & สเปก</span>
            </button>

            {onEditProduct && (
              <button
                onClick={() => onEditProduct(product)}
                className="px-2.5 py-2 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1 border border-zinc-800/80 hover:border-emerald-500/40 rounded-lg cursor-pointer bg-zinc-950/40"
                title="ตั้งค่า / แก้ไขรูปและข้อมูลสินค้านี้"
              >
                <Settings className="w-3 h-3 text-emerald-400" />
                <span>แก้ไขรูป</span>
              </button>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`relative overflow-hidden w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all group/btn cursor-pointer ${
              isOutOfStock
                ? 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800'
                : isMasterpiece
                ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/60'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isOutOfStock ? (
                'สินค้าหมด'
              ) : isMasterpiece ? (
                <>
                  <span>Reserve Masterpiece</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </>
              ) : (
                'Secure Specimen'
              )}
            </span>
            {!isOutOfStock && (
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
