'use client';

import { useState, useEffect } from 'react';

interface GameListProps {
  startParam: string;
  isPlayer1: boolean;
  isPlayer2: boolean;
  timeLeft: number;
  p1Choice: string | null;
  p2Choice: string | null;
  finalGame: string | null;
}

const GAMES_DB = [
  { id: 'xo', title: 'เกม XO (Tic-Tac-Toe)', emoji: '❌' },
  { id: 'dice', title: 'เกมทอยลูกเต๋า (Dice Battle)', emoji: '🎲' },
  { id: 'coin', title: 'เกมหัวก้อย (Coin Flip)', emoji: '🪙' }
];

export default function GameList({ startParam, isPlayer1, isPlayer2, timeLeft, p1Choice, p2Choice, finalGame }: GameListProps) {
  const isParticipant = isPlayer1 || isPlayer2;
  const [rouletteGame, setRouletteGame] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const handleSelectGame = async (gameId: string) => {
    const body: any = { gameId: startParam };
    if (isPlayer1) body.p1Choice = gameId;
    if (isPlayer2) body.p2Choice = gameId;

    await fetch('/api/match-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  useEffect(() => {
    if (p1Choice && p2Choice && !finalGame && !isSpinning) {
      if (p1Choice === p2Choice) {
        fetch('/api/match-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: startParam, finalGame: p1Choice }),
        });
      } else {
        setIsSpinning(true);
        let counter = 0;
        const choicesArray = [p1Choice, p2Choice];

        const interval = setInterval(() => {
          setRouletteGame(choicesArray[counter % 2]);
          counter++;
        }, 150);

        setTimeout(() => {
          clearInterval(interval);
          setIsSpinning(false);
          
          if (isPlayer1) {
            const luckyGame = choicesArray[Math.floor(Math.random() * 2)];
            fetch('/api/match-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gameId: startParam, finalGame: luckyGame }),
            });
          }
        }, 3000);
      }
    }
  }, [p1Choice, p2Choice, finalGame, startParam, isPlayer1, isSpinning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentActiveMatchGame = GAMES_DB.find(g => g.id === (isSpinning ? rouletteGame : finalGame));

  return (
    <main className="fixed inset-0 w-screen h-screen bg-slate-950 p-6 flex flex-col justify-center items-center font-sans text-white select-none overflow-y-auto z-40">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
      
      <div className="w-full max-w-xs flex flex-col gap-6 z-10 text-center">
        
        {/* สไตล์เวลาตรงกลางใต้หัวข้อแบบคลีนไม่มีพื้นหลังครอบ */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-black tracking-wider text-amber-400 uppercase">🎮 เลือกเกมประลอง</h1>
          <div className="font-mono text-sm text-amber-400 font-bold animate-pulse mt-0.5">
            ⏱️ เวลาเลือกเกม: {formatTime(timeLeft)}
          </div>
        </div>

        {/* ข้อความสถานะการเลือกแบบคลีน (ไม่มี Border) */}
        {(p1Choice || p2Choice) && (
          <div className="text-[11px] font-bold text-slate-400 flex justify-between px-2">
            <div>ผู้ท้าชิง: <span className="text-red-400 font-black">{p1Choice ? GAMES_DB.find(g=>g.id===p1Choice)?.emoji : 'กำลังเลือก...'}</span></div>
            <div>คู่ต่อสู้: <span className="text-blue-400 font-black">{p2Choice ? GAMES_DB.find(g=>g.id===p2Choice)?.emoji : 'กำลังเลือก...'}</span></div>
          </div>
        )}

        {/* ปุ่มเลือกเกมดั้งเดิม */}
        <div className="flex flex-col gap-3.5 w-full">
          {GAMES_DB.map((game) => {
            const isSelectedByMe = (isPlayer1 && p1Choice === game.id) || (isPlayer2 && p2Choice === game.id);
            return (
              <button 
                key={game.id}
                disabled={!isParticipant || !!(isPlayer1 ? p1Choice : p2Choice) || isSpinning || !!finalGame}
                onClick={() => handleSelectGame(game.id)} 
                className={`w-full bg-gradient-to-r from-slate-950/40 to-slate-900/80 p-5 rounded-2xl flex items-center justify-between border ${
                  isSelectedByMe ? 'border-emerald-400 bg-emerald-950/20' : 'border-slate-800/80'
                }`}
              >
                <div className="text-left">
                  <h3 className="text-base font-black text-white">{game.title}</h3>
                </div>
                <span className="text-2xl">{game.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* กล่องรายงานผลแอนิเมชันสุ่มแบบคลีนไม่มี Border รบกวนสายตา */}
        {isSpinning && currentActiveMatchGame && (
          <div className="py-2 flex flex-col items-center justify-center gap-1 animate-pulse">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">🎲 เลือกต่างกัน! กำลังสุ่ม...</span>
            <div className="text-lg font-black text-white">
              {currentActiveMatchGame.emoji} {currentActiveMatchGame.title}
            </div>
          </div>
        )}

        {!isSpinning && finalGame && currentActiveMatchGame && (
          <div className="py-2 flex flex-col items-center justify-center gap-1">
            <span className="text-xs font-black text-emerald-400 tracking-widest">🚀 เริ่มเกมประลอง!</span>
            <div className="text-base font-black text-white">
              {currentActiveMatchGame.emoji} {currentActiveMatchGame.title}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}