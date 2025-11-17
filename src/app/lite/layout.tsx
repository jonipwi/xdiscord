'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { LanguageProvider } from '@/utils/LanguageContext';

export default function LiteLayout({ children }: { children: ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (containerRef.current && document.fullscreenEnabled) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.log('Fullscreen not available:', error);
      }
    };

    enterFullscreen();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <LanguageProvider>
      <div ref={containerRef} className="min-h-screen bg-gray-50">
        {/* Simple header */}
        <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-4 shadow-lg sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-amber-300">✨</span>
                FairCoin
                <span className="text-xs font-normal bg-white/20 px-2 py-1 rounded-full">Lite</span>
              </h1>
              <p className="text-sm text-emerald-100 mt-1">Light & Truth • Love & Mercy • Just & Peace</p>
            </div>
            
            {/* Fullscreen toggle button */}
            <button 
              onClick={toggleFullscreen}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 size={28} className="text-white" />
              ) : (
                <Maximize2 size={28} className="text-white" />
              )}
            </button>
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
