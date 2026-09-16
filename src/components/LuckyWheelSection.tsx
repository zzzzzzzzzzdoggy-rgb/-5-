import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  History,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { WheelSet, WheelSlot, SpinHistoryItem, DEFAULT_WHEEL_SETS } from '../types/wheel';
import { LuckyWheelCanvas } from './wheel/LuckyWheelCanvas';
import { WheelResultModal } from './wheel/WheelResultModal';
import { WheelSettingsModal } from './wheel/WheelSettingsModal';
import { wheelAudio } from '../utils/wheelAudio';

const STORAGE_KEY = 'eupatorus_lucky_wheel_sets_v3';
const HISTORY_STORAGE_KEY = 'eupatorus_lucky_wheel_history';

// Mock live ticker for atmospheric casino/arcade excitement
const INITIAL_WINNERS: SpinHistoryItem[] = [
  { id: 'w-1', setName: 'เซท 2 (100฿)', slotLabel: '🪲 ด้วงกว่างซางเหนือ 1 ตัว', isBeetle: true, timestamp: '3 นาทีที่แล้ว', claimCode: 'LUCKY-BEETLE-789' },
  { id: 'w-2', setName: 'เซท 1 (50฿)', slotLabel: 'เยลลี่โปรตีน 2 ถ้วย', isBeetle: false, timestamp: '11 นาทีที่แล้ว', claimCode: 'GIFT-JELLY-421' },
  { id: 'w-3', setName: 'เซท 3 (200฿)', slotLabel: '🪲 ด้วงกว่างซางเหนือ (คัดเกรด)', isBeetle: true, timestamp: '24 นาทีที่แล้ว', claimCode: 'VIP-GOLD-910' },
  { id: 'w-4', setName: 'เซท 2 (100฿)', slotLabel: 'ส่วนลดเงินสด 50.-', isBeetle: false, timestamp: '48 นาทีที่แล้ว', claimCode: 'CASH-50-388' },
];

