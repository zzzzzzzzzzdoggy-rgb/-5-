import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Share2, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../data/products';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://eupatorus.com';
  const shareQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=ffffff&color=000000&margin=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Eupatorus | ด้วงกว่าง 5 เขา (กว่างซางเหนือ) เกรดสะสมพรีเมียม',
        text: 'ชมประวัติ สตอรี่ และสั่งซื้อด้วงกว่าง 5 เขา (กว่างซางเหนือ) พร้อมระบบตัดสต็อกเรียลไทม์',
        url: currentUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div
      id="share-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-serif text-white mb-1">แชร์เว็บให้ลูกค้าดู</h3>
        <p className="text-zinc-400 text-xs mb-6">
          ส่งต่อหน้าพรีเซนต์ด้วงกว่าง 5 เขา ประวัติสายพันธุ์ และรายการสั่งซื้อให้ลูกค้า
        </p>

        {/* QR Code for Mobile Scanning */}
        <div className="bg-white p-4 rounded-2xl shadow-xl inline-block mb-6">
          <img
            src={shareQrUrl}
            alt="Scan to open website"
            className="w-44 h-44 object-contain mx-auto"
          />
          <span className="text-[10px] text-zinc-500 block mt-1 font-mono">
            สแกนเพื่อเปิดบนมือถือ
          </span>
        </div>

        {/* Copy Link Field */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 mb-4">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="bg-transparent text-xs text-zinc-300 px-2 flex-1 focus:outline-none truncate font-mono"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
          </button>
        </div>

        {/* Quick Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 bg-[#00B900] hover:bg-[#009900] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>แชร์ลง LINE</span>
          </a>

          <button
            onClick={handleNativeShare}
            className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>แชร์อื่นๆ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
