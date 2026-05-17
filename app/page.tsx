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
  const [matchState, setMatchState] = useState<'pending' | 'accepted' | 'rejected' | 'expired'>('pending');
  
  // สเตตเก็บเวลานับถอยหลังเป็นวินาที
  const [timeLeft, setTimeLeft] = useState<number>(180); // เริ่มต้นที่ 3 นาที (180 วิ)

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

  // ระบบคำนวณและดักจับ Lifecycle ของห้อง
  useEffect(() => {
    if (!startParam) return;

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

      if (matchState === 'pending') {
        const totalPendingTime = 3 * 60 * 1000; // 3 นาที
        const remaining = Math.max(0, Math.floor((totalPendingTime - elapsedMs) / 1000));
        setTimeLeft(remaining);

        if (elapsedMs > totalPendingTime) {
          setMatchState('expired');
        }
      } else if (matchState === 'accepted') {
        const totalMatchTime = 10 * 60 * 1000; // 10 นาที
        const remaining = Math.max(0, Math.floor((totalMatchTime - elapsedMs) / 1000));
        setTimeLeft(remaining);

        if (elapsedMs > totalMatchTime) {
          setMatchState('expired');
        }
      }
    };

    checkTimeout();
    const timer = setInterval(checkTimeout, 1000);
    return () => clearInterval(timer);
  }, [startParam, matchState]);

  if (authStatus === 'loading') return <LoadingScreen />;
  if (authStatus === 'denied') return <DeniedScreen />;

  const isPlayer1 = user?.id?.toString() === expectedPlayer1Id;
  const isPlayer2 = user?.username?.toLowerCase() === expectedPlayer2Name.toLowerCase();

  if (matchState === 'accepted') {
    return <GameList isPlayer1={isPlayer1} isPlayer2={isPlayer2} timeLeft={timeLeft} />;
  }

  return (
    <Matches
      user={user}
      isPlayer1={isPlayer1}
      isPlayer2={isPlayer2}
      expectedPlayer2Name={expectedPlayer2Name}
      matchState={matchState}
      setMatchState={setMatchState}
      timeLeft={timeLeft}
    />
  );
}