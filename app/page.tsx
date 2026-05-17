'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [matchState, setMatchState] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  // Image load tracking states for fallback rendering
  const [p1ImgError, setP1ImgError] = useState(false);
  const [p2ImgError, setP2ImgError] = useState(false);

  // Multi-underscore string extractor for room parameters
  const firstUnderscore = startParam ? startParam.indexOf('_') : -1;
  const expectedPlayer1Id = firstUnderscore !== -1 ? startParam!.substring(0, firstUnderscore) : '';
  const expectedPlayer2Name = firstUnderscore !== -1 ? startParam!.substring(firstUnderscore + 1) : '';

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

  // Determine role access criteria
  const currentUserId = user?.id?.toString() || '';
  const currentUsername = user?.username || '';

  const isPlayer1 = currentUserId === expectedPlayer1Id;
  const isPlayer2 = currentUsername.toLowerCase() === expectedPlayer2Name.toLowerCase();

  // Primary Avatar URL strings
  const p1Avatar = isPlayer1 && user?.photo_url 
    ? user.photo_url 
    : `https://t.me/i/userpic/320/master_sig.jpg`;

  const p2Avatar = isPlayer2 && user?.photo_url 
    ? user.photo_url 
    : `https://t.me/i/userpic/320/${expectedPlayer2Name}.jpg`;

  // String letter extractions for profile fallback initials
  const p1Initial = isPlayer1 && user?.username 
    ? user.username.charAt(0).toUpperCase() 
    : 'M';
    
  const p2Initial = expectedPlayer2Name 
    ? expectedPlayer2Name.charAt(0).toUpperCase() 
    : 'P';

  // Full-Screen Loading
  if (authStatus === 'loading') {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Full-Screen Gatekeeper Protection
  if (authStatus === 'denied') {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none">
        <div className="text-3xl mb-3">🔒</div>
        <h1 className="text-sm font-black tracking-widest uppercase text-red-500 mb-1">Arena Guarded</h1>
        {/* Updated: max-w-[220px] -> max-w-55 */}
        <p className="text-[11px] text-slate-500 max-w-55 leading-relaxed">
          Access denied. This private arena link is exclusively restricted to the designated fighters.
        </p>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden select-none font-sans">
      
      {/* =========================================================================
          💥 PERFECT 50:50 BACKGROUND SPLIT LAYER (Tailwind v4 bg-linear)
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex pointer-events-none z-0">
        {/* Left Half: Host Red Arena */}
        <div className="w-1/2 h-full bg-linear-to-b from-red-600 via-red-950 to-slate-950 border-r border-amber-500/30" />
        {/* Right Half: Opponent Blue Arena */}
        <div className="w-1/2 h-full bg-linear-to-b from-blue-600 via-blue-950 to-slate-950" />
      </div>

      {/* Diagonal Overlay Seam Element */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-10">
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-linear-to-b from-amber-400 via-white to-transparent transform -skew-x-12" />
      </div>

      {/* =========================================================================
          👥 INTERACTIVE PLAYERS OVERLAY MATRIX
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full z-20 flex flex-col justify-between py-16 px-4">
        
        {/* Top Header Identity HUD */}
        <div className="w-full text-center drop-shadow-md">
          <p className="text-[11px] font-black tracking-widest text-amber-400 uppercase">
            {matchState === 'accepted' ? '⚡ CLASH ACTIVE ⚡' : '🔥 DUEL PENDING 🔥'}
          </p>
        </div>

        {/* Center Avatars Split Screen Grid Layout Row */}
        <div className="w-full flex items-center justify-center relative my-auto">
          
          {/* PLAYER 1 CONTAINER (LEFT) */}
          <div className="flex flex-col items-center flex-1 text-center pr-4">
            <div className={`w-24 h-24 rounded-full p-1 bg-slate-950/80 border-2 shadow-2xl transition-all flex items-center justify-center overflow-hidden ${
              isPlayer1 ? 'border-emerald-400 animate-pulse' : 'border-red-500/60'
            }`}>
              {!p1ImgError ? (
                <img 
                  src={p1Avatar} 
                  alt="Challenger" 
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                  onError={(e) => {
                    // Retain your precise required baseline fallback logic
                    (e.target as HTMLImageElement).src = "https://t.me/i/userpic/320/master_sig.jpg";
                    // Then trigger the visual letter fallback hook
                    setP1ImgError(true);
                  }}
                />
              ) : (
                /* Dynamic First Letter Fallback Interface Node */
                <span className="text-3xl font-black tracking-tighter text-red-400 font-mono select-none">
                  {p1Initial}
                </span>
              )}
            </div>
            {/* Updated: max-w-[140px] -> max-w-35 */}
            <p className="text-sm font-black tracking-tight text-white mt-3 drop-shadow-md truncate max-w-35">
              {isPlayer1 ? `@${user?.username}` : `@master_sig`}
            </p>
            <span className="text-[9px] font-black tracking-widest text-red-400 uppercase mt-0.5 opacity-80">CHALLENGER</span>
          </div>

          {/* ABSOLUTE CENTER VS GLOW BADGE */}
          <div className="absolute z-30 transform -translate-y-4">
            <div className="w-14 h-14 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center font-black text-2xl tracking-tighter text-white italic shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              VS
            </div>
          </div>

          {/* PLAYER 2 CONTAINER (RIGHT) */}
          <div className="flex flex-col items-center flex-1 text-center pl-4">
            <div className={`w-24 h-24 rounded-full p-1 bg-slate-950/80 border-2 shadow-2xl transition-all flex items-center justify-center overflow-hidden ${
              isPlayer2 ? 'border-emerald-400 animate-pulse' : 'border-blue-500/60'
            }`}>
              {!p2ImgError ? (
                <img 
                  src={p2Avatar} 
                  alt="Opponent" 
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://t.me/i/userpic/320/BotFather.jpg";
                    setP2ImgError(true);
                  }}
                />
              ) : (
                /* Dynamic First Letter Fallback Interface Node */
                <span className="text-3xl font-black tracking-tighter text-blue-400 font-mono select-none">
                  {p2Initial}
                </span>
              )}
            </div>
            {/* Updated: max-w-[140px] -> max-w-35 */}
            <p className="text-sm font-black tracking-tight text-white mt-3 drop-shadow-md truncate max-w-35">
              @{expectedPlayer2Name}
            </p>
            <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase mt-0.5 opacity-80">OPPONENT</span>
          </div>

        </div>

        {/* =========================================================================
            🎮 DYNAMIC CONDITIONAL HUD ACTIONS FOOTER
           ========================================================================= */}
        <div className="w-full max-w-xs mx-auto flex flex-col items-center justify-center z-30">
          
          {matchState === 'accepted' && (
            <div className="bg-slate-950/90 border border-emerald-500/30 text-emerald-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl animate-bounce backdrop-blur-md">
              🚀 Game is in progress...
            </div>
          )}

          {matchState === 'rejected' && (
            <div className="bg-slate-950/90 border border-red-500/30 text-red-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md">
              ❌ Challenge Cancelled
            </div>
          )}

          {matchState === 'pending' && (
            <>
              {isPlayer2 ? (
                /* SCREEN FOR OPPONENT (PLAYER 2): INTERACTIVE DECISION CONTROLS */
                <div className="flex items-center gap-4 w-full px-2">
                  <button 
                    onClick={() => setMatchState('rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black tracking-widest uppercase py-4 rounded-2xl shadow-xl transition-all border border-red-500/40"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => setMatchState('accepted')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black tracking-widest uppercase py-4 rounded-2xl shadow-xl transition-all shadow-emerald-500/10"
                  >
                    Accept
                  </button>
                </div>
              ) : isPlayer1 ? (
                /* SCREEN FOR HOST (PLAYER 1): WAITING HUD STATE */
                <div className="bg-slate-950/80 border border-slate-800 text-slate-400 font-bold text-[10px] tracking-widest uppercase py-3 px-6 rounded-xl backdrop-blur-md animate-pulse text-center">
                  Waiting for @{expectedPlayer2Name} to respond...
                </div>
              ) : (
                /* RECONCILIATION GATE: FALLBACK PROGRESS VIEW */
                <div className="bg-slate-950/90 border border-amber-500/20 text-amber-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md">
                  🚀 Game is in progress...
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </main>
  );
}