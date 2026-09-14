import React from 'react';
import { ShoppingBag, Share2, Shield, Phone, Sparkles } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenShare: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  isAdmin,
  onToggleAdmin,
  onOpenShare,
}) => {
  return (
    <nav
      id="main-navbar"
      className="fixed top-0 w-full z-40 bg-[#09090b]/85 backdrop-blur-xl border-b border-zinc-800/60 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <span className="text-xl sm:text-2xl tracking-[0.25em] font-serif font-light text-white group-hover:text-emerald-400 transition-colors">
            EUPATORUS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B900] shadow-[0_0_8px_#00B900]"></span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-400">
          <a href="#story" className="hover:text-white transition-colors">
            ประวัติ & สตอรี่
          </a>
          <a href="#species" className="hover:text-white transition-colors">
            ข้อมูลสายพันธุ์
          </a>
          <a href="#shop" className="hover:text-white transition-colors text-emerald-400 font-medium">
            คอลเลกชันด้วง
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            คำถามที่พบบ่อย
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Button (For sharing with customers) */}
          <button
            id="nav-share-btn"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900/60 text-xs font-medium transition-all"
            title="แชร์เว็บบอร์ดให้ลูกค้าดู"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">แชร์เว็บ</span>
          </button>

          {/* Admin Toggle */}
          <button
            id="nav-admin-btn"
            onClick={onToggleAdmin}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
              isAdmin
                ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(0,185,0,0.2)]'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 bg-zinc-900/40'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{isAdmin ? 'โหมดจัดการสต็อก' : 'Admin'}</span>
          </button>

          {/* Cart Icon */}
          <button
            id="nav-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-all group"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingBag className="w-5 h-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
            {cartCount > 0 && (
              <span
                id="cart-badge-count"
                className="absolute -top-1 -right-1 bg-[#00B900] text-black font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_#00B900] animate-bounce"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
