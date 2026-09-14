import React from 'react';
import { CONTACT_INFO } from '../data/products';
import { Phone, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 py-16 border-t border-zinc-900 relative z-10">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Brand */}
        <h2 className="text-2xl font-serif text-white tracking-[0.25em] mb-2">
          EUPATORUS.
        </h2>
        <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">
          Premium Five-Horned Rhinoceros Beetles & Exotic Specimens
        </p>

        {/* Contact Links Matching User Specifications 100% */}
        <div className="flex justify-center flex-wrap gap-6 sm:gap-8 mb-10">
          {/* Phone */}
          <a
            href={`tel:${CONTACT_INFO.phoneClean}`}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800"
          >
            <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">{CONTACT_INFO.phone}</span>
          </a>

          {/* LINE */}
          <a
            href={CONTACT_INFO.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-[#00B900] transition-colors group px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800"
          >
            <svg className="w-4 h-4 text-[#00B900] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.101.254.033.649.015.82-.023.186-.113.681-.223 1.127-.146.593-.728 2.871.353 2.417 1.082-.455 5.834-3.424 7.994-5.918 1.839-2.122 2.768-4.392 2.768-8.646zm-16.14 3.195h-2.162c-.171 0-.311-.139-.311-.311V8.653c0-.171.14-.311.311-.311.172 0 .311.14.311.311v4.223h1.851c.172 0 .311.139.311.311 0 .172-.139.312-.311.312zm3.896-.312c0 .172-.14.312-.312.312-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311.172 0 .312.14.312.311v4.535zm2.716 0c0 .172-.139.312-.311.312h-2.164c-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311h2.164c.172 0 .311.14.311.311 0 .172-.139.311-.311.311h-1.853v1.365h1.853c.172 0 .311.14.311.311 0 .172-.139.312-.311.312h-1.853v1.365h1.853c.172 0 .311.139.311.311zm3.842-2.589l-2.023 2.764c-.066.091-.173.136-.279.136-.089 0-.179-.036-.25-.107-.123-.122-.143-.314-.047-.456l2.008-2.744h-1.742c-.172 0-.312-.14-.312-.311V8.653c0-.171.14-.311.312-.311h2.333c.172 0 .311.14.311.311v4.256z" />
            </svg>
            <span className="text-xs font-medium">LINE: {CONTACT_INFO.lineId}</span>
          </a>

          {/* Facebook */}
          <a
            href={CONTACT_INFO.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors group px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800"
          >
            <svg className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-xs font-medium">FB: {CONTACT_INFO.facebookName}</span>
          </a>

          {/* Instagram */}
          <a
            href={CONTACT_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors group px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800"
          >
            <svg className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            <span className="text-xs font-medium">IG: {CONTACT_INFO.instagramHandle}</span>
          </a>
        </div>

        <p className="text-zinc-600 text-xs font-light">
          &copy; 2026 Eupatorus Premium Store. สงวนลิขสิทธิ์ทั้งหมด • จัดส่งตรงจากแหล่งเพาะพันธุ์มาตรฐาน
        </p>
      </div>
    </footer>
  );
};
