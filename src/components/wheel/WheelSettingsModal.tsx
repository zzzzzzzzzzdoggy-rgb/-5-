import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Check, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { WheelSet, WheelSlot, DEFAULT_WHEEL_SETS } from '../../types/wheel';

interface WheelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelSets: WheelSet[];
  onSave: (updatedSets: WheelSet[]) => void;
}

const PRESET_COLORS = [
  { name: 'ทอง (ด้วง)', color: '#F59E0B' },
  { name: 'เขียวมรกต', color: '#10B981' },
  { name: 'เขียวเข้ม', color: '#059669' },
  { name: 'เขียวดาร์ก', color: '#047857' },
  { name: 'เขียวอมดำ', color: '#065F46' },
  { name: 'น้ำเงิน', color: '#2563EB' },
  { name: 'ม่วง', color: '#8B5CF6' },
  { name: 'แดง', color: '#EF4444' },
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

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen) {
      setEditableSets(JSON.parse(JSON.stringify(wheelSets)));
      setSavedSuccess(false);
    }
  }, [isOpen, wheelSets]);

  if (!isOpen) return null;

  const currentSet = editableSets.find((s) => s.id === selectedSetId) || editableSets[0];

  // Update field of current set
  const handleUpdateSetField = (field: keyof WheelSet, value: any) => {
    setEditableSets((prev) =>
      prev.map((s) => (s.id === selectedSetId ? { ...s, [field]: value } : s))
    );
  };

  // Add new slot
  const handleAddSlot = () => {
    const newSlotIndex = currentSet.slots.length + 1;
    const newSlot: WheelSlot = {
      id: `${currentSet.id}-custom-${Date.now()}`,
      label: `ของรางวัลใหม่ ${newSlotIndex}`,
      sublabel: 'สุ่มลุ้นโชค',
      isBeetle: false,
      color: PRESET_COLORS[(newSlotIndex - 1) % PRESET_COLORS.length].color,
      textColor: '#FFFFFF',
    };

    const updatedSlots = [...currentSet.slots, newSlot];
    handleUpdateSetField('slots', updatedSlots);
    handleUpdateSetField('badge', `${updatedSlots.length} ช่อง`);
  };

  // Remove a slot (ensure at least 2 slots remain)
  const handleRemoveSlot = (slotIndex: number) => {
    if (currentSet.slots.length <= 2) {
      alert('วงล้อต้องมีอย่างน้อย 2 ช่องรางวัลครับ');
      return;
    }

    const updatedSlots = currentSet.slots.filter((_, idx) => idx !== slotIndex);
    handleUpdateSetField('slots', updatedSlots);
    handleUpdateSetField('badge', `${updatedSlots.length} ช่อง`);
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

  // Reset to default presets
  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าวงล้อทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      const resetData = JSON.parse(JSON.stringify(DEFAULT_WHEEL_SETS));
      setEditableSets(resetData);
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
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
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
                  Customizable Wheel
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                เพิ่มช่อง ลดช่อง เปลี่ยนชื่อรางวัล ปรับราคา และกำหนดช่องที่ได้ด้วงได้อย่างอิสระ
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
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto">
          {editableSets.map((s) => {
            const isSelected = s.id === selectedSetId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSetId(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <span>{s.tierTitle}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-950 text-amber-200' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {s.slots.length} ช่อง
                </span>
              </button>
            );
          })}
        </div>

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
                onChange={(e) => handleUpdateSetField('price', Math.max(0, parseInt(e.target.value) || 0))}
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

          {/* Slots List Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                ช่องรางวัลในวงล้อ ({currentSet.slots.length} ช่อง)
              </h4>
              <span className="text-[11px] text-zinc-400">
                • โอกาสได้ด้วง: 1 ใน {currentSet.slots.length} (
                {(100 / currentSet.slots.length).toFixed(1)}%)
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddSlot}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มช่องรางวัล (+1)</span>
            </button>
          </div>

          {/* Slots Table / List */}
          <div className="space-y-3">
            {currentSet.slots.map((slot, index) => {
              const isBeetle = slot.isBeetle;
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
                      {isBeetle && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>ช่องแจ็คพอตด้วง</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Beetle Toggle */}
                      <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer select-none">
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
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="ลบช่องนี้"
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
                        placeholder="เช่น ด้วงกว่างซางเหนือ 1 ตัว"
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
                        placeholder="เช่น มูลค่า 80 บาท"
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
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น (Reset Defaults)</span>
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
