'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [debugLog, setDebugLog] = useState<string>('Initializing systems...');

  // Parse who should be in this lobby based on the URL parameter string
  const [expectedPlayer1, expectedPlayer2] = startParam ? startParam.split('_') : ['?', '?'];

  useEffect(() => {
    if (!isReady) return;

    if (!initDataRaw || !startParam) {
      setAuthStatus('denied');
      setDebugLog(`Missing payload. initDataRaw: ${initDataRaw ? '✅' : '❌'}, startParam: ${startParam || 'none'}`);
      return;
    }

    const verifyAccess = async () => {
      try {
        setDebugLog(`Verifying credentials for room: ${startParam}...`);
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initDataRaw, gameId: startParam }),
        });
        
        const data = await res.json();
        
        if (data.authorized) {
          setAuthStatus('authorized');
          setDebugLog(`Success! Authorized as @${user?.username || 'unknown'}`);
        } else {
          setAuthStatus('denied');
          setDebugLog(`Server rejected authorization. Error: ${data.error || 'Unknown'}`);
        }
      } catch (err: any) {
        setAuthStatus('denied');
        setDebugLog(`Network error: ${err.message || err}`);
      }
    };

    verifyAccess();
  }, [isReady, initDataRaw, startParam, user]);

  // Loading Screen Layout
  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Syncing Expose Match Data...
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col justify-between min-h-screen p-4 max-w-md mx-auto bg-slate-950 text-white">
      {/* Dynamic Content Window Card Frame */}
      <div className="flex-1 flex flex-col justify-center w-full my-auto">
        {authStatus === 'denied' ? (
          /* ================= DENIED ARENA STATE ================= */
          <div className="w-full bg-slate-900/40 border border-red-500/20 p-6 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-md">
            <span className="text-[10px] font-black tracking-widest bg-red-500/10 text-red-400 px-3 py-1 rounded-full uppercase mb-6 inline-block border border-red-500/20">
              Arena Guarded
            </span>
            
            {/* Versus Layout Interface in Denied Screen */}
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-900 mb-6">
              <div className="text-center flex-1">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Challenger ID</p>
                <p className="text-xs font-bold text-slate-300 truncate max-w-[100px] mx-auto">{expectedPlayer1}</p>
              </div>
              
              <div className="font-black text-red-500 text-sm px-3 tracking-tighter italic animate-pulse">VS</div>
              
              <div className="text-center flex-1">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Target Opponent</p>
                <p className="text-xs font-bold text-slate-300 truncate max-w-[100px] mx-auto">@{expectedPlayer2}</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs px-2 leading-relaxed">
              You are signed in as <span className="text-red-400 font-bold">@{user?.username || 'Guest'}</span>.<br />
              This specific arena room is restricted exclusively to the players shown above.
            </p>
          </div>
        ) : (
          /* ================= AUTHORIZED GAME PLAY SCREEN ================= */
          <div className="w-full bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-md">
            <span className="text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full uppercase mb-6 inline-block border border-emerald-500/20">
              Match Verified
            </span>
            
            {/* Beautiful Left/Right Versus Visual Design Split */}
            <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 relative overflow-hidden">
              <div className={`text-center flex-1 z-10 ${user?.id?.toString() === expectedPlayer1 ? 'text-emerald-400' : 'text-slate-400'}`}>
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Host Player</p>
                <p className="text-xs font-black truncate max-w-[100px] mx-auto">
                  {user?.id?.toString() === expectedPlayer1 ? `📱 @${user?.username}` : `UID: ${expectedPlayer1}`}
                </p>
              </div>
              
              <div className="font-black text-white text-base px-4 tracking-widest italic bg-slate-900 py-1 rounded-full border border-slate-800 shadow-xl z-10 mx-2 scale-90">
                VS
              </div>
              
              <div className={`text-center flex-1 z-10 ${user?.username?.toLowerCase() === expectedPlayer2.toLowerCase() ? 'text-emerald-400' : 'text-slate-400'}`}>
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Opponent</p>
                <p className="text-xs font-black truncate max-w-[100px] mx-auto">@{expectedPlayer2}</p>
              </div>
            </div>
            
            {/* Game Canvas Container Shell Frame */}
            <div className="aspect-[4/5] w-full bg-slate-950 rounded-3xl border border-slate-800/80 flex flex-col items-center justify-center p-4 shadow-inner">
              <div className="h-2 w-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-ping mb-3" />
              <p className="text-xs font-bold text-slate-300 tracking-wide">Lobby Arena Connected</p>
              <p className="text-[10px] text-slate-600 mt-1 font-mono">Mount game runtime engine canvas here</p>
            </div>
          </div>
        )}
      </div>

      {/* ================= DIAGNOSTIC LIVE RUNTIME DEBUG LOG ================= */}
      <div className="w-full mt-4 p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl text-left">
        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">🔧 Local Diagnostic Log</p>
        <p className="font-mono text-[10px] text-slate-400 break-all leading-normal bg-slate-950/50 p-2 rounded border border-slate-900">
          {debugLog}
        </p>
        <div className="flex justify-between items-center mt-1 text-[8px] font-mono text-slate-600">
          <span>Active Session ID: {user?.id || 'Unidentified'}</span>
          <span>Status: {authStatus.toUpperCase()}</span>
        </div>
      </div>
    </main>
  );
}