'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
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
        
        if (data.authorized) {
          setAuthStatus('authorized');
        } else {
          setAuthStatus('denied');
        }
      } catch {
        setAuthStatus('denied');
      }
    };

    verifyAccess();
  }, [isReady, initDataRaw, startParam]);

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Syncing Expose Match Data...
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-4 text-xl">
          🔒
        </div>
        <h1 className="text-xl font-black text-red-500 tracking-tight mb-2 uppercase">Arena Guarded</h1>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          You are not one of the designated combatants for this specific duel challenge link.
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto">
      <div className="w-full bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-md">
        <span className="text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full uppercase mb-4 inline-block border border-emerald-500/20">
          Match Verified
        </span>
        
        <h1 className="text-2xl font-black tracking-tight text-white mb-6">
          EXPOSE GAME ROOM
        </h1>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left mb-6 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Player Active</p>
            <p className="text-sm font-bold text-slate-200">@{user?.username || 'player'}</p>
          </div>
          <div className="h-2 w-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        </div>
        
        {/* Game Canvas Mounting Screen Box Container */}
        <div className="aspect-4/5 w-full bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center p-4">
          <p className="text-xs font-bold text-slate-400 animate-pulse">Lobby Setup Complete</p>
          <p className="text-[10px] text-slate-600 mt-1 font-mono">Mount your game canvas engine layer here</p>
        </div>
      </div>
    </main>
  );
}