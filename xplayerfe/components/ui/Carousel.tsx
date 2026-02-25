
'use client';
import React, { useRef } from 'react';
import type { Media } from '../../domain/types';

export default function Carousel({ items }: { items: Media[] }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!items?.length) return null;
  return (
    <div className="relative w-full">
      <div
        ref={ref}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((m) => (
          <img
            key={String(m.id)}
            src={m.url}
            alt={m.alt ?? ''}
            className="h-64 w-full object-cover rounded-2xl flex-shrink-0 snap-center"
            style={{ aspectRatio: '4/3' }}
          />
        ))}
      </div>
      {/* simple dots */}
      <div className="flex justify-center mt-2 gap-1">
        {items.map((_, i) => (
          <span key={i} className="inline-block h-1.5 w-6 rounded-full bg-emerald-500/60" />
        ))}
      </div>
    </div>
  );
}
