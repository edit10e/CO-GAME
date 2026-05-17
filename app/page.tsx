'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';
import LoadingScreen from './components/LoadingScreen';
import DeniedScreen from './components/DeniedScreen';
import Matches from './components/Matches';
import GameList from './components/GameList';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
  
  // จัดการสถานะแมตช์: เพิ่มสถานะ 'expired' สำหรับกรณีหมดเวลา
  const [matchState, setMatchState] = useState<'pending' | 'accepted' | 'rejected' | 'expired'>('pending');

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

  // ระบบตรวจสอบการหมดเวลาอัตโนมัติ (3 นาที และ 10 นาที Lifecycle)
  useEffect(() => {
    if (!startParam) return;

    // ตั้งค่าหรือดึงเวลาเริ่มต้นสร้างห้องจำลองเก็บไว้ในฐานข้อมูลเครื่อง (Client-side sync)
    const storageKey = `match_time_${startParam}`;
    let creationTime = localStorage.getItem(storageKey);
    
    if (!creationTime) {
      creationTime = Date.now().toString();
      localStorage.setItem(storageKey, creationTime);
    }

    const startTime = parseInt(creationTime, 10);

    const checkTimeout = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;

      if (matchState === 'pending' && elapsedMs > 3 * 60 * 1000) {
        // หากผู้เล่น 2 ไม่กดยอมรับภายใน 3 นาที -> หมดอายุ
        setMatchState('expired');
      } else if (matchState === 'accepted' && elapsedMs > 10 * 60 * 1000) {
        // หากไม่มีการเล่นหรือทำกิจกรรมใน 10 นาที -> ตัดแมตช์ทิ้ง
        setMatchState('expired');
      }
    };

    // รันตรวจสอบทันทีและทุกๆ 1 วินาที
    checkTimeout();
    const timer = setInterval(checkTimeout, 1000);
    return () => clearInterval(timer);
  }, [startParam, matchState]);

  if (authStatus === 'loading') return <LoadingScreen />;
  if (authStatus === 'denied') return <DeniedScreen />;

  const isPlayer1 = user?.id?.toString() === expectedPlayer1Id;
  const isPlayer2 = user?.username?.toLowerCase() === expectedPlayer2Name.toLowerCase();

  // ปรับเงื่อนไขสลับหน้าจอ: ต้องตอบรับแล้ว และต้องยังไม่หมดเวลา 10 นาที
  if (matchState === 'accepted') {
    return <GameList isPlayer1={isPlayer1} isPlayer2={isPlayer2} />;
  }

  return (
    <Matches
      user={user}
      isPlayer1={isPlayer1}
      isPlayer2={isPlayer2}
      expectedPlayer2Name={expectedPlayer2Name}
      matchState={matchState}
      setMatchState={setMatchState}
    />
  );
}