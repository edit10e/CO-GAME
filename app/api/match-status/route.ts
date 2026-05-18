import { NextResponse } from 'next/server';

// คลังเก็บสเตตัสความจำจำลองแชร์กันบน Server ตัวกลาง
const globalMatchesMemory: Record<string, any> = {};

// 🧹 ฟังก์ชันสำหรับเคลียร์ห้องแมตช์ที่ค้างเกิน 24 ชั่วโมง เพื่อประหยัดพื้นที่ RAM
function cleanupOldMatches() {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 ชั่วโมง แปลงเป็นมิลลิวินาที

  // วนลูปตรวจเช็กห้องเกมทั้งหมดในระบบ
  for (const gameId in globalMatchesMemory) {
    const match = globalMatchesMemory[gameId];
    
    // ถ้าห้องนั้นไม่มีเวลาสร้าง หรือ สร้างมาเกิน 24 ชั่วโมงแล้ว...
    if (!match.createdAt || now - match.createdAt > ONE_DAY_MS) {
      delete globalMatchesMemory[gameId]; // 🔥 ลบห้องนี้ออกจาก RAM ทันที!
      console.log(`[Cleanup] Deleted expired match: ${gameId}`);
    }
  }
}

export async function GET(request: Request) {
  // สั่งให้ระบบแอบกวาดขยะและเคลียร์ห้องเก่าทุกครั้งที่มีการดึงข้อมูล
  cleanupOldMatches();

  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  // หากยังไม่มีประวัติห้อง ให้จัดสรรโครงสร้างเริ่มต้นพร้อมล็อกเวลาเซิร์ฟเวอร์
  if (!globalMatchesMemory[gameId]) {
    globalMatchesMemory[gameId] = {
      matchState: 'pending',
      p1Choice: null,
      p2Choice: null,
      finalGame: null,
      createdAt: Date.now(), // เก็บบันทึกเวลาที่ห้องนี้ถูกสร้างขึ้นมา
    };
  }

  return NextResponse.json(globalMatchesMemory[gameId]);
}

export async function POST(request: Request) {
  // สั่งให้ระบบแอบกวาดขยะและเคลียร์ห้องเก่าตอนที่มีการอัปเดตข้อมูลด้วยเช่นกัน
  cleanupOldMatches();

  try {
    const { gameId, matchState, p1Choice, p2Choice, finalGame } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    if (!globalMatchesMemory[gameId]) {
      globalMatchesMemory[gameId] = { 
        matchState: 'pending', 
        p1Choice: null, 
        p2Choice: null, 
        finalGame: null,
        createdAt: Date.now() 
      };
    }

    if (matchState) globalMatchesMemory[gameId].matchState = matchState;
    if (p1Choice !== undefined) globalMatchesMemory[gameId].p1Choice = p1Choice;
    if (p2Choice !== undefined) globalMatchesMemory[gameId].p2Choice = p2Choice;
    if (finalGame !== undefined) globalMatchesMemory[gameId].finalGame = finalGame;

    return NextResponse.json({ success: true, data: globalMatchesMemory[gameId] });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 500 });
  }
}