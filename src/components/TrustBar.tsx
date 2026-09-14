import React from 'react';
import { CheckCircle2, Award, Headphones, DatabaseZap } from 'lucide-react';

export const TrustBar: React.FC = () => {
  return (
    <div
      id="trust-bar"
      className="w-full border-y border-zinc-800/70 bg-zinc-950/80 backdrop-blur-xl py-6 relative z-20"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 lg:gap-24">
        {/* Item 1 */}
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00B900] flex-shrink-0" />
          <div>
            <span className="text-xs text-white tracking-widest uppercase font-semibold block">
              Live Arrival 100%
            </span>
            <span className="text-[11px] text-zinc-400 font-light">
              รับประกันการรอดชีวิต 100%
            </span>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-white tracking-widest uppercase font-semibold block">
              Premium Lineage
            </span>
            <span className="text-[11px] text-zinc-400 font-light">
              สายเลือดแท้ ฟอร์มประกวด
            </span>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-3">
          <Headphones className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-white tracking-widest uppercase font-semibold block">
              Lifetime Support
            </span>
            <span className="text-[11px] text-zinc-400 font-light">
              ที่ปรึกษาตลอดอายุการเลี้ยง
            </span>
          </div>
        </div>

        {/* Item 4 */}
        <div className="flex items-center gap-3">
          <DatabaseZap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-xs text-white tracking-widest uppercase font-semibold block">
              Real-time Database
            </span>
            <span className="text-[11px] text-zinc-400 font-light">
              ตัดสต็อกเรียลไทม์ แม่นยำ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
