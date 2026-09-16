import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy, Gift, ArrowRight, Copy, Check, MessageCircle } from 'lucide-react';
import { WheelSlot, WheelSet } from '../../types/wheel';

interface WheelResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: WheelSlot | null;
  currentSet: WheelSet;
  claimCode: string;
  onSpinAgain: () => void;
}

export const WheelResultModal: React.FC<WheelResultModalProps> = ({
  isOpen,
  onClose,
  result,
  currentSet,
  claimCode,
  onSpinAgain,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen && result) {
      if (result.isBeetle) {
        // High intensity celebration confetti
        const duration = 3.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            return clearInterval(interval);
          }
          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.4 } });
          confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.4 } });
        }, 250);
      } else {
        // Gentle celebratory burst
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const isJackpot = result.isBeetle;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(claimCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const lineClaimMessage = encodeURIComponent(
    `สวัสดีครับ ผมหมุนวงล้อสุ่มได้ [${result.label}] จาก ${currentSet.name} รหัสรับรางวัลคือ: ${claimCode} ขอติดต่อรับสิทธิ์ครับ`
  );
  const lineUrl = `https://line.me/R/oaMessage/@eupatorus/?${lineClaimMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border overflow-hidden shadow-2xl transition-all ${
          isJackpot
            ? 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-amber-950/40 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)]'
            : 'bg-zinc-900 border-zinc-800 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isJackpot ? 'bg-amber-500/30' : 'bg-emerald-500/20'
          }`}
        />

        {/* Badge & Icon */}
        <div className="relative mb-5 flex flex-col items-center">
          {isJackpot ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-yellow-100 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-bounce duration-700">
                <span className="text-5xl">🪲</span>
              </div>
              <div className="absolute -bottom-2 bg-amber-500 text-zinc-950 text-[11px] font-black uppercase px-3 py-0.5 rounded-full border border-amber-200 shadow-md">
                JACKPOT WINNER!
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <Gift className="w-10 h-10 animate-pulse" />
            </div>
          )}
        </div>

        {/* Congratulations Titles */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-zinc-800/90 text-zinc-300 border border-zinc-700">
            <Sparkles className={`w-3.5 h-3.5 ${isJackpot ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>{currentSet.tierTitle}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
            {isJackpot ? '🎉 ยินดีด้วยคุณได้ด้วง!' : '🎉 ยินดีด้วยได้รับรางวัล!'}
          </h3>

          <div className="mt-3 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col items-center justify-center">
            <span className={`text-lg sm:text-xl font-black ${isJackpot ? 'text-amber-400' : 'text-emerald-400'}`}>
              {result.label}
            </span>
            {result.sublabel && (
              <span className="text-xs text-zinc-400 mt-0.5">{result.sublabel}</span>
            )}
          </div>
        </div>

        {/* Claim Code Box */}
        <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 mb-6 text-left">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>รหัสรับรางวัล (Lucky Claim Code):</span>
            <span className="text-[10px] text-emerald-400">ใช้ได้ 1 ครั้ง</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-base font-bold text-white tracking-widest">
              {claimCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1.5">
            * แคปหน้าจอนี้ไว้ หรือคัดลอกรหัสเพื่อแจ้งรับรางวัลทางไลน์ได้ทันที
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#00B900] hover:bg-[#009e00] text-white font-bold text-sm shadow-lg shadow-[#00B900]/25 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>ทัก LINE รับรางวัลทันที</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={onSpinAgain}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>หมุนลุ้นอีกครั้ง</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
