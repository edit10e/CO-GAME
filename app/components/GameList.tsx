'use client';

import { useState, useEffect } from 'react';

interface GameListProps {
  isPlayer1: boolean;
  isPlayer2: boolean;
  timeLeft: number;
  expectedPlayer2Name: string;
}

// รายการคีย์ข้อมูลอ้างอิงชื่อเกมภาษาไทย
const GAMES_DB = [
  { id: 'xo', title: 'เกม XO (Tic-Tac-Toe)', emoji: '❌' },
  { id: 'dice', title: 'เกมทอยลูกเต๋า (Dice Battle)', emoji: '🎲' },
  { id: 'coin', title: 'เกมหัวก้อย (Coin Flip)', emoji: '🪙' }
];

export default function GameList({ isPlayer1, isPlayer2, timeLeft, expectedPlayer2Name }: GameListProps) {
  const isParticipant = isPlayer1 || isPlayer2;

  // จำลองสถานะการโหวตเลือกเกมของทั้งสองฝั่ง (ในการใช้งานจริงข้อมูลส่วนนี้จะถูก Sync มาจาก Backend)
  const [p1Choice, setP1Choice] = useState<string | null>(null);
  const [p2Choice, setP2Choice] = useState<string | null>(null);

  const [rouletteGame, setRouletteGame] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [finalGame, setFinalGame] = useState<string | null>(null);

  // ฟังฟังก์ชันเมื่อมีการคลิกเลือกปุ่มเกม
  const handleSelectGame = (gameId: string) => {
    if (isPlayer1) {
      setP1Choice(gameId);
      // ตัวอย่างจำลอง: แกล้งทำเป็นว่าผู้เล่น 2 ดันเลือกอีกเกมเพื่อให้ระบบเข้า Loop สุ่มแอนิเมชันชะตาลิขิต
      if (!p2Choice) setP2Choice(gameId === 'xo' ? 'dice' : 'xo');
    }
    if (isPlayer2) {
      setP2Choice(gameId);
      if (!p1Choice) setP1Choice(gameId === 'xo' ? 'coin' : 'xo');
    }
  };

  // ดักจับจับคู่โหวต: เมื่อทั้ง 2 ฝั่งลงคะแนนเสียงเรียบร้อยแล้ว
  useEffect(() => {
    if (p1Choice && p2Choice) {
      if (p1Choice === p2Choice) {
        // กรณีใจตรงกัน -> เลือกเกมนั้นทันทีไม่ต้องสุ่ม
        setFinalGame(p1Choice);
      } else {
        // กรณีเลือกต่างกัน -> เริ่มทำแอนิเมชันสลับบอร์ดลุ้นดวง (Roulette Match Animation)
        setIsSpinning(true);
        let counter = 0;
        const choicesArray = [p1Choice, p2Choice];

        const interval = setInterval(() => {
          setRouletteGame(choicesArray[counter % 2]);
          counter++;
        }, 150); // ความเร็วในการสลับป้ายตัวเลือก

        // หยุดสุ่มหลังวิ่งสลับไปแล้วเป็นเวลา 3 วินาที
        setTimeout(() => {
          clearInterval(interval);
          setIsSpinning(false);
          // สุ่มดวงผลลัพธ์สุดท้ายจาก 1 ใน 2 เกมที่เลือกมา
          const luckyGame = choicesArray[Math.floor(Math.random() * 2)];
          setFinalGame(luckyGame);
        }, 3000);
      }
    }
  }, [p1Choice, p2Choice]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ดึงรายละเอียดของข้อมูลเกมที่กำลังสุ่มหรือเลือกได้มาแสดงข้อความ
  const currentActiveMatchGame = GAMES_DB.find(g => g.id === (isSpinning ? rouletteGame : finalGame));

  return (
    <main className="fixed inset-0 w-screen h-screen bg-slate-950 p-6 flex flex-col justify-center items-center font-sans text-white select-none overflow-y-auto z-40">
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
      
      <div className="w-full max-w-xs flex flex-col gap-6 z-10 text-center">
        
        {/* ⏱️ ส่วนหัวข้อหลักจัดตำแหน่งเวลากึ่งกลางตัวเลขเท่ากันทุกเครื่อง */}
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-3xl font-black tracking-wider text-amber-400 uppercase">🎮 เลือกเกมประลอง</h1>
          <div className="bg-slate-900/90 border border-amber-500/30 px-4 py-1.5 rounded-full font-mono text-sm tracking-widest text-amber-400 font-bold shadow-lg shadow-amber-500/5 animate-pulse">
            ⏱️ เวลาเลือกเกม: {formatTime(timeLeft)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {isParticipant ? 'กรุณาเลือกหนึ่งเกมเพื่อเริ่มการปะทะ (หมดเวลาใน 3 นาที)' : 'ผู้เล่นหลักกำลังพิจารณาเลือกเกม'}
          </p>
        </div>

        {/* 📊 บอร์ดแสดงข้อมูลทางเลือกโหวตเมื่อเริ่มมีการกดส่งข้อมูลเข้ามา */}
        {(p1Choice || p2Choice) && (
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-400">
            <div>ฝ่ายท้าชิง: <span className="text-red-400 font-black">{p1Choice ? GAMES_DB.find(g=>g.id===p1Choice)?.emoji : 'กำลังเลือก...'}</span></div>
            <div className="w-[1px] h-4 bg-slate-800" />
            <div>ฝ่ายตั้งรับ: <span className="text-blue-400 font-black">{p2Choice ? GAMES_DB.find(g=>g.id===p2Choice)?.emoji : 'กำลังเลือก...'}</span></div>
          </div>
        )}

        {/* รายการเกมแนวตั้ง 3 เกม */}
        <div className="flex flex-col gap-3.5 w-full">
          {GAMES_DB.map((game) => {
            const isSelectedByMe = (isPlayer1 && p1Choice === game.id) || (isPlayer2 && p2Choice === game.id);
            return (
              <button 
                key={game.id}
                disabled={!isParticipant || !!(isPlayer1 ? p1Choice : p2Choice) || isSpinning || !!finalGame}
                onClick={() => handleSelectGame(game.id)} 
                className={`w-full bg-linear-to-r from-slate-950/40 to-slate-900/80 p-5 rounded-2xl flex items-center justify-between shadow-xl transition-all group border ${
                  isSelectedByMe 
                    ? 'border-emerald-400 bg-emerald-950/20 shadow-emerald-500/5' 
                    : 'border-slate-800/80 hover:border-slate-700 disabled:opacity-50 disabled:pointer-events-none'
                }`}
              >
                <div className="text-left">
                  <h3 className={`text-base font-black text-white ${isSelectedByMe ? 'text-emerald-400' : 'group-hover:text-amber-400'} transition-colors`}>
                    {game.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {game.id === 'xo' && 'ผลัดกันเดินหมากเพื่อเรียงแถว 3 ตัว'}
                    {game.id === 'dice' && 'วัดดวงความเสี่ยงด้วยการทอยแต้มชนกัน'}
                    {game.id === 'coin' && 'สุ่มเหรียญกำหนดชะตาในการเดิมพัน'}
                  </p>
                </div>
                <span className="text-2xl bg-slate-950 w-11 h-11 flex items-center justify-center rounded-xl border border-slate-800 shadow-inner">
                  {game.emoji}
                </span>
              </button>
            );
          })}
        </div>

        {/* 🎰 เลเยอร์แอนิเมชันเมื่อเข้าสิทธิ์สุ่มดวงหรือโหลดเข้าเครื่อง Engine เกม */}
        {isSpinning && currentActiveMatchGame && (
          <div className="bg-slate-900 border-2 border-dashed border-amber-500/60 p-4 rounded-xl flex flex-col items-center justify-center gap-2 animate-pulse">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">🎲 เลือกไม่ตรงกัน! กำลังสุ่มดวง...</span>
            <div className="text-lg font-black text-white flex items-center gap-2">
              <span>{currentActiveMatchGame.emoji}</span>
              <span>{currentActiveMatchGame.title}</span>
            </div>
          </div>
        )}

        {!isSpinning && finalGame && currentActiveMatchGame && (
          <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-2xl shadow-emerald-500/5">
            <span className="text-xs font-black uppercase text-emerald-400 tracking-widest animate-bounce">🚀 สรุปผล! ระบบกำลังเริ่มรันเกม</span>
            <div className="text-base font-black text-white flex items-center gap-2">
              <span>{currentActiveMatchGame.emoji}</span>
              <span>{currentActiveMatchGame.title}</span>
            </div>
          </div>
        )}

        {!isParticipant && !p1Choice && !p2Choice && (
          <div className="bg-slate-900/90 border border-amber-500/20 text-amber-400 text-xs font-black py-3.5 px-6 rounded-full shadow-2xl backdrop-blur-md">
            กำลังเลือกเกม...
          </div>
        )}

      </div>
    </main>
  );
}