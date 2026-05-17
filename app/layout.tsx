import type { Metadata } from "next";
import Script from "next/script"; // Import the Next.js Script optimizer
import "./globals.css";
import { TelegramProvider } from "./components/TelegramProvider";

export const metadata: Metadata = {
  title: "Expose Game Arena",
  description: "Secure Mobile 1v1 Telegram Arena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* CRITICAL FIX: Explicitly forces Telegram's webview controller interface layer to attach to the window */}
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased bg-slate-950 text-white min-h-screen selection:bg-emerald-500/30">
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}