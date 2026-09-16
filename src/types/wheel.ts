export interface WheelSlot {
  id: string;
  label: string;
  sublabel?: string;
  isBeetle: boolean;
  color: string;
  textColor?: string;
  icon?: string;
}

export interface WheelSet {
  id: 'set-1' | 'set-2' | 'set-3';
  name: string;
  tierTitle: string;
  price: number;
  description: string;
  badge: string;
  slots: WheelSlot[];
}

export interface SpinHistoryItem {
  id: string;
  setName: string;
  slotLabel: string;
  isBeetle: boolean;
  timestamp: string;
  claimCode: string;
}

export const DEFAULT_WHEEL_SETS: WheelSet[] = [
  {
    id: 'set-1',
    name: 'เซท 1: สนุกลุ้นเบาๆ',
    tierTitle: 'เซท 1 • 50 บาท',
    price: 50,
    description: '10 ช่องลุ้นสนุก โอกาส 1 ใน 10 สุ่มได้ด้วงกว่างซางเหนือตัวจริง!',
    badge: '10 ช่อง (โอกาส 10%)',
    slots: [
      { id: 's1-1', label: '🪲 ด้วงกว่างซางเหนือ', sublabel: 'รางวัลแจ็คพอต!', isBeetle: true, color: '#F59E0B', textColor: '#000000' },
      { id: 's1-2', label: 'เยลลี่โปรตีน 2 ถ้วย', sublabel: 'อาหารเกรด A', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's1-3', label: 'ส่วนลด 20 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's1-4', label: 'สติกเกอร์กว่างซาง', sublabel: 'Limited Edition', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
      { id: 's1-5', label: 'คูปองส่งฟรี 40.-', sublabel: 'ลดค่าส่งบิลนี้', isBeetle: false, color: '#065F46', textColor: '#FFFFFF' },
      { id: 's1-6', label: 'อาหารเยลลี่กล้วย', sublabel: 'สูตรพลังงาน', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
      { id: 's1-7', label: 'ส่วนลด 15 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's1-8', label: 'เยลลี่ผลไม้รวม 1 ถ้วย', sublabel: 'บำรุงเขากว่าง', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's1-9', label: 'คู่มือการเลี้ยง Pro', sublabel: 'E-Book ฟรี', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
      { id: 's1-10', label: 'ลุ้นใหม่อีกครั้ง', sublabel: 'แต้มสะสม x2', isBeetle: false, color: '#1F2937', textColor: '#E5E7EB' },
    ],
  },
  {
    id: 'set-2',
    name: 'เซท 2: ลุ้นจัดเต็ม',
    tierTitle: 'เซท 2 • 100 บาท',
    price: 100,
    description: '5 ช่องโอกาสทอง โอกาสสูงถึง 1 ใน 5 ได้ด้วงตัวจริงพร้อมของแถมเพียบ!',
    badge: '5 ช่อง (โอกาส 20%)',
    slots: [
      { id: 's2-1', label: '🪲 ด้วงกว่างซางเหนือ', sublabel: 'รางวัลแจ็คพอต!', isBeetle: true, color: '#F59E0B', textColor: '#000000' },
      { id: 's2-2', label: 'เยลลี่พรีเมียม 5 ถ้วย', sublabel: 'มูลค่า 80 บาท', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's2-3', label: 'ส่วนลดเงินสด 50.-', sublabel: 'ลดทันทีในบิล', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's2-4', label: 'ชุดอาหารด้วงเกรด A', sublabel: 'อาหารพร้อมเลี้ยง', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
      { id: 's2-5', label: 'คูปองส่งฟรีทั้งออเดอร์', sublabel: 'ประหยัดสุดคุ้ม', isBeetle: false, color: '#065F46', textColor: '#FFFFFF' },
    ],
  },
  {
    id: 'set-3',
    name: 'เซท 3: VIP ลุ้นติดมือ',
    tierTitle: 'เซท 3 • 200 บาท',
    price: 200,
    description: 'โอกาสสูงสุด 1 ใน 3! ช่องน้อย แตกง่าย รางวัลใหญ่ด้วงกว่างคัดพิเศษไซส์สวย',
    badge: '3 ช่อง (โอกาส 33.3%)',
    slots: [
      { id: 's3-1', label: '🪲 ด้วงกว่างซางเหนือ (คัดเกรด)', sublabel: 'แจ็คพอตไซส์สวย!', isBeetle: true, color: '#F59E0B', textColor: '#000000' },
      { id: 's3-2', label: 'กิฟต์เซ็ตอาหารด้วง 1 ชุด', sublabel: 'มูลค่า 150 บาท', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's3-3', label: 'ส่วนลดเงินสด 100 บาท', sublabel: 'ลดบิลนี้ทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
    ],
  },
];
