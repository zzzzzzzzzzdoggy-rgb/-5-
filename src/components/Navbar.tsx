import React from 'react';
import { ShoppingBag, Share2, Settings, Phone, Sparkles, Eye } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenShare: () => void;
  isFirebaseConnected?: boolean;
  visitorCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  isAdmin,
  onToggleAdmin,
  onOpenShare,
  isFirebaseConnected = false,
  visitorCount,
}) => {
  return (
    <nav
      id="main-navbar"
      className="fixed top-0 w-full z-40 bg-[#09090b]/85 backdrop-blur-xl border-b border-zinc-800/60 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo & Corner Visitor Counter */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          <a
            href="#"
            className="flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <span className="text-lg sm:text-2xl tracking-[0.2em] sm:tracking-[0.25em] font-serif font-light text-white group-hover:text-emerald-400 transition-colors">
              EUPATORUS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B900] shadow-[0_0_8px_#00B900]"></span>
          </a>

          {/* Corner Visitor Counter Badge (Starts at 200, next is 201...) */}
          {typeof visitorCount === 'number' && (
            <div
              id="corner-visitor-badge"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/35 text-emerald-300 text-[11px] sm:text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              title={`สถิติผู้เข้าชม: ${visitorCount} ครั้ง`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <Eye className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-zinc-300 text-[10px] sm:text-xs">เข้ามาดู</span>
              <span className="font-bold text-emerald-300 font-mono tracking-wider">
                {visitorCount.toLocaleString()}
              </span>
              <span className="text-zinc-400 text-[10px] sm:text-xs">ครั้ง</span>
            </div>
          )}
        </div>

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
          <a
            href="#lucky-wheel"
            className="hover:text-amber-400 transition-colors text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25"
          >
            <span>🪲 วงล้อลุ้นด้วง</span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Cloud Live Badge */}
          {isFirebaseConnected && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-400"
              title="เชื่อมต่อฐานข้อมูล Google Cloud Firestore เรียบร้อยแล้ว (Real-time Sync)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
              <span>Firebase Cloud</span>
            </div>
          )}

          {/* Share Button (For sharing with customers) */}
          <button
            id="nav-share-btn"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900/60 text-xs font-medium transition-all cursor-pointer"
            title="แชร์เว็บบอร์ดให้ลูกค้าดู"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">แชร์เว็บ</span>
          </button>

          {/* Admin / Settings Toggle */}
          <button
            id="nav-admin-btn"
            onClick={onToggleAdmin}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
              isAdmin
                ? 'border-emerald-500/80 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(0,185,0,0.2)]'
                : 'border-zinc-700 text-zinc-200 hover:text-white hover:border-emerald-500/50 bg-zinc-900/80'
            }`}
            title="ตั้งค่า แก้ไขข้อมูลสินค้า เพิ่มรูป ลบรูป และจัดการสต็อก"
          >
            <Settings className={`w-3.5 h-3.5 ${isAdmin ? 'text-emerald-400 animate-spin' : 'text-zinc-400'}`} />
            <span>{isAdmin ? 'ปิดโหมดตั้งค่า' : 'ตั้งค่า & จัดการรูป'}</span>
          </button>

          {/* Cart Icon */}
          <button
            id="nav-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-all group cursor-pointer"
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
