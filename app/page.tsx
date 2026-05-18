'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from './components/TelegramProvider';
import LoadingScreen from './components/LoadingScreen';
import DeniedScreen from './components/DeniedScreen';
import Matches from './components/Matches';
import GameList from './components/GameList';

// 🎯 สร้าง Type ร่วมกันชัดเจนป้องกัน TypeScript สับสน
type MatchStatusType = 'pending' | 'accepted' | 'rejected' | 'expired';

export default function Home() {
  const { isReady, user, startParam, initDataRaw } = useTelegram();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');

  // ระบุประเภทของ State อย่างเด็ดขาดด้วย <MatchStatusType>
  const [matchState, setMatchState] = useState<MatchStatusType>('pending');
  const [p1Choice, setP1Choice] = useState<string | null>(null);
  const [p2Choice, setP2Choice] = useState<string | null>(null);
  const [finalGame, setFinalGame] = useState<string | null>(null);

  const [serverCreatedAt, setServerCreatedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180);

  const firstUnderscore = startParam ? startParam.indexOf('_') : -1;
  const expectedPlayer1Id = firstUnderscore !== -1 ? startParam!.substring(0, firstUnderscore) : '';
  const expectedPlayer2Name = firstUnderscore !== -1 ? startParam!.substring(firstUnderscore + 1) : '';

  const isPlayer1 = user?.id?.toString() === expectedPlayer1Id;
  const isPlayer2 = user?.username?.toLowerCase() === expectedPlayer2Name.toLowerCase();

  useEffect(() => {
    if (!isReady || !initDataRaw || !startParam) {
      if (isReady) setAuthStatus('denied');
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

  // 🔄 ซิงค์สถานะและดึงค่าเวลากลางชัวร์ๆ จาก Server
  useEffect(() => {
    if (!startParam || authStatus !== 'authorized') return;

    const fetchMatchStatus = async () => {
      try {
        const res = await fetch(`/api/match-status?gameId=${startParam}`);
        const data = await res.json();

        if (data) {
          setMatchState(data.matchState as MatchStatusType);
          setP1Choice(data.p1Choice);
          setP2Choice(data.p2Choice);
          setFinalGame(data.finalGame);
          if (data.createdAt) setServerCreatedAt(data.createdAt);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    fetchMatchStatus();
    const interval = setInterval(fetchMatchStatus, 2000);
    return () => clearInterval(interval);
  }, [startParam, authStatus]);

  const updateMatchStateOnServer = async (newState: MatchStatusType) => {
    setMatchState(newState);
    await fetch('/api/match-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: startParam, matchState: newState }),
    });
  };

  // ⏱️ ตัวนับถอยหลัง (แก้ไขลบเงื่อนไขที่ซ้อนทับออกเพื่อไม่ให้ TypeScript แจ้ง Error)
  useEffect(() => {
    const startTime = serverCreatedAt || Date.now();
    
    // ดักกรองสถานะจบเกมไว้ตรงนี้แล้ว
    if (matchState === 'expired' || !!finalGame) return;

    const checkTimeout = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const limit = 3 * 60 * 1000;
      const remaining = Math.max(0, Math.floor((limit - elapsedMs) / 1000));
      setTimeLeft(remaining);

      // 🟢 แก้ไข: ลบ matchState !== 'expired' ออกไป เพราะ Type ถูกยืนยันจากด้านบนแล้วว่าไม่เป็นเซ็ตนี้แน่นอน
      if (elapsedMs > limit && serverCreatedAt) {
        updateMatchStateOnServer('expired');
      }
    };

    checkTimeout();
    const timer = setInterval(checkTimeout, 1000);
    return () => clearInterval(timer);
  }, [serverCreatedAt, matchState, finalGame]);

  if (authStatus === 'loading') return <LoadingScreen />;
  if (authStatus === 'denied') return <DeniedScreen />;

  if (matchState === 'accepted') {
    return (
      <GameList
        startParam={startParam!}
        isPlayer1={isPlayer1}
        isPlayer2={isPlayer2}
        timeLeft={timeLeft}
        p1Choice={p1Choice}
        p2Choice={p2Choice}
        finalGame={finalGame}
      />
    );
  }

  return (
    <Matches
      user={user}
      isPlayer1={isPlayer1}
      isPlayer2={isPlayer2}
      expectedPlayer2Name={expectedPlayer2Name}
      matchState={matchState}
      setMatchState={updateMatchStateOnServer}
      timeLeft={timeLeft}
    />
  );
}