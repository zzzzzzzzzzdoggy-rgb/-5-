import React, { useState } from 'react';
import { CONTACT_INFO } from '../data/products';
import { Phone } from 'lucide-react';

export const FloatingSpeedDial: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      {/* Sub Menus on Hover */}
      <div className="absolute bottom-full right-0 mb-3.5 flex flex-col gap-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-3 group-hover:translate-y-0">
        {/* Phone */}
        <a
          href={`tel:${CONTACT_INFO.phoneClean}`}
          className="w-12 h-12 bg-zinc-900 border border-zinc-700 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 hover:text-emerald-400 transition-all shadow-xl"
          title="โทรติดต่อด่วน"
        >
          <Phone className="w-5 h-5" />
        </a>

        {/* Facebook */}
        <a
          href={CONTACT_INFO.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-zinc-900 border border-zinc-700 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 hover:text-blue-400 transition-all shadow-xl"
          title="Facebook Fanpage"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href={CONTACT_INFO.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-zinc-900 border border-zinc-700 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 hover:text-pink-400 transition-all shadow-xl"
          title="Instagram"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
      </div>

      {/* Main Action Button (LINE) */}
      <a
        href={CONTACT_INFO.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#00B900] hover:bg-[#009900] text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,185,0,0.35)] transition-all hover:scale-110 active:scale-95"
        title="แชทสั่งซื้อผ่าน LINE"
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.101.254.033.649.015.82-.023.186-.113.681-.223 1.127-.146.593-.728 2.871.353 2.417 1.082-.455 5.834-3.424 7.994-5.918 1.839-2.122 2.768-4.392 2.768-8.646zm-16.14 3.195h-2.162c-.171 0-.311-.139-.311-.311V8.653c0-.171.14-.311.311-.311.172 0 .311.14.311.311v4.223h1.851c.172 0 .311.139.311.311 0 .172-.139.312-.311.312zm3.896-.312c0 .172-.14.312-.312.312-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311.172 0 .312.14.312.311v4.535zm2.716 0c0 .172-.139.312-.311.312h-2.164c-.172 0-.311-.14-.311-.312V8.653c0-.171.139-.311.311-.311h2.164c.172 0 .311.14.311.311 0 .172-.139.311-.311.311h-1.853v1.365h1.853c.172 0 .311.14.311.311 0 .172-.139.312-.311.312h-1.853v1.365h1.853c.172 0 .311.139.311.311zm3.842-2.589l-2.023 2.764c-.066.091-.173.136-.279.136-.089 0-.179-.036-.25-.107-.123-.122-.143-.314-.047-.456l2.008-2.744h-1.742c-.172 0-.312-.14-.312-.311V8.653c0-.171.14-.311.312-.311h2.333c.172 0 .311.14.311.311v4.256z" />
        </svg>
      </a>
    </div>
  );
};
