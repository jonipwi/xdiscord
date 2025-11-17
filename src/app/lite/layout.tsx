'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/utils/LanguageContext';

export default function LiteLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Simple header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-4 shadow-lg sticky top-0 z-10">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-amber-300">★</span>
              FairCoin Chat
              <span className="text-xs font-normal bg-white/20 px-2 py-1 rounded-full">Lite</span>
            </h1>
            <p className="text-sm text-emerald-100 mt-1">Light & Truth • Love & Mercy • Just & Peace</p>
          </div>
        </header>
        
        {/* Main content */}
        <main className="container mx-auto">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