export const LuckyWheelSection: React.FC = () => {
  // Wheel Sets State with Local Storage persistence
  const [wheelSets, setWheelSets] = useState<WheelSet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('[LuckyWheel] Local storage parse error:', e);
    }
    return DEFAULT_WHEEL_SETS;
  });

  const [activeSetId, setActiveSetId] = useState<'set-1' | 'set-2' | 'set-3'>('set-1');
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [lastWonSlot, setLastWonSlot] = useState<WheelSlot | null>(null);
  const [lastClaimCode, setLastClaimCode] = useState<string>('');

  // History
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_WINNERS;
  });

  const currentSet = wheelSets.find((s) => s.id === activeSetId) || wheelSets[0];

  // Real-time Grouped probability calculation (ปรับเปอร์ออโต้ Real-time Display)
  const probabilityStats = useMemo(() => {
    const total = currentSet.slots.length;
    if (total === 0) return [];

    const map = new Map<string, { label: string; count: number; isBeetle: boolean; color: string }>();
    currentSet.slots.forEach((s) => {
      const key = s.isBeetle ? '__BEETLE_JACKPOT__' : s.label.trim();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          label: s.label,
          count: 1,
          isBeetle: s.isBeetle,
          color: s.isBeetle ? '#F59E0B' : s.color || '#10B981',
        });
      }
    });

    return Array.from(map.values()).map((item) => {
      const percentVal = (item.count / total) * 100;
      return {
        ...item,
        percentage: percentVal.toFixed(1),
        percentageNumber: percentVal,
        exactRatio: `${item.count}/${total}`,
      };
    });
  }, [currentSet.slots]);

  const audioIntervalRef = useRef<any>(null);

  // Save updated sets
  const handleSaveSets = (newSets: WheelSet[]) => {
    setWheelSets(newSets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSets));
    } catch (e) {
      console.warn('[LuckyWheel] Failed to save to localStorage:', e);
    }
  };

  // Toggle Sound
  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    wheelAudio.setMuted(nextMuted);
  };

  // Handle Wheel Spin Trigger
  const handleSpin = () => {
    if (isSpinning || currentSet.slots.length === 0) return;

    setIsSpinning(true);

    // 1. Pick a random winning slot index
    const totalSlots = currentSet.slots.length;
    const winningIndex = Math.floor(Math.random() * totalSlots);
    const winningSlot = currentSet.slots[winningIndex];

    // 2. Calculate target rotation angle so winning slot lands directly under top needle (at 270 deg)
    const sliceAngle = 360 / totalSlots;
    // The center angle of slice i:
    const slotCenterAngle = (winningIndex + 0.5) * sliceAngle;
    
    // Needle is at top: 270 degrees in SVG circle coordinate system
    // Wheel rotates clockwise by `rotation`
    // (slotCenterAngle + targetRotation) % 360 = 270
    // => targetAngleRemainder = (270 - slotCenterAngle + 360) % 360
    const remainder = (270 - slotCenterAngle + 360) % 360;

    // Add 6 to 9 full spins for a thrilling build-up
    const fullSpins = 360 * (6 + Math.floor(Math.random() * 3));
    const currentBase = Math.floor(rotation / 360) * 360;
    const targetRotation = currentBase + fullSpins + remainder;

    setRotation(targetRotation);

    // 3. Audio peg-tick sound during spinning with exponential deceleration
    let tickCount = 0;
    const maxTicks = 25;
    let delay = 90;

    const playTickingSeq = () => {
      if (tickCount >= maxTicks) return;
      wheelAudio.playTick();
      tickCount++;
      delay = Math.min(450, delay * 1.12);
      audioIntervalRef.current = setTimeout(playTickingSeq, delay);
    };
    audioIntervalRef.current = setTimeout(playTickingSeq, delay);

    // 4. Spin completion after 4.6 seconds
    setTimeout(() => {
      setIsSpinning(false);
      if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);

      // Play victory audio
      wheelAudio.playWin(winningSlot.isBeetle);

      // Generate unique claim code
      const prefix = winningSlot.isBeetle ? 'BEETLE-JACKPOT' : 'LUCKY-GIFT';
      const code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      setLastWonSlot(winningSlot);
      setLastClaimCode(code);
      setIsResultOpen(true);

      // Record to history
      const newHistoryItem: SpinHistoryItem = {
        id: `spin-${Date.now()}`,
        setName: currentSet.tierTitle,
        slotLabel: winningSlot.label,
        isBeetle: winningSlot.isBeetle,
        timestamp: 'เมื่อสักครู่นี้',
        claimCode: code,
      };

      setSpinHistory((prev) => {
        const updated = [newHistoryItem, ...prev.slice(0, 7)];
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }, 4600);
  };

  // Clean up audio timer on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearTimeout(audioIntervalRef.current);
    };
  }, []);

  const beetleSlotCount = currentSet.slots.filter((s) => s.isBeetle).length;
  const beetleProbability = currentSet.slots.length > 0
    ? ((beetleSlotCount / currentSet.slots.length) * 100).toFixed(1)
    : '0';

  return (
    <section id="lucky-wheel" className="py-20 bg-zinc-950 relative overflow-hidden border-t border-zinc-800">
      {/* Background Ambience & Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>มินิเกมเสี่ยงโชค • LUCKY BEETLE WHEEL</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            วงล้อหมุนสุ่มลุ้นด้วง 🪲
          </h2>

          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            ลุ้นรับ <span className="text-amber-400 font-semibold">ด้วงกว่างซางเหนือตัวจริงเสียงจริง</span> หรือของแถมพรีเมียมในทุกการหมุน การันตีได้รับรางวัลทุกตา ไม่มีช่องเกลือ!
          </p>

          {/* Quick Toolbar: Settings & Sound */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-medium transition-all hover:border-amber-500/60 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="ตั้งค่าวงล้อ เพิ่ม/ลดช่อง ปรับราคา และรางวัล"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>⚙️ ตั้งค่าวงล้อ (เพิ่ม/ลดช่อง)</span>
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  <span>เสียง: ปิด</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>เสียง: เปิด</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Set Selector Tabs (เซท 1 50฿ 10ช่อง | เซท 2 100฿ 5ช่อง | เซท 3 200฿ 3ช่อง) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto mb-10">
          {wheelSets.map((s) => {
            const isSelected = s.id === activeSetId;
            const beetleCount = s.slots.filter((sl) => sl.isBeetle).length;
            const prob = ((beetleCount / s.slots.length) * 100).toFixed(0);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (!isSpinning) {
                    setActiveSetId(s.id);
                  }
                }}
                disabled={isSpinning}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/20 via-zinc-900 to-zinc-900 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.02]'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400'
                } ${isSpinning ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}

                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-zinc-300'}`}>
                    {s.tierTitle}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ฿{s.price}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white mt-1">
                  {s.name}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                  <span>{s.slots.length} ช่องรางวัล</span>
                  <span className={isSelected ? 'text-amber-300 font-bold' : 'text-zinc-400'}>
                    โอกาสได้ด้วง {prob}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Wheel Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Left / Center: Interactive SVG Wheel */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <LuckyWheelCanvas
              slots={currentSet.slots}
              rotation={rotation}
              isSpinning={isSpinning}
              onSpin={handleSpin}
            />
          </div>

          {/* Right: Wheel Info, Active Slot Preview, Spin Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Active Tier Info Card */}
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentSet.tierTitle}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {currentSet.name}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ฿{currentSet.price}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-medium">
                    ต่อการหมุน 1 ครั้ง
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentSet.description}
              </p>

              {/* Real-time stats */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                  <span className="block text-[10px] text-zinc-400 uppercase">จำนวนช่องทั้งหมด</span>
                  <span className="text-sm font-bold text-white font-mono">{currentSet.slots.length} ช่อง</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-center">
                  <span className="block text-[10px] text-zinc-400 uppercase">โอกาสได้ด้วง</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">{beetleProbability}% ({beetleSlotCount}/{currentSet.slots.length})</span>
                </div>
              </div>

              {/* Auto Probability Ratio Bar & Breakdown */}
              <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-medium flex items-center gap-1">
                    <Percent className="w-3 h-3 text-emerald-400" />
                    <span>สัดส่วนรางวัลคำนวณออโต้ (100%)</span>
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">
                    ช่องละ {(100 / currentSet.slots.length).toFixed(1)}%
                  </span>
                </div>

                {/* Color-coded horizontal ratio bar */}
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex shadow-inner">
                  {probabilityStats.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${item.percentageNumber}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full transition-all duration-300"
                      title={`${item.label}: ${item.percentage}%`}
                    />
                  ))}
                </div>

                {/* Prize Chance Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {probabilityStats.map((item, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 font-medium ${
                        item.isBeetle
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                      <span className="font-mono text-zinc-400">({item.percentage}%)</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Big Primary Spin Button */}
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  isSpinning
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSpinning ? (
                  <>
                    <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>กำลังหมุนลุ้นรางวัล...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">🪲</span>
                    <span>หมุนวงล้อลุ้นด้วง ({currentSet.price} บาท)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Guarantee list */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>การันตีได้ของรางวัลแน่นอน 100% ทุกตา</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>ได้ด้วงแล้วติดต่อรับผ่าน LINE OA ได้ทันที</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>คูปองและส่วนลดใช้ลดราคาสินค้าในร้านได้จริง</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Winners & Recent Spins Ticker */}
        <div className="mt-14 max-w-4xl mx-auto p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800/80">
          <div className="flex items-center justify-between gap-3 mb-3 border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                ประวัติการหมุนรางวัลล่าสุด (Recent Winners)
              </h4>
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Updates</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {spinHistory.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    item.isBeetle ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.isBeetle ? '🪲' : '🎁'}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-zinc-200 block truncate">
                      {item.slotLabel}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {item.setName} • {item.timestamp}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 flex-shrink-0 ml-2">
                  {item.claimCode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <WheelResultModal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        result={lastWonSlot}
        currentSet={currentSet}
        claimCode={lastClaimCode}
        onSpinAgain={() => {
          setIsResultOpen(false);
          setTimeout(() => handleSpin(), 300);
        }}
      />

      {/* Settings Modal (Add / Remove Slots & Edit) */}
      <WheelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        wheelSets={wheelSets}
        onSave={handleSaveSets}
      />
    </section>
  );
};
