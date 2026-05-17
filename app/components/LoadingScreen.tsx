'use client';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-slate-950 z-50">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-white rounded-full animate-spin" />
    </div>
  );
}