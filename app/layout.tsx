import type { Metadata } from "next";
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
      <body className="antialiased bg-slate-950 text-white min-h-screen selection:bg-emerald-500/30">
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}