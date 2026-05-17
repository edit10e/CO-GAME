'use client';

export default function DeniedScreen() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center select-none z-50">
      <div className="text-3xl mb-3">🔒</div>
      <h1 className="text-sm font-black tracking-widest uppercase text-red-500 mb-1">พื้นที่ส่วนบุคคล</h1>
      <p className="text-[11px] text-slate-500 max-w-55 leading-relaxed">
        ปฏิเสธการเข้าถึง ลิงก์ห้องประลองนี้จำกัดสิทธิ์เฉพาะผู้เล่นที่กำหนดไว้เท่านั้น
      </p>
    </div>
  );
}