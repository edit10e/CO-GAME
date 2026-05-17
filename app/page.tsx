'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');

  useEffect(() => {
    if (!isReady) return;

    if (!initDataRaw || !startParam) {
      setAuthStatus('denied');
      return;
    }

    const verifyAccess = async () => {
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initDataRaw, gameId: startParam }),
        });
        
        const data = await res.json();
        setAuthStatus(data.authorized ? 'authorized' : 'denied');
      } catch {
        setAuthStatus('denied');
      }
    };

    verifyAccess();
  }, [isReady, initDataRaw, startParam]);

  // Full-Screen Initial Sync State
  if (authStatus === 'loading') {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Full-Screen Access Denied Fallback State
  if (authStatus === 'denied') {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none">
        <div className="text-3xl mb-3">🔒</div>
        <h1 className="text-sm font-black tracking-widest uppercase text-red-500 mb-1">Arena Guarded</h1>
        <p className="text-[11px] text-slate-500 max-w-55 leading-relaxed">
          Access denied. This private matchmaking arena link is restricted.
        </p>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden select-none">
      
      {/* =========================================================================
          💥 VISUAL WALLPAPER LAYER: IMMERSIVE ANGULAR SPLIT
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex pointer-events-none">
        {/* Left Side: Deep Angled Red Gradient */}
        <div className="flex-1 bg-linear-to-br from-red-600 via-red-950 to-slate-950 [clip-path:polygon(0_0,100%_0,68%_100%,0_100%)]" />
        {/* Right Side: Deep Angled Blue Gradient */}
        <div className="flex-1 bg-linear-to-tl from-blue-600 via-blue-950 to-slate-950 [clip-path:polygon(32%_0,100%_0,100%_100%,0_100%)] ml-[-36vw]" />
      </div>

      {/* Decorative Golden Spline Strips Across Center seam */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-0 bottom-0 left-[48%] w-0.5 bg-linear-to-b from-transparent via-amber-500 to-transparent transform skew-x-[-18deg]" />
        <div className="absolute top-0 bottom-0 left-[52%] w-px bg-linear-to-b from-transparent via-amber-400 to-transparent transform skew-x-[-18deg]" />
      </div>

      {/* Center Floating VS Typography Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-7xl font-black italic tracking-wide text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)] opacity-95 tracking-wide uppercase font-sans">
          VS
        </h1>
      </div>

      {/* =========================================================================
          🎮 GAME ENGINE LAYOUT MOUNT ATTACHMENT HOOK
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full z-10 flex flex-col justify-between items-center p-6">
        
        {/* Top Section View Placeholder (Ready for your HUD components) */}
        <div className="w-full text-center" />

        {/* Center Section Canvas Layer (Inject your game system container here) */}
        <div className="w-full flex-1 flex items-center justify-center">
          {/* Your active interactive UI or game engine elements will reside inside this zone */}
        </div>

        {/* Bottom Section View Placeholder (Ready for controls/action parameters) */}
        <div className="w-full text-center" />

      </div>

    </main>
  );
}