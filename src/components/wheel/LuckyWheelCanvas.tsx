import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { WheelSlot } from '../../types/wheel';

interface LuckyWheelCanvasProps {
  slots: WheelSlot[];
  rotation: number;
  isSpinning: boolean;
  onSpin: () => void;
  disabled?: boolean;
}

export const LuckyWheelCanvas: React.FC<LuckyWheelCanvasProps> = ({
  slots,
  rotation,
  isSpinning,
  onSpin,
  disabled = false,
}) => {
  const needleRef = useRef<HTMLDivElement>(null);
  const totalSlots = Math.max(1, slots.length);
  const sliceAngle = 360 / totalSlots;
  const radius = 175;
  const center = 200;

  // Helper to calculate SVG pie slice arc path
  const getSlicePath = (index: number): string => {
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Generate outer rim LED light bulbs (alternating colors, blinking while spinning)
  const bulbCount = Math.max(16, totalSlots * 2);
  const bulbs = Array.from({ length: bulbCount }, (_, i) => {
    const angle = (i * (360 / bulbCount) - 90) * (Math.PI / 180);
    const bulbRadius = 190;
    const bx = center + bulbRadius * Math.cos(angle);
    const by = center + bulbRadius * Math.sin(angle);
    const isGold = i % 2 === 0;
    return { bx, by, isGold, id: i };
  });

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 max-w-[420px] max-h-[420px] mx-auto rounded-full bg-gradient-to-tr from-emerald-500/20 via-amber-500/20 to-emerald-500/10 blur-2xl -z-10 pointer-events-none" />

      {/* Needle / Indicator Ticker at 12 o'clock */}
      <div
        ref={needleRef}
        className={`absolute -top-3 z-30 flex flex-col items-center transition-transform ${
          isSpinning ? 'animate-bounce duration-100' : ''
        }`}
        style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))' }}
      >
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
          <path
            d="M18 42L4 10C2.5 7 4.5 3 8 3H28C31.5 3 33.5 7 32 10L18 42Z"
            fill="url(#needleGoldGrad)"
            stroke="#FEF08A"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="12" r="4.5" fill="#FFFFFF" stroke="#B45309" strokeWidth="1.5" />
          <defs>
            <linearGradient id="needleGoldGrad" x1="18" y1="3" x2="18" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wheel Container with border frame */}
      <div className="relative p-2.5 rounded-full bg-gradient-to-b from-amber-400 via-zinc-800 to-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.25)] border-4 border-amber-500/80">
        <div className="rounded-full bg-zinc-950 p-1.5 shadow-inner">
          <svg
            viewBox="0 0 400 400"
            className="w-[310px] h-[310px] sm:w-[380px] sm:h-[380px] transition-transform duration-[4500ms]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionTimingFunction: 'cubic-bezier(0.12, 0.92, 0.22, 1.0)',
            }}
          >
            <defs>
              {/* Beetle Jackpot Golden Gradient */}
              <linearGradient id="beetleGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Shimmer Pattern */}
              <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </radialGradient>
            </defs>

            {/* Wheel Background Base */}
            <circle cx={center} cy={center} r={radius} fill="#09090b" />

            {/* Slices */}
            {slots.map((slot, index) => {
              const midAngle = (index + 0.5) * sliceAngle - 90;
              const isBeetle = slot.isBeetle;

              return (
                <g key={slot.id || index}>
                  {/* Slice Wedge */}
                  <path
                    d={getSlicePath(index)}
                    fill={isBeetle ? 'url(#beetleGoldGrad)' : slot.color || '#059669'}
                    stroke="#18181b"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    className="transition-colors"
                  />

                  {/* Golden Sparkle Rim if Beetle Slot */}
                  {isBeetle && (
                    <path
                      d={getSlicePath(index)}
                      fill="none"
                      stroke="#FEF08A"
                      strokeWidth="3"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                  )}

                  {/* Text & Icon in Slice */}
                  <g
                    transform={`translate(${center}, ${center}) rotate(${midAngle})`}
                  >
                    {/* Text Anchor placed at ~60-70% of radius */}
                    <g transform={`translate(${radius * 0.65}, 0)`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform="rotate(90)"
                        fill={isBeetle ? '#000000' : slot.textColor || '#FFFFFF'}
                        className={`font-semibold tracking-wide ${
                          isBeetle
                            ? 'font-bold text-[13px] sm:text-[14px]'
                            : totalSlots > 8
                            ? 'text-[10px] sm:text-[11px]'
                            : 'text-[11px] sm:text-[12px]'
                        }`}
                        style={{
                          textShadow: isBeetle
                            ? '0 1px 2px rgba(255,255,255,0.4)'
                            : '0 1px 3px rgba(0,0,0,0.85)',
                        }}
                      >
                        {slot.label}
                      </text>

                      {/* Sublabel if room allows */}
                      {totalSlots <= 6 && slot.sublabel && (
                        <text
                          x="0"
                          y="15"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform="rotate(90)"
                          fill={isBeetle ? '#451A03' : 'rgba(255,255,255,0.75)'}
                          className="text-[9px] font-normal"
                        >
                          {slot.sublabel}
                        </text>
                      )}
                    </g>
                  </g>
                </g>
              );
            })}

            {/* Outer Rim Light Bulbs */}
            {bulbs.map((bulb) => (
              <circle
                key={bulb.id}
                cx={bulb.bx}
                cy={bulb.by}
                r="3.5"
                fill={
                  isSpinning
                    ? bulb.isGold
                      ? '#FDE047'
                      : '#34D399'
                    : bulb.isGold
                    ? '#F59E0B'
                    : '#10B981'
                }
                stroke="#18181b"
                strokeWidth="1"
                className={isSpinning ? 'animate-pulse' : ''}
                style={{
                  filter: isSpinning
                    ? `drop-shadow(0 0 4px ${bulb.isGold ? '#FDE047' : '#34D399'})`
                    : 'none',
                }}
              />
            ))}

            {/* Inner Ring Separator */}
            <circle
              cx={center}
              cy={center}
              r="44"
              fill="#18181b"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Center Spin Button Hub */}
        <button
          type="button"
          onClick={onSpin}
          disabled={isSpinning || disabled}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.6)] border-4 border-amber-200 flex flex-col items-center justify-center text-zinc-950 font-black tracking-wider transition-all duration-200 z-20 cursor-pointer ${
            isSpinning
              ? 'scale-95 brightness-90 cursor-not-allowed'
              : 'hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(245,158,11,0.85)]'
          }`}
          title="กดเพื่อหมุนวงล้อลุ้นด้วง"
        >
          <span className="text-xl sm:text-2xl leading-none">🪲</span>
          <span className="text-[11px] sm:text-xs uppercase font-extrabold mt-0.5 tracking-tight">
            {isSpinning ? 'กำลังหมุน' : 'หมุนเลย!'}
          </span>
          <span className="text-[9px] font-semibold text-amber-950/80 -mt-0.5">
            SPIN
          </span>
        </button>
      </div>

      {/* Hint underneath wheel */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>กดปุ่มตรงกลาง หรือปุ่มหมุนด้านล่างเพื่อลุ้นรางวัล</span>
      </div>
    </div>
  );
};
