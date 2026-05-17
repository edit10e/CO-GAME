'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');

  useEffect(() => {
    if (!isReady) return;

    // Reject direct browser loads with missing startparams 
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
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-sm font-medium text-slate-400 animate-pulse tracking-widest uppercase">
          Verifying Player Duel Link...
        </p>
      </div>
    );
  }

  if (authStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-950">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-4">
          ❌
        </div>
        <h1 className="text-2xl font-black text-red-500 tracking-tight mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          This match link is secure. Only the challenger and their target opponent can enter this arena.
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 max-w-sm mx-auto">
      <div className="w-full bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-slate-700/50 shadow-2xl text-center">
        <span className="text-[10px] font-bold tracking-widest bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full uppercase mb-4 inline-block">
          Active Arena Room
        </span>
        
        <h1 className="text-xl font-extrabold tracking-wide text-white mb-1">
          VS Duel Match
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Room ID: <span className="font-mono text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">{startParam}</span>
        </p>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/40 mb-6 flex items-center justify-between text-left">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Authenticated as</p>
            <p className="text-sm font-bold text-emerald-400">@{user?.username || 'Anonymous Player'}</p>
          </div>
          <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
        
        {/* Mobile First Web Game Engine/Canvas mounting space */}
        <div className="aspect-square w-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-4">
          <p className="text-sm font-bold text-slate-400 tracking-wide mb-1">Waiting for opponent...</p>
          <p className="text-xs text-slate-600">Game engine initializes here</p>
        </div>
      </div>
    </main>
  );
}