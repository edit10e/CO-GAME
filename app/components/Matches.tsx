'use client';

import { useState } from 'react';

interface MatchesProps {
  user: any;
  isPlayer1: boolean;
  isPlayer2: boolean;
  expectedPlayer2Name: string;
  matchState: 'pending' | 'accepted' | 'rejected' | 'expired';
  setMatchState: (state: 'pending' | 'accepted' | 'rejected' | 'expired') => void;
  timeLeft: number;
}

export default function Matches({
  user,
  isPlayer1,
  isPlayer2,
  expectedPlayer2Name,
  matchState,
  setMatchState,
  timeLeft,
}: MatchesProps) {
  const [p1ImgError, setP1ImgError] = useState(false);
  const [p2ImgError, setP2ImgError] = useState(false);

  const p1Avatar = isPlayer1 && user?.photo_url ? user.photo_url : `https://t.me/i/userpic/320/master_sig.jpg`;
  const p2Avatar = isPlayer2 && user?.photo_url ? user.photo_url : `https://t.me/i/userpic/320/${expectedPlayer2Name}.jpg`;

  const p1Initial = isPlayer1 && user?.username ? user.username.charAt(0).toUpperCase() : 'M';
  const p2Initial = expectedPlayer2Name ? expectedPlayer2Name.charAt(0).toUpperCase() : 'P';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 w-screen h-screen select-none font-sans overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 w-full h-full flex pointer-events-none z-0">
        <div className="absolute inset-0 w-full h-full bg-linear-to-b from-red-600 via-red-950 to-slate-950 [clip-path:polygon(0_0,55%_0,45%_100%,0_100%)] z-10" />
        <div className="absolute inset-0 w-full h-full bg-linear-to-b from-blue-600 via-blue-950 to-slate-950 z-0" />
      </div>

      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-10">
        <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-linear-to-b from-amber-400 via-white to-transparent transform -translate-x-1/2 -skew-x-6" />
      </div>

      <div className="absolute inset-0 w-full h-full z-20 flex flex-col justify-between py-16 px-4">
        {/* หัวข้อเกมและเวลาตรงกลาง */}
        <div className="w-full text-center drop-shadow-lg flex flex-col items-center gap-1.5">
          <p className="text-3xl font-black tracking-wider text-amber-400 uppercase">🔥 เกมสู้ 🔥</p>
          {matchState === 'pending' && (
            <div className="bg-slate-950/60 border border-red-500/30 px-4 py-1.5 rounded-full font-mono text-sm tracking-widest text-red-400 font-bold shadow-md animate-pulse">
              ⏱️ หมดเวลาตอบรับใน {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* บอร์ดโปรไฟล์ประจัญบาน VS */}
        <div className="w-full flex items-center justify-center relative my-auto">
          <div className="flex flex-col items-center flex-1 text-center pr-4">
            <div className={`w-24 h-24 rounded-full p-1 bg-slate-950/80 border-2 shadow-2xl flex items-center justify-center overflow-hidden ${
              isPlayer1 ? 'border-emerald-400 animate-pulse' : 'border-red-500/60'
            }`}>
              {!p1ImgError ? (
                <img src={p1Avatar} alt="Challenger" className="w-full h-full rounded-full object-cover bg-slate-900" onError={() => setP1ImgError(true)} />
              ) : (
                <span className="text-3xl font-black text-red-400 font-mono">{p1Initial}</span>
              )}
            </div>
            <p className="text-sm font-black text-white mt-3 truncate max-w-35">{isPlayer1 ? `@${user?.username}` : `@master_sig`}</p>
            <span className="text-[9px] font-black text-red-400 tracking-widest uppercase mt-0.5 opacity-80">ผู้ท้าชิง</span>
          </div>

          <div className="absolute z-30 transform -translate-y-4">
            <div className="w-14 h-14 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center font-black text-2xl text-white italic">VS</div>
          </div>

          <div className="flex flex-col items-center flex-1 text-center pl-4">
            <div className={`w-24 h-24 rounded-full p-1 bg-slate-950/80 border-2 shadow-2xl flex items-center justify-center overflow-hidden ${
              isPlayer2 ? 'border-emerald-400 animate-pulse' : 'border-blue-500/60'
            }`}>
              {!p2ImgError ? (
                <img src={p2Avatar} alt="Opponent" className="w-full h-full rounded-full object-cover bg-slate-900" onError={() => setP2ImgError(true)} />
              ) : (
                <span className="text-3xl font-black text-blue-400 font-mono">{p2Initial}</span>
              )}
            </div>
            <p className="text-sm font-black text-white mt-3 truncate max-w-35">@{expectedPlayer2Name}</p>
            <span className="text-[9px] font-black text-blue-400 tracking-widest uppercase mt-0.5 opacity-80">คู่ต่อสู้</span>
          </div>
        </div>

        {/* ปุ่มควบคุมและข้อความสถานะ */}
        <div className="w-full max-w-xs mx-auto flex flex-col items-center justify-center z-30">
          {matchState === 'rejected' && (
            <div className="bg-slate-950/90 border border-red-500/30 text-red-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md">
              ❌ ถูกปฏิเสธคำท้า
            </div>
          )}

          {matchState === 'expired' && (
            <div className="bg-slate-950/90 border border-amber-500/30 text-amber-500 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md">
              ⏳ หมดเวลาตอบรับคำท้า
            </div>
          )}

          {matchState === 'pending' && (
            <>
              {isPlayer2 ? (
                <div className="flex items-center gap-4 w-full px-2">
                  <button onClick={() => setMatchState('rejected')} className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black tracking-widest uppercase py-4 rounded-2xl shadow-xl border border-red-500/40">ปฏิเสธ</button>
                  <button onClick={() => setMatchState('accepted')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black tracking-widest uppercase py-4 rounded-2xl shadow-xl">ยอมรับ</button>
                </div>
              ) : isPlayer1 ? (
                <div className="bg-slate-950/80 border border-slate-800 text-slate-400 font-bold text-xs tracking-wide py-3 px-6 rounded-xl backdrop-blur-md animate-pulse text-center">
                  กำลังรอการตอบกลับจาก @{expectedPlayer2Name}...
                </div>
              ) : (
                <div className="bg-slate-950/90 border border-amber-500/20 text-amber-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md text-center">
                  รอการตอบกลับ
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}