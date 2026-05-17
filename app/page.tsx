'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  const [matchState, setMatchState] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  // สถานะการโหลดรูปโปรไฟล์ผิดพลาดเพื่อแสดงตัวอักษรย่อ
  const [p1ImgError, setP1ImgError] = useState(false);
  const [p2ImgError, setP2ImgError] = useState(false);

  // ดึงค่าไอดีห้องจากการกรองเครื่องหมาย Underscore
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

  // ตรวจสอบเงื่อนไขบทบาทของผู้ใช้งานที่เปิดหน้าจอ
  const currentUserId = user?.id?.toString() || '';
  const currentUsername = user?.username || '';

  const isPlayer1 = currentUserId === expectedPlayer1Id;
  const isPlayer2 = currentUsername.toLowerCase() === expectedPlayer2Name.toLowerCase();

  // ลิงก์รูปภาพโปรไฟล์เริ่มต้น
  const p1Avatar = isPlayer1 && user?.photo_url 
    ? user.photo_url 
    : `https://t.me/i/userpic/320/master_sig.jpg`;

  const p2Avatar = isPlayer2 && user?.photo_url 
    ? user.photo_url 
    : `https://t.me/i/userpic/320/${expectedPlayer2Name}.jpg`;

  // ดึงตัวอักษรตัวแรกสำหรับแสดงเป็น Fallback
  const p1Initial = isPlayer1 && user?.username 
    ? user.username.charAt(0).toUpperCase() 
    : 'M';
    
  const p2Initial = expectedPlayer2Name 
    ? expectedPlayer2Name.charAt(0).toUpperCase() 
    : 'P';

  // หน้าจอระบุสถานะกำลังโหลดระบบ
  if (authStatus === 'loading') {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // หน้าจอปฏิเสธการเข้าถึง (สำหรับบุคคลอื่นที่ไม่ได้อยู่ในแมตช์นี้)
  if (authStatus === 'denied') {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none">
        <div className="text-3xl mb-3">🔒</div>
        <h1 className="text-sm font-black tracking-widest uppercase text-red-500 mb-1">พื้นที่ส่วนบุคคล</h1>
        <p className="text-[11px] text-slate-500 max-w-55 leading-relaxed">
          ปฏิเสธการเข้าถึง ลิงก์ห้องประลองนี้จำกัดสิทธิ์เฉพาะผู้เล่นที่กำหนดไว้เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 w-screen h-screen bg-slate-950 overflow-hidden select-none font-sans">
      
      {/* =========================================================================
          💥 พื้นหลังแบ่งฝั่งทำมุมเอียงพาดสลับเฉียงพาสเทลเท่ ๆ (Angled Line Split 50:50) 
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full flex pointer-events-none z-0">
        {/* ฝั่งซ้าย: สีแดงทำมุมเฉียงไปทางขวา */}
        <div className="absolute inset-0 w-full h-full bg-linear-to-b from-red-600 via-red-950 to-slate-950 [clip-path:polygon(0_0,55%_0,45%_100%,0_100%)] z-10" />
        {/* ฝั่งขวา: สีน้ำเงินทำมุมเฉียงไปทางซ้าย */}
        <div className="absolute inset-0 w-full h-full bg-linear-to-b from-blue-600 via-blue-950 to-slate-950 z-0" />
      </div>

      {/* เส้นแกนแบ่งฝั่งตรงกลางทำมุมเฉียงสะท้อนแสง */}
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-10">
        <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-linear-to-b from-amber-400 via-white to-transparent transform -translate-x-1/2 -skew-x-6" />
      </div>

      {/* =========================================================================
          👥 เลเยอร์แสดงข้อมูลโปรไฟล์ผู้เล่นด้านบนพื้นหลัง
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full z-20 flex flex-col justify-between py-16 px-4">
        
        {/* ส่วนหัวแสดงชื่อแมตช์ตัวใหญ่กระชับตระการตา */}
        <div className="w-full text-center drop-shadow-lg">
          <p className="text-3xl font-black tracking-wider text-amber-400 uppercase ">
            🔥 เกมกล้าท้าเสียว 🔥
          </p>
        </div>

        {/* ส่วนแสดงรูปโปรไฟล์ซ้าย-ขวา */}
        <div className="w-full flex items-center justify-center relative my-auto">
          
          {/* ผู้ท้าชิง (PLAYER 1 - ฝั่งซ้าย) */}
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
                    (e.target as HTMLImageElement).src = "https://t.me/i/userpic/320/master_sig.jpg";
                    setP1ImgError(true);
                  }}
                />
              ) : (
                /* แสดงตัวอักษรย่อเมื่อไม่มีรูปภาพหรือรูปภาพไม่ทำงาน */
                <span className="text-3xl font-black tracking-tighter text-red-400 font-mono select-none">
                  {p1Initial}
                </span>
              )}
            </div>
            <p className="text-sm font-black tracking-tight text-white mt-3 drop-shadow-md truncate max-w-35">
              {isPlayer1 ? `@${user?.username}` : `@master_sig`}
            </p>
            <span className="text-[9px] font-black tracking-widest text-red-400 uppercase mt-0.5 opacity-80">ผู้ท้าชิง</span>
          </div>

          {/* ตราสัญลักษณ์ VS ตรงกลางจอมุมเอียง */}
          <div className="absolute font-bold text-4xl z-30 transform -translate-y-4">
              VS
          </div>

          {/* คู่ต่อสู้ (PLAYER 2 - ฝั่งขวา) */}
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
                /* แสดงตัวอักษรย่อเมื่อไม่มีรูปภาพหรือรูปภาพไม่ทำงาน */
                <span className="text-3xl font-black tracking-tighter text-blue-400 font-mono select-none">
                  {p2Initial}
                </span>
              )}
            </div>
            <p className="text-sm font-black tracking-tight text-white mt-3 drop-shadow-md truncate max-w-35">
              @{expectedPlayer2Name}
            </p>
            <span className="text-[9px] font-black tracking-widest text-blue-400 uppercase mt-0.5 opacity-80">คู่ต่อสู้</span>
          </div>

        </div>

        {/* =========================================================================
            🎮 ส่วนควบคุมปุ่มกดและการแสดงผลสถานะด้านล่างจอตามเงื่อนไขที่กำหนด
           ========================================================================= */}
        <div className="w-full max-w-xs mx-auto flex flex-col items-center justify-center z-30">
          
          {matchState === 'accepted' && (
            <div className="bg-slate-950/90 border border-emerald-500/30 text-emerald-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl animate-bounce backdrop-blur-md">
              ระบบเริ่มเกม...
            </div>
          )}

          {matchState === 'rejected' && (
            <div className="bg-slate-950/90 border border-red-500/30 text-red-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md">
              ❌ ยกเลิกคำท้าแล้ว
            </div>
          )}

          {matchState === 'pending' && (
            <>
              {isPlayer2 ? (
                /* ชุดคำสั่งสำหรับฝั่งคู่ต่อสู้ (Player 2) เพื่อกดยอมรับหรือปฏิเสธ */
                <div className="flex items-center gap-4 w-full px-2">
                  <button 
                    onClick={() => setMatchState('rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black tracking-widest uppercase py-4 rounded-2xl shadow-xl transition-all border border-red-500/40"
                  >
                    ปฏิเสธ
                  </button>
                  <button 
                    onClick={() => setMatchState('accepted')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 text-xs font-black tracking-widest uppercase py-4 rounded-2xl shadow-xl transition-all shadow-emerald-500/10"
                  >
                    ยอมรับ
                  </button>
                </div>
              ) : isPlayer1 ? (
                /* หน้าจอสถานะรอคอยสำหรับฝั่งผู้ท้าชิง (Player 1) */
                <div className=" text-white shadow-md font-bold text-2xl tracking-wide py-3 px-6  animate-pulse text-center leading-relaxed">
                  กำลังรอการตอบกลับจาก @{expectedPlayer2Name}...
                </div>
              ) : (
                /* หน้าจอแจ้งเตือนบุคคลภายนอกที่ไม่ใช่คู่ประลองหลักของห้องนี้ */
                <div className="bg-slate-950/90 border border-amber-500/20 text-amber-400 font-black text-xs tracking-widest uppercase py-3.5 px-8 rounded-full shadow-2xl backdrop-blur-md text-center">
                  กำลังแข่งขัน
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </main>
  );
}