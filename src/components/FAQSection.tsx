import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'จัดส่งอย่างไร ปลอดภัยหรือไม่?',
    answer:
      'เราแพ็คสินค้าอย่างแน่นหนาด้วยกล่องระบายอากาศพิเศษ พร้อมเจลรักษาความชื้นและวัสดุกันกระแทกเกรดพรีเมียม รับประกันการรอดชีวิต 100% (Live Arrival Guarantee) หากเกิดความเสียหายระหว่างจัดส่ง เพียงถ่ายคลิปวิดีโอตอนเปิดกล่อง เรายินดีส่งตัวใหม่ให้ทันทีโดยไม่มีค่าใช้จ่าย',
  },
  {
    question: 'มือใหม่เลี้ยงยากไหม?',
    answer:
      'เลี้ยงง่ายมากครับ ด้วงกว่างไม่ส่งเสียงดังรบกวน ไม่ปล่อยกลิ่นเหม็น ไม่ต้องพาไปเดินเล่น เพียงวางในห้องอุณหภูมิ 20-26°C (ห้องแอร์หรือห้องพัดลมที่อากาศถ่ายเท) ฉีดพ่นละอองน้ำให้ชื้นเล็กน้อยวันละครั้ง และใส่เยลลี่สำหรับด้วง 1 ถ้วย อยู่ได้นาน 2-3 วัน',
  },
  {
    question: 'อาหารของด้วงกว่างกินอะไรได้บ้าง?',
    answer:
      'อาหารหลักที่ดีที่สุดคือ "เยลลี่โปรตีนสำหรับด้วง" (Insect Jelly) เพราะมีสารอาหารและกรดอะมิโนครบถ้วน ไม่บูดเน่าเร็ว นอกจากนี้ยังสามารถให้อ้อยสดหวาน หรือกล้วยน้ำว้าสุกได้ (หลีกเลี่ยงผลไม้ฉ่ำน้ำเกินไปเช่น แตงโม เพราะอาจทำให้ท้องเสีย)',
  },
  {
    question: 'สามารถเลี้ยงตัวผู้และตัวเมียรวมกันในกล่องเดียวได้หรือไม่?',
    answer:
      'แนะนำให้แยกเลี้ยงคนละกล่องเพื่อยืดอายุขัยของด้วงครับ ควรนำมาอยู่รวมกันเฉพาะช่วงที่ต้องการให้ผสมพันธุ์เท่านั้น (ประมาณ 1-2 วัน) หลังจากนั้นแยกตัวเมียไปใส่ตู้เพาะวางไข่ จะช่วยให้ทั้งสองตัวมีชีวิตอยู่ได้ยาวนานที่สุด',
  },
  {
    question: 'ระบบตัดสต็อกทำงานอย่างไร มีความแม่นยำแค่ไหน?',
    answer:
      'ระบบร้านค้าของเราเชื่อมต่อกับฐานข้อมูลแบบเรียลไทม์ (Real-time Database) ทุกครั้งที่มีการสั่งซื้อและชำระเงินสำเร็จ ระบบจะตัดยอดสต็อกในคลังทันที เพื่อให้ลูกค้าทุกท่านมั่นใจว่าจะได้รับตัวที่เลือกแน่นอน 100% ไม่มีการขายซ้ำหรือสินค้าหมดตกค้าง',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-emerald-400 tracking-[0.25em] uppercase text-xs font-bold mb-2 block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">คำถามที่พบบ่อย (FAQ)</h2>
          <div className="w-12 h-[2px] bg-emerald-500 mx-auto mt-4"></div>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/30 transition-colors hover:bg-zinc-900/50"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-6 py-4.5 text-white font-medium flex justify-between items-center focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-serif pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-zinc-400 text-sm font-light leading-relaxed border-t border-zinc-800/40 pt-3 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
