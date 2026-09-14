import React from 'react';
import { ArrowDown, Sparkles, Flame } from 'lucide-react';
import { Product } from '../types';

interface HeroSectionProps {
  products: Product[];
  onScrollToShop: () => void;
  onScrollToStory: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  products,
  onScrollToShop,
  onScrollToStory,
}) => {
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const set2 = products.find((p) => p.id === 'set-2');

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
    >
      {/* Cinematic Full-Screen Background Image */}
      <div className="absolute inset-0 z-0 group w-full h-full overflow-hidden">
        <img
          id="hero-img"
          src="/images/hero.jpg"
          alt="หน้าปกจ้าวแห่งแมลง กว่างซางเหนือ 5 เขา"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-[18000ms] ease-out scale-105 group-hover:scale-110 contrast-115 saturate-110 brightness-105"
        />
      </div>

      {/* Cinematic Dark Gradients: subtle top, crystal clear center, deep bottom */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/10 to-[#09090b] pointer-events-none"></div>
      <div className="absolute bottom-0 w-full h-2/3 z-10 bg-gradient-to-t from-[#09090b] via-[#09090b]/75 to-transparent pointer-events-none"></div>

      {/* Content Container */}
      <div className="w-full max-w-4xl mx-auto px-6 text-center relative z-20 flex flex-col items-center pt-24 pb-16">
        
        {/* Psychological Trigger: Scarcity & Season */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 border border-[#00B900]/40 rounded-full mb-8 backdrop-blur-md bg-black/60 shadow-[0_0_25px_rgba(0,185,0,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#00B900] shadow-[0_0_10px_#00B900] animate-pulse"></span>
          <p className="text-[#00B900] tracking-[0.2em] uppercase text-xs font-bold">
            เปิดฤดูกาล 2026 • โควต้าจำกัด
          </p>
          <span className="text-zinc-500 text-xs">|</span>
          <span className="text-zinc-300 text-xs font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            เหลือในคลัง {totalStock} ตัว
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-light tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl">
          จ้าวแห่งแมลง <br />
          <span className="font-serif italic text-amber-100/90 text-4xl sm:text-5xl md:text-7xl mt-3 block font-normal">
            แห่งขุนเขา
          </span>
        </h1>

        {/* Story Intro Text */}
        <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-light mx-auto drop-shadow-lg bg-black/35 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
          กว่างซางเหนือ (<em className="text-amber-200 font-serif">Eupatorus gracilicornis</em>) ราชันย์แห่งพงไพรที่มีเขาถึง 5 แฉกอันเป็นเอกลักษณ์ คัดสรรสายเลือดพรีเมียมที่สุดเพื่อนักสะสมตัวจริง จากยอดดอยสูงภาคเหนือของไทย
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            id="hero-explore-btn"
            onClick={onScrollToShop}
            className="w-full sm:w-auto px-10 py-4.5 bg-white text-black hover:bg-zinc-200 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Collection</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            id="hero-story-btn"
            onClick={onScrollToStory}
            className="w-full sm:w-auto px-8 py-4.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 rounded-full text-xs sm:text-sm font-medium tracking-wider transition-all backdrop-blur-md cursor-pointer"
          >
            ประวัติ & ข้อมูลสายพันธุ์
          </button>
        </div>

        {/* Quick Stock Strip */}
        <div className="mt-14 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400 bg-zinc-950/70 border border-zinc-800/80 px-6 py-2.5 rounded-full backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>เซท 1 ด้วงเขาสั้น: <strong className="text-white">{products[0]?.stock ?? 0} ตัว</strong></span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
            <span>เซท 2 เขายาวตัวท็อป: <strong className="text-red-400">{set2?.stock ?? 0} ตัวสุดท้าย!</strong></span>
          </div>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>เซท 3 ตัวเมีย: <strong className="text-white">{products[2]?.stock ?? 0} ตัว</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
