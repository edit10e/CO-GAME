import { NextResponse } from 'next/server';

// คลังความจำชั่วคราวบนเซิร์ฟเวอร์
const globalMatchesMemory: Record<string, any> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  // 🎯 ปรับปรุง: ถ้ายังไม่มีห้องนี้ ให้สร้างห้องพร้อมบันทึกเวลากลาง ณ วินาทีนั้นทันที
  if (!globalMatchesMemory[gameId]) {
    globalMatchesMemory[gameId] = {
      matchState: 'pending',
      p1Choice: null,
      p2Choice: null,
      finalGame: null,
      createdAt: Date.now(), // เวลาตั้งต้นจุดเดียว ใช้ร่วมกันทุกเครื่อง!
    };
  }

  return NextResponse.json(globalMatchesMemory[gameId]);
}

export async function POST(request: Request) {
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