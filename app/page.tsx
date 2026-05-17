'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [debugLog, setDebugLog] = useState<string>('Initializing systems...');

  // Safe multi-underscore string extractor for room rules
  const firstUnderscore = startParam ? startParam.indexOf('_') : -1;
  const expectedPlayer1Id = firstUnderscore !== -1 ? startParam!.substring(0, firstUnderscore) : '';
  const expectedPlayer2Name = firstUnderscore !== -1 ? startParam!.substring(firstUnderscore + 1) : '';

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
          setDebugLog(`Success! Match authenticated and profiles loaded.`);
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
  }, [isReady, initDataRaw, startParam]);

  // Determine current viewing profile context for conditional UI highlight states
  const isHost = user?.id?.toString() === expectedPlayer1Id;

  // 1. Full-Screen Loading Layer
  if (authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
          Syncing Expose Match Data...
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col justify-between min-h-screen max-w-md mx-auto bg-slate-950 text-white p-4 font-sans select-none overflow-hidden">
      
      {/* Upper Layout Interface Frame wrapper */}
      <div className="w-full flex-1 flex flex-col justify-center gap-4 my-auto">
        
        {/* Dynamic Status Header */}
        <div className="text-center">
          <span className={`text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full uppercase border inline-block shadow-lg transition-all ${
            authStatus === 'authorized' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/5 animate-pulse' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {authStatus === 'authorized' ? '● Match Verified' : '🔒 Arena Guarded'}
          </span>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Expose Game</p>
        </div>

        {/* =========================================================================
            💥 PREMIUM VS INFRASTRUCTURE SPLIT CARD FRAME
           ========================================================================= */}
        <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-1.5 shadow-2xl backdrop-blur-xl overflow-hidden relative">
          
          {/* Angular split background layering matrix */}
          <div className="absolute inset-0 w-full h-full flex opacity-30 pointer-events-none">
            <div className="flex-1 bg-linear-to-br from-red-600 via-red-900 to-transparent [clip-path:polygon(0_0,100%_0,70%_100%,0_100%)]" />
            <div className="flex-1 bg-linear-to-tl from-blue-600 via-blue-900 to-transparent [clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)]" />
          </div>

          <div className="relative z-10 w-full flex items-center justify-between p-5 rounded-[2.2rem] bg-slate-950/40">
            
            {/* LEFT PLAYER: CHALLENGER HOST */}
            <div className="flex flex-col items-center flex-1 text-center">
              <span className="text-[8px] font-black tracking-widest text-red-400 uppercase mb-2">Host Player</span>
              
              {/* Dynamic Avatar Ring structure */}
              <div className={`w-18 h-18 rounded-full flex items-center justify-center p-0.5 border-2 relative transition-all shadow-xl bg-slate-900 ${
                isHost ? 'border-emerald-400 shadow-emerald-500/10' : 'border-red-500/40'
              }`}>
                <div className="w-full h-full rounded-full bg-linear-to-b from-slate-800 to-slate-950 flex items-center justify-center text-xl font-bold text-slate-300">
                  ⚔️
                </div>
                {isHost && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md uppercase scale-90">
                    YOU
                  </span>
                )}
              </div>
              
              <p className="text-xs font-black tracking-tight text-white mt-3 truncate max-w-27.5">
                {isHost ? `@${user?.username}` : `@master_sig`}
              </p>
              <p className="text-[8px] font-mono text-red-500/80 tracking-widest font-bold mt-1 uppercase bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                RANK #1024
              </p>
            </div>

            {/* SPLIT CENTER VERSUS GRAPHIC BADGE CONTAINER */}
            <div className="relative flex items-center justify-center px-2 z-20">
              <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center font-black text-sm tracking-tighter text-white italic shadow-2xl before:absolute before:w-12 before:h-0.5 before:bg-linear-to-r before:from-red-500 before:to-blue-500 before:-rotate-45">
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">VS</span>
              </div>
            </div>

            {/* RIGHT PLAYER: TARGET OPPONENT */}
            <div className="flex flex-col items-center flex-1 text-center">
              <span className="text-[8px] font-black tracking-widest text-blue-400 uppercase mb-2">Target Opponent</span>
              
              <div className={`w-18 h-18 rounded-full flex items-center justify-center p-0.5 border-2 relative transition-all shadow-xl bg-slate-900 ${
                (!isHost && authStatus === 'authorized') ? 'border-emerald-400 shadow-emerald-500/10' : 'border-blue-500/40'
              }`}>
                <div className="w-full h-full rounded-full bg-linear-to-b from-slate-800 to-slate-950 flex items-center justify-center text-xl font-bold text-slate-300">
                  👑
                </div>
                {(!isHost && authStatus === 'authorized') && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md uppercase scale-90">
                    YOU
                  </span>
                )}
              </div>
              
              <p className="text-xs font-black tracking-tight text-white mt-3 truncate max-w-27.5">
                @{expectedPlayer2Name || 'q_end'}
              </p>
              <p className="text-[8px] font-mono text-blue-500/80 tracking-widest font-bold mt-1 uppercase bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                RANK #1150
              </p>
            </div>

          </div>
        </div>

        {/* =========================================================================
            🎮 GAME INTERACTIVE CORE DISPLAY WINDOW LAYER
           ========================================================================= */}
        {authStatus === 'denied' ? (
          /* LOCKED WRAPPER INTERACTIVE SCREEN CARD FALLBACK */
          <div className="aspect-4/5 w-full bg-slate-900/20 border border-red-500/10 rounded-4xl flex flex-col items-center justify-center p-6 text-center shadow-inner backdrop-blur-sm">
            <p className="text-sm font-black text-red-500 tracking-tight uppercase mb-2">Lobby Access Revoked</p>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-60">
              You are authenticated as <span className="text-red-400 font-bold">@{user?.username || 'Guest'}</span>, which does not match the designated combatants for this arena match slot link.
            </p>
          </div>
        ) : (
          /* ACTIVE DYNAMIC ENGINE CANVAS HOLDER BOX VIEW */
          <div className="aspect-4/5 w-full bg-slate-950 rounded-4xl border border-slate-800/60 flex flex-col items-center justify-center p-4 shadow-inner group relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-emerald-500/2 to-transparent pointer-events-none" />
            
            <div className="h-2 w-2 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-ping mb-3" />
            <h2 className="text-sm font-black tracking-wide text-emerald-400 uppercase animate-pulse">
              Lobby Arena Connected. Get Ready!
            </h2>
            <p className="text-[10px] text-slate-600 mt-1 font-mono">
              Mount game runtime engine canvas here
            </p>
          </div>
        )}

      </div>

      {/* =========================================================================
          🔧 SECURE LIVE LOCAL DIAGNOSTIC CODE TERMINAL FOOTER
         ========================================================================= */}
      <div className="w-full mt-4 p-3 bg-slate-900/40 border border-slate-900 rounded-2xl text-left backdrop-blur-sm">
        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">🔧 Local Diagnostic Log</p>
        <p className="font-mono text-[10px] text-slate-400 break-all leading-normal bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-900">
          {debugLog}
        </p>
        <div className="flex justify-between items-center mt-1.5 px-0.5 text-[8px] font-mono text-slate-600 font-bold">
          <span>Active Session ID: {user?.id || 'Unidentified'}</span>
          <span>Status: {authStatus.toUpperCase()}</span>
        </div>
      </div>

    </main>
  );
}