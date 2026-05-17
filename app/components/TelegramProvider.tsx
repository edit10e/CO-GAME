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
    const initTelegram = () => {
      try {
        const webApp = (window as any).Telegram?.WebApp;
        
        let rawData = null;
        let start = null;
        let userData = null;

        if (webApp) {
          webApp.ready();
          rawData = webApp.initData || null;
          start = webApp.initDataUnsafe?.start_param || null;
          userData = webApp.initDataUnsafe?.user || null;
        }

        // UNIVERSAL IFRAME SCRAPER FALLBACK:
        // If startParam is null, scrape Telegram's active webview location hash/search hashes directly
        if (!start && typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          start = searchParams.get('tgWebAppStartParam') || null;

          // If it's located inside the URL hash string variant instead
          if (!start && window.location.hash) {
            const hashClean = window.location.hash.substring(1);
            const hashParams = new URLSearchParams(hashClean);
            start = hashParams.get('tgWebAppStartParam') || null;
            if (!rawData) rawData = hashClean;
          }
        }

        setSdkData({
          initDataRaw: rawData,
          startParam: start,
          user: userData,
          isReady: true,
        });

      } catch (error) {
        console.error("Telegram fallback loader failed:", error);
        setSdkData((prev) => ({ ...prev, isReady: true }));
      }
    };

    const timer = setTimeout(initTelegram, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <TelegramContext.Provider value={sdkData}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);