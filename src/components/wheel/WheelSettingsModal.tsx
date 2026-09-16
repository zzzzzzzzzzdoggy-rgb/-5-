import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  ShieldCheck,
  Percent,
  ArrowUp,
  ArrowDown,
  Wand2,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { WheelSet, WheelSlot, DEFAULT_WHEEL_SETS } from '../../types/wheel';

interface WheelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelSets: WheelSet[];
  onSave: (updatedSets: WheelSet[]) => void;
}

const PRESET_COLORS = [
  { name: 'ทอง (ด้วง)', color: '#F59E0B' },
  { name: 'เขียวมรกต (100฿)', color: '#10B981' },
  { name: 'เขียวหยก (60฿)', color: '#059669' },
  { name: 'เขียวดาร์ก (150฿)', color: '#047857' },
  { name: 'เขียวน้ำทะเล (80฿)', color: '#0D9488' },
  { name: 'น้ำเงินไพลิน', color: '#2563EB' },
  { name: 'ม่วงอเมทิสต์', color: '#8B5CF6' },
  { name: 'แดงทับทิม', color: '#EF4444' },
  { name: 'เทาดำ', color: '#1F2937' },
];

export const WheelSettingsModal: React.FC<WheelSettingsModalProps> = ({
  isOpen,
  onClose,
  wheelSets,
  onSave,
}) => {
  const [selectedSetId, setSelectedSetId] = useState<'set-1' | 'set-2' | 'set-3'>('set-1');
  const [editableSets, setEditableSets] = useState<WheelSet[]>(() => JSON.parse(JSON.stringify(wheelSets)));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [autoOptimizedMessage, setAutoOptimizedMessage] = useState<string | null>(null);

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setEditableSets(JSON.parse(JSON.stringify(wheelSets)));
      setSavedSuccess(false);
      setAutoOptimizedMessage(null);
    }
  }, [isOpen, wheelSets]);

  const currentSet = editableSets.find((s) => s.id === selectedSetId) || editableSets[0];

  // Grouped probability calculation (ปรับเปอร์ออโต้ Real-time Engine)
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

  if (!isOpen) return null;

  // Update field of current set
  const handleUpdateSetField = (field: keyof WheelSet, value: any) => {
    setEditableSets((prev) =>
      prev.map((s) => (s.id === selectedSetId ? { ...s, [field]: value } : s))
    );
  };

  // Add custom slot
  const handleAddSlot = (
    customLabel?: string,
    customSublabel?: string,
    isBeetle: boolean = false,
    customColor?: string
  ) => {
    const newSlotIndex = currentSet.slots.length + 1;
    const color = isBeetle
      ? '#F59E0B'
      : customColor || PRESET_COLORS[(newSlotIndex - 1) % PRESET_COLORS.length].color;

    const newSlot: WheelSlot = {
      id: `${currentSet.id}-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: customLabel || `รางวัลใหม่ ${newSlotIndex}`,
      sublabel: customSublabel || 'ใช้ลดบิลทันที',
      isBeetle,
      color,
      textColor: isBeetle ? '#000000' : '#FFFFFF',
    };

    const updatedSlots = [...currentSet.slots, newSlot];
    const beetleCount = updatedSlots.filter((s) => s.isBeetle).length;
    const beetlePercent = ((beetleCount / updatedSlots.length) * 100).toFixed(0);

    setEditableSets((prev) =>
      prev.map((s) =>
        s.id === selectedSetId
          ? {
              ...s,
              slots: updatedSlots,
              badge: `${updatedSlots.length} ช่อง (โอกาสด้วง ${beetlePercent}%)`,
            }
          : s
      )
    );
  };

  // Remove a slot (ensure at least 2 slots remain)
  const handleRemoveSlot = (slotIndex: number) => {
    if (currentSet.slots.length <= 2) {
      alert('วงล้อต้องมีอย่างน้อย 2 ช่องรางวัลครับ');
      return;
    }

    const updatedSlots = currentSet.slots.filter((_, idx) => idx !== slotIndex);
    const beetleCount = updatedSlots.filter((s) => s.isBeetle).length;
    const beetlePercent = ((beetleCount / updatedSlots.length) * 100).toFixed(0);

    setEditableSets((prev) =>
      prev.map((s) =>
        s.id === selectedSetId
          ? {
              ...s,
              slots: updatedSlots,
              badge: `${updatedSlots.length} ช่อง (โอกาสด้วง ${beetlePercent}%)`,
            }
          : s
      )
    );
  };

  // Move slot up or down
  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSet.slots.length) return;

    const updatedSlots = [...currentSet.slots];
    const temp = updatedSlots[index];
    updatedSlots[index] = updatedSlots[targetIndex];
    updatedSlots[targetIndex] = temp;

    handleUpdateSetField('slots', updatedSlots);
  };

  // Update specific slot field
  const handleUpdateSlot = (slotIndex: number, field: keyof WheelSlot, value: any) => {
    const updatedSlots = [...currentSet.slots];
    const targetSlot = { ...updatedSlots[slotIndex], [field]: value };

    // If making this slot the Beetle winner, set color to Gold automatically
    if (field === 'isBeetle' && value === true) {
      targetSlot.color = '#F59E0B';
      targetSlot.textColor = '#000000';
    }

    updatedSlots[slotIndex] = targetSlot;
    handleUpdateSetField('slots', updatedSlots);
  };

  // Auto-Percent Optimization (ปรับเปอร์ออโต้ & จัดเรียงสลับสี)
  const handleAutoOptimize = () => {
    const total = currentSet.slots.length;
    const beetleCount = currentSet.slots.filter((s) => s.isBeetle).length;
    const beetleProb = ((beetleCount / total) * 100).toFixed(1);

    // Auto-badge
    const autoBadge = `${total} ช่อง (โอกาสด้วง ${beetleProb}%)`;

    // Auto-description with clear probabilities
    const statsSummary = probabilityStats
      .map((st) => `${st.label} ${st.percentage}%`)
      .join(', ');

    const autoDesc = `${total} ช่องลุ้นสนุก โอกาสได้ด้วง ${beetleCount} ใน ${total} (${beetleProb}%) [${statsSummary}]`;

    // Harmonize slot colors alternately for optimal wheel visuals
    const optimizedSlots = currentSet.slots.map((s, idx) => {
      if (s.isBeetle) {
        return { ...s, color: '#F59E0B', textColor: '#000000' };
      }
      if (s.label.includes('150')) {
        return { ...s, color: '#047857', textColor: '#FFFFFF' };
      }
      if (s.label.includes('100')) {
        return { ...s, color: '#10B981', textColor: '#FFFFFF' };
      }
      if (s.label.includes('80')) {
        return { ...s, color: '#0D9488', textColor: '#FFFFFF' };
      }
      if (s.label.includes('60')) {
        return { ...s, color: '#059669', textColor: '#FFFFFF' };
      }
      return {
        ...s,
        color: PRESET_COLORS[(idx + 1) % PRESET_COLORS.length].color,
        textColor: '#FFFFFF',
      };
    });

    setEditableSets((prev) =>
      prev.map((s) =>
        s.id === selectedSetId
          ? {
              ...s,
              badge: autoBadge,
              description: autoDesc,
              slots: optimizedSlots,
            }
          : s
      )
    );

    setAutoOptimizedMessage('⚡ ปรับเปอร์เซ็นต์อัตโนมัติและจัดสมดุลสีเรียบร้อยแล้ว!');
    setTimeout(() => setAutoOptimizedMessage(null), 3000);
  };

  // Reset to default presets
  const handleResetCurrentSet = () => {
    const defaultSet = DEFAULT_WHEEL_SETS.find((s) => s.id === selectedSetId);
    if (!defaultSet) return;

    if (confirm(`ต้องการคืนค่า "${defaultSet.name}" กลับเป็นค่ามาตรฐานที่กำหนดไว้ใช่หรือไม่?`)) {
      setEditableSets((prev) =>
        prev.map((s) => (s.id === selectedSetId ? JSON.parse(JSON.stringify(defaultSet)) : s))
      );
      setAutoOptimizedMessage(`คืนค่า ${defaultSet.tierTitle} สำเร็จ!`);
      setTimeout(() => setAutoOptimizedMessage(null), 2500);
    }
  };

  const handleResetAllDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าทั้ง 3 เซทกลับเป็นค่าเริ่มต้นมาตรฐานทั้งหมดใช่หรือไม่?')) {
      const resetData = JSON.parse(JSON.stringify(DEFAULT_WHEEL_SETS));
      setEditableSets(resetData);
      setAutoOptimizedMessage('คืนค่าเริ่มต้นมาตรฐานครบทั้ง 3 เซทแล้ว!');
      setTimeout(() => setAutoOptimizedMessage(null), 2500);
    }
  };

  // Save settings
  const handleSave = () => {
    onSave(editableSets);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ตั้งค่าวงล้อสุ่มลุ้นด้วง</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Pro Settings & Auto-Percent
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                เพิ่มช่อง ลดช่อง เปลี่ยนชื่อรางวัล ปรับราคา และคำนวณปรับเปอร์เซ็นต์อัตโนมัติ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/60 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Set Selector Tabs */}
        <div className="p-3.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto">
          {editableSets.map((s) => {
            const isSelected = s.id === selectedSetId;
            const beetleCount = s.slots.filter((sl) => sl.isBeetle).length;
            const prob = ((beetleCount / s.slots.length) * 100).toFixed(0);

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSetId(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span>{s.tierTitle}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-amber-950 text-amber-200' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {s.slots.length} ช่อง ({prob}%)
                </span>
              </button>
            );
          })}
        </div>

        {/* Auto Optimized Toast Banner */}
        {autoOptimizedMessage && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{autoOptimizedMessage}</span>
            </div>
            <button
              onClick={() => setAutoOptimizedMessage(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* General Set Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                ชื่อเซท / หัวข้อ
              </label>
              <input
                type="text"
                value={currentSet.tierTitle}
                onChange={(e) => handleUpdateSetField('tierTitle', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                ราคาต่อการหมุน (บาท)
              </label>
              <input
                type="number"
                min="0"
                value={currentSet.price}
                onChange={(e) =>
                  handleUpdateSetField('price', Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                ข้อความป้ายกำกับ (Badge)
              </label>
              <input
                type="text"
                value={currentSet.badge}
                onChange={(e) => handleUpdateSetField('badge', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                คำอธิบายเซท
              </label>
              <input
                type="text"
                value={currentSet.description}
                onChange={(e) => handleUpdateSetField('description', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* AUTO-PERCENT PROBABILITY ENGINE CARD */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>ระบบคำนวณและปรับเปอร์เซ็นต์อัตโนมัติ (Auto-Probability)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    อัตราออกรางวัล 1 ช่อง = {(100 / currentSet.slots.length).toFixed(1)}% • รวม {currentSet.slots.length} ช่อง = 100.0%
                  </p>
                </div>
              </div>

              {/* One-Click Auto Optimize Button */}
              <button
                type="button"
                onClick={handleAutoOptimize}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="คำนวณเปอร์เซ็นต์ อัปเดตป้ายกำกับ และจัดสมดุลสีอัตโนมัติ"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>⚡ ปรับเปอร์ออโต้ (Auto Calculate & Sync)</span>
              </button>
            </div>

            {/* Visual Probability Ratio Bar (100% Horizontal Stack) */}
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex shadow-inner my-2">
              {probabilityStats.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${item.percentageNumber}%`,
                    backgroundColor: item.color,
                  }}
                  className="h-full transition-all duration-300 relative group"
                  title={`${item.label}: ${item.percentage}% (${item.exactRatio} ช่อง)`}
                />
              ))}
            </div>

            {/* Probability Breakdown Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {probabilityStats.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    item.isBeetle
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="truncate pr-1">{item.label}</span>
                    {item.isBeetle && <span className="text-amber-400">🪲</span>}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-xs text-zinc-400 font-mono">
                      {item.count} ช่อง ({item.exactRatio})
                    </span>
                    <span
                      className={`text-sm font-bold font-mono ${
                        item.isBeetle ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK-ADD PRIZE BUTTONS */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>เพิ่มช่องรางวัลยอดนิยมด่วน (Quick Add Slots)</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-normal">
                กดเพื่อเพิ่มช่อง ระบบจะคำนวณเปอร์เซ็นต์ใหม่ทันที
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAddSlot('ส่วนลด 100 บาท', 'ใช้ลดบิลทันที', false, '#10B981')}
                className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>+ ส่วนลด 100.-</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddSlot('ส่วนลด 150 บาท', 'ใช้ลดบิลทันที', false, '#047857')}
                className="px-2.5 py-1.5 bg-emerald-800/30 hover:bg-emerald-800/45 text-emerald-300 border border-emerald-600/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>+ ส่วนลด 150.-</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddSlot('ส่วนลด 60 บาท', 'ใช้ลดบิลทันที', false, '#059669')}
                className="px-2.5 py-1.5 bg-emerald-700/20 hover:bg-emerald-700/35 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>+ ส่วนลด 60.-</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddSlot('ส่วนลด 80 บาท', 'ใช้ลดบิลทันที', false, '#0D9488')}
                className="px-2.5 py-1.5 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>+ ส่วนลด 80.-</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddSlot('🪲 ด้วงกว่างซางเหนือ', 'รางวัลแจ็คพอตตัวจริง!', true, '#F59E0B')}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>+ ด้วงกว่างซาง 🪲</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddSlot()}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ml-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ช่องกำหนดเอง</span>
              </button>
            </div>
          </div>

          {/* Slots List Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                รายชื่อช่องรางวัล ({currentSet.slots.length} ช่อง)
              </h4>
              <span className="text-[11px] text-zinc-400">
                • เปอร์เซ็นต์ต่อช่อง: {(100 / currentSet.slots.length).toFixed(1)}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetCurrentSet}
              className="px-2.5 py-1 text-xs text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="คืนค่ามาตรฐานของเซทนี้"
            >
              <RotateCcw className="w-3 h-3" />
              <span>คืนค่าเซทนี้</span>
            </button>
          </div>

          {/* Slots Table / List */}
          <div className="space-y-3">
            {currentSet.slots.map((slot, index) => {
              const isBeetle = slot.isBeetle;
              const slotPercent = (100 / currentSet.slots.length).toFixed(1);

              return (
                <div
                  key={slot.id || index}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                    isBeetle
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : 'bg-zinc-950/70 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        ช่องที่ {index + 1}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        โอกาส {slotPercent}%
                      </span>
                      {isBeetle && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>ช่องแจ็คพอตด้วง</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reorder Up / Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveSlot(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveSlot(index, 'down')}
                        disabled={index === currentSet.slots.length - 1}
                        className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Beetle Toggle */}
                      <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer select-none ml-1">
                        <input
                          type="checkbox"
                          checked={slot.isBeetle}
                          onChange={(e) => handleUpdateSlot(index, 'isBeetle', e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                        />
                        <span className={isBeetle ? 'text-amber-400 font-bold' : ''}>
                          ได้ด้วงตัวจริง 🪲
                        </span>
                      </label>

                      {/* Delete Slot Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        disabled={currentSet.slots.length <= 2}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ml-1"
                        title={currentSet.slots.length <= 2 ? 'วงล้อต้องมีอย่างน้อย 2 ช่อง' : 'ลบช่องนี้'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">
                        ชื่อรางวัลหลัก
                      </label>
                      <input
                        type="text"
                        value={slot.label}
                        onChange={(e) => handleUpdateSlot(index, 'label', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="เช่น ส่วนลด 100 บาท"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">
                        คำอธิบายย่อย
                      </label>
                      <input
                        type="text"
                        value={slot.sublabel || ''}
                        onChange={(e) => handleUpdateSlot(index, 'sublabel', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                        placeholder="เช่น ใช้ลดบิลทันที"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">
                        สีพื้นหลังช่อง
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={slot.color || '#10B981'}
                          onChange={(e) => handleUpdateSlot(index, 'color', e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent border border-zinc-700 cursor-pointer"
                        />
                        <div className="flex flex-wrap gap-1">
                          {PRESET_COLORS.slice(0, 5).map((pc) => (
                            <button
                              key={pc.color}
                              type="button"
                              onClick={() => handleUpdateSlot(index, 'color', pc.color)}
                              className="w-5 h-5 rounded-md border border-zinc-700 hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: pc.color }}
                              title={pc.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetAllDefaults}
            className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่ามาตรฐานทั้ง 3 เซท</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-zinc-950" />
                  <span>บันทึกเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-zinc-950" />
                  <span>บันทึกการตั้งค่าวงล้อ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

