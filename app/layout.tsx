import type { Metadata } from "next";
import "./globals.css";
import { TelegramProvider } from "./components/TelegramProvider";

export const metadata: Metadata = {
  title: "Co-Expose Match App",
  description: "Secure 1v1 Telegram Game Room",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-900 text-white min-h-screen">
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}