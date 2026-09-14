import React, { useState } from 'react';
import { STORY_CONTENT } from '../data/products';
import { BookOpen, Compass, ShieldCheck, Thermometer, Droplets, Utensils, Award, Info } from 'lucide-react';

export const StorySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'anatomy' | 'care'>('overview');

  return (
    <section id="story" className="py-28 sm:py-36 bg-[#09090b] relative border-b border-zinc-900">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 tracking-[0.25em] uppercase text-xs font-bold mb-3 block">
            {STORY_CONTENT.heritageSubtitle}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white mb-6">
            {STORY_CONTENT.heritageTitle}
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-8"></div>
          <p className="text-zinc-400 leading-relaxed font-light text-base sm:text-lg">
            {STORY_CONTENT.storyP1}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-12">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ประวัติ & สตอรี่</span>
          </button>
          <button
            onClick={() => setActiveTab('anatomy')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'anatomy'
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>กายวิภาค 5 เขา</span>
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'care'
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>คู่มือการเลี้ยงดู</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
            <div className="space-y-6 text-zinc-300 font-light leading-relaxed text-sm sm:text-base">
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
                <h3 className="text-white font-serif text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  ราชันย์แห่งพงไพรทางภาคเหนือ
                </h3>
                <p className="text-zinc-400 text-sm">
                  {STORY_CONTENT.storyP2}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
                <h3 className="text-white font-serif text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  เสน่ห์และคุณค่าทางจิตใจ
                </h3>
                <p className="text-zinc-400 text-sm">
                  {STORY_CONTENT.storyP3}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">สกุล (Genus)</span>
                  <span className="text-amber-200 font-serif font-medium text-sm">Eupatorus</span>
                </div>
                <div className="flex-1 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">ชนิด (Species)</span>
                  <span className="text-emerald-300 font-serif font-medium text-sm">gracilicornis</span>
                </div>
                <div className="flex-1 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">ถิ่นกำเนิด</span>
                  <span className="text-white font-medium text-sm">ดอยสูงภาคเหนือ</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 aspect-[4/3] group">
              <img
                src="/images/hero.jpg"
                alt="กว่างซางเหนือ กว่าง 5 เขา"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
                    Museum Grade Specimen
                  </p>
                  <p className="text-sm text-zinc-300">
                    กว่างซางเหนือแท้ 100% จากแหล่งธรรมชาติที่อุดมสมบูรณ์ที่สุด
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Anatomy */}
        {activeTab === 'anatomy' && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-serif text-white mb-6 text-center">
              จุดเด่นทางสรีรวิทยาของกว่างซางเหนือ 5 เขา
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs mb-3">
                  01
                </div>
                <h4 className="text-white font-medium text-sm mb-2">เขาหน้าผาก (Cephalic Horn)</h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  เขาเดี่ยวด้านล่างที่โค้งยาวขึ้นสู่ด้านบน ใช้สำหรับงัด ดีด และข่มขวัญคู่ต่อสู้ ในตัวผู้เกรดประกวดจะมีความโค้งได้มุมและสัดส่วนที่งามไร้ที่ติ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                  02
                </div>
                <h4 className="text-white font-medium text-sm mb-2">เขาอก 4 แฉก (Thoracic Horns)</h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  เขาขนาดเล็ก 4 แฉกที่ยื่นออกจากแผ่นหลังส่วนอก โดย 2 แฉกบนชี้ขึ้นและ 2 แฉกล่างชี้ออกด้านข้าง คล้ายมงกุฎนักรบโบราณ
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-xs mb-3">
                  03
                </div>
                <h4 className="text-white font-medium text-sm mb-2">ปีกสีทองอำพัน (Amber Elytra)</h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  ปีกแข็งคู่หน้ามีสีเหลืองอำพันเงางามเป็นเอกลักษณ์ ตัดกับอกสีดำขลับ (Obsidian Black) สะท้อนแสงไฟอย่างหรูหรา
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
                  04
                </div>
                <h4 className="text-white font-medium text-sm mb-2">ขาทรงพลัง & เล็บเกาะ</h4>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  ข้อต่อขาแข็งแรงพร้อมหนามคมสำหรับยึดเกาะกิ่งไม้และเปลือกไม้ในป่าดอยสูง สามารถรับน้ำหนักและแรงกดได้มหาศาล
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Care Guide */}
        {activeTab === 'care' && (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-serif text-white mb-2 text-center">
              คู่มือการเลี้ยงดูและรักษาสำหรับมือใหม่
            </h3>
            <p className="text-zinc-400 text-xs text-center mb-8">
              เลี้ยงง่าย ไม่ส่งเสียงรบกวน ไม่มีกลิ่น และไม่ต้องใช้พื้นที่เยอะ
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-4">
                <Thermometer className="w-6 h-6 text-sky-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">อุณหภูมิที่เหมาะสม</h4>
                  <p className="text-emerald-400 text-xs font-semibold mb-2">20°C - 26°C</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    วางตู้เลี้ยงในห้องที่อากาศถ่ายเทสะดวก ไม่โดนแสงแดดโดยตรง ห้องแอร์สามารถเลี้ยงได้เป็นอย่างดี
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-4">
                <Droplets className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">ความชื้น & วัสดุรองพื้น</h4>
                  <p className="text-emerald-400 text-xs font-semibold mb-2">ความชื้น 65% - 75%</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    ฉีดพ่นละอองน้ำลงบนขี้เลื่อยหรือวัสดุรองวันละ 1-2 ครั้ง ให้ชื้นเล็กน้อยแต่ไม่แฉะ ป้องกันตัวแห้ง
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-start gap-4">
                <Utensils className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-medium text-sm mb-1">อาหารสำหรับด้วง</h4>
                  <p className="text-emerald-400 text-xs font-semibold mb-2">เยลลี่โปรตีน / ผลไม้หวาน</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    ให้เยลลี่ด้วง 1 ถ้วยอยู่ได้ 2-3 วัน สลับกับกล้วยน้ำว้าหรืออ้อยสด ปราศจากสารเคมี ยืดอายุขัยได้ยาวนาน
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
