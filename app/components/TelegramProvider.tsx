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
        // Dynamically import the SDK methods safely on the client browser
        const sdk = await import('@telegram-apps/sdk');
        
        const launchParams = sdk.retrieveLaunchParams() as any;
        
        // COMPATIBILITY FIX: Attempt to extract raw data using older launch parameters
        // fallback to the new retrieveRawInitData() method if it is missing.
        let rawInitData = launchParams.initDataRaw || null;
        if (!rawInitData && typeof (sdk as any).retrieveRawInitData === 'function') {
          rawInitData = (sdk as any).retrieveRawInitData() || null;
        }
        
        setSdkData({
          initDataRaw: rawInitData,
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