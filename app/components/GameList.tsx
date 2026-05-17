'use client';

import { useState } from 'react';

interface GameListProps {
  isPlayer1: boolean;
  isPlayer2: boolean;
}

export default function GameList({ isPlayer1, isPlayer2 }: GameListProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const isParticipant = isPlayer1 || isPlayer2;

  return (
    <main className="fixed inset-0 w-screen h-screen bg-slate-950 p-6 flex flex-col justify-center items-center font-sans text-white select-none overflow-y-auto z-40">
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
      
      <div className="w-full max-w-xs flex flex-col gap-6 z-10 text-center">
        <div>
          <h1 className="text-3xl font-black tracking-wider text-amber-400 uppercase">🎮 เลือกเกมประลอง</h1>
          <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {isParticipant ? 'กรุณาเลือกหนึ่งเกมเพื่อเริ่มการปะทะ' : 'ผู้เล่นหลักกำลังพิจารณาเลือกเกม'}
          </p>
        </div>

        {/* รายการเกมแนวตั้ง 3 เกม */}
        <div className="flex flex-col gap-3.5 w-full">
          <button 
            disabled={!isParticipant}
            onClick={() => setActiveGame('xo')} 
            className="w-full bg-linear-to-r from-red-950/40 to-slate-900/80 border border-red-500/30 hover:border-red-500/60 active:scale-98 p-5 rounded-2xl flex items-center justify-between shadow-xl transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="text-left">
              <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors">เกม XO (Tic-Tac-Toe)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">ผลัดกันเดินหมากเพื่อเรียงแถว 3 ตัว</p>
            </div>
            <span className="text-2xl bg-slate-950 w-11 h-11 flex items-center justify-center rounded-xl border border-slate-800 shadow-inner">❌</span>
          </button>

          <button 
            disabled={!isParticipant}
            onClick={() => setActiveGame('dice')} 
            className="w-full bg-linear-to-r from-purple-950/40 to-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 active:scale-98 p-5 rounded-2xl flex items-center justify-between shadow-xl transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="text-left">
              <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">เกมทอยลูกเต๋า (Dice Battle)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">วัดดวงความเสี่ยงด้วยการทอยแต้มชนกัน</p>
            </div>
            <span className="text-2xl bg-slate-950 w-11 h-11 flex items-center justify-center rounded-xl border border-slate-800 shadow-inner">🎲</span>
          </button>

          <button 
            disabled={!isParticipant}
            onClick={() => setActiveGame('coin')} 
            className="w-full bg-linear-to-r from-blue-950/40 to-slate-900/80 border border-blue-500/30 hover:border-blue-500/60 active:scale-98 p-5 rounded-2xl flex items-center justify-between shadow-xl transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="text-left">
              <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">เกมหัวก้อย (Coin Flip)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">สุ่มเหรียญกำหนดชะตาในการเดิมพัน</p>
            </div>
            <span className="text-2xl bg-slate-950 w-11 h-11 flex items-center justify-center rounded-xl border border-slate-800 shadow-inner">🪙</span>
          </button>
        </div>

        {/* 🎯 สเตตัสระบุความเคลื่อนไหวสำหรับคนนอก */}
        {!isParticipant && !activeGame && (
          <div className="bg-slate-900/90 border border-amber-500/20 text-amber-400 text-xs font-black py-3.5 px-6 rounded-full shadow-2xl backdrop-blur-md">
            กำลังเลือกเกม...
          </div>
        )}

        {activeGame && (
          <div className="bg-slate-900/80 border border-emerald-500/20 text-emerald-400 text-xs font-bold py-3 px-4 rounded-xl backdrop-blur-sm animate-pulse">
            🚀 กำลังเปิดเข้าสู่ {activeGame.toUpperCase()} Engine...
          </div>
        )}
      </div>
    </main>
  );
}