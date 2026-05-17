'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
  initDataRaw: string | null;
  startParam: string | null;
  user: any | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  initDataRaw: null,
  startParam: null,
  user: null,
  isReady: false,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [sdkData, setSdkData] = useState<TelegramContextType>({
    initDataRaw: null,
    startParam: null,
    user: null,
    isReady: false,
  });

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const { retrieveLaunchParams } = await import('@telegram-apps/sdk');
        const launchParams = retrieveLaunchParams() as any;
        
        setSdkData({
          initDataRaw: launchParams.initDataRaw || null,
          startParam: launchParams.startParam || null,
          user: launchParams.initData?.user || null,
          isReady: true,
        });
      } catch (error) {
        console.warn("Not running inside Telegram context:", error);
        setSdkData((prev) => ({ ...prev, isReady: true }));
      }
    };

    initTelegram();
  }, []);

  return (
    <TelegramContext.Provider value={sdkData}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);