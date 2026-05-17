import { NextResponse } from 'next/server';

// 📦 จำลองฐานข้อมูลชั่วคราวในหน่วยความจำของ Server (ฟรี ไม่ต้องต่อ Database)
// โครงสร้าง: { [gameId]: { matchState, p1Choice, p2Choice, finalGame } }
const globalMatchesMemory: Record<string, any> = {};

// 1. [GET] สำหรับให้ทั้งสองฝั่งดึงสถานะล่าสุดไปอัปเดตหน้าจอ
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  // ถ้ายังไม่มีห้องนี้ในความจำ ให้สร้างสเตตัสเริ่มต้นไว้
  if (!globalMatchesMemory[gameId]) {
    globalMatchesMemory[gameId] = {
      matchState: 'pending',
      p1Choice: null,
      p2Choice: null,
      finalGame: null,
    };
  }

  return NextResponse.json(globalMatchesMemory[gameId]);
}

// 2. [POST] สำหรับให้ผู้เล่นส่งสเตตัส หรือส่งเกมที่เลือกเข้ามาเก็บ
export async function POST(request: Request) {
  try {
    const { gameId, matchState, p1Choice, p2Choice, finalGame } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    // ถ้ายังไม่มีห้องนี้ ให้สร้างห้องใหม่
    if (!globalMatchesMemory[gameId]) {
      globalMatchesMemory[gameId] = { matchState: 'pending', p1Choice: null, p2Choice: null, finalGame: null };
    }

    // อัปเดตข้อมูลเฉพาะที่มีการส่งมา
    if (matchState) globalMatchesMemory[gameId].matchState = matchState;
    if (p1Choice !== undefined) globalMatchesMemory[gameId].p1Choice = p1Choice;
    if (p2Choice !== undefined) globalMatchesMemory[gameId].p2Choice = p2Choice;
    if (finalGame !== undefined) globalMatchesMemory[gameId].finalGame = finalGame;

    return NextResponse.json({ success: true, data: globalMatchesMemory[gameId] });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 500 });
  }
}