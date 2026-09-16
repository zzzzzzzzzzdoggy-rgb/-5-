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
    name: 'เซท 1: ลุ้นสนุกสุดคุ้ม',
    tierTitle: 'เซท 1 • 50 บาท',
    price: 50,
    description: '10 ช่องลุ้นสนุก โอกาสได้ด้วง 1 ใน 10 (10%) พร้อมคูปองส่วนลดสูงสุด 150 บาท ใช้ลดบิลได้ทันที!',
    badge: '10 ช่อง (โอกาสด้วง 10%)',
    slots: [
      { id: 's1-1', label: '🪲 ด้วงกว่างซางเหนือ', sublabel: 'รางวัลแจ็คพอตตัวจริง!', isBeetle: true, color: '#F59E0B', textColor: '#000000' },
      { id: 's1-2', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's1-3', label: 'ส่วนลด 60 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's1-4', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's1-5', label: 'ส่วนลด 150 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
      { id: 's1-6', label: 'ส่วนลด 60 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's1-7', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's1-8', label: 'ส่วนลด 60 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's1-9', label: 'ส่วนลด 150 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
      { id: 's1-10', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
    ],
  },
  {
    id: 'set-2',
    name: 'เซท 2: โอกาสทองลุ้นจัดเต็ม',
    tierTitle: 'เซท 2 • 100 บาท',
    price: 100,
    description: '5 ช่องโอกาสสูง 1 ใน 5 (20%) ลุ้นรับด้วงกว่างซางเหนือ หรือรับส่วนลด 100฿ และ 80฿ ใช้ลดบิลทันที!',
    badge: '5 ช่อง (โอกาสด้วง 20%)',
    slots: [
      { id: 's2-1', label: '🪲 ด้วงกว่างซางเหนือ', sublabel: 'รางวัลแจ็คพอตตัวจริง!', isBeetle: true, color: '#F59E0B', textColor: '#000000' },
      { id: 's2-2', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's2-3', label: 'ส่วนลด 80 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#059669', textColor: '#FFFFFF' },
      { id: 's2-4', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
      { id: 's2-5', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#047857', textColor: '#FFFFFF' },
    ],
  },
  {
    id: 'set-3',
    name: 'เซท 3: VIP ลุ้นติดมือ 50/50',
    tierTitle: 'เซท 3 • 200 บาท',
    price: 200,
    description: '2 ช่องสุดพรีเมียม โอกาสสูงถึง 1 ใน 2 (50%) ลุ้นรับด้วงกว่างซางเหนือคัดเกรด หรือส่วนลด 100 บาทลดบิลทันที!',
    badge: '2 ช่อง (โอกาสด้วง 50%)',
    slots: [
      { id: 's3-1', label: '🪲 ด้วงกว่างซางเหนือ (คัดเกรด)', sublabel: 'แจ็คพอต VIP ตัวจริง!', isBeetle: true, color: '#F59E0B', textColor: '#000000' },
      { id: 's3-2', label: 'ส่วนลด 100 บาท', sublabel: 'ใช้ลดบิลทันที', isBeetle: false, color: '#10B981', textColor: '#FFFFFF' },
    ],
  },
];
