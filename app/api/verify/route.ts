import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { initDataRaw, gameId } = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!initDataRaw || !botToken) {
      return NextResponse.json({ authorized: false, error: 'Parameters missing' }, { status: 400 });
    }

    // 1. Authenticate that data truly originated from Telegram
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    params.delete('hash');

    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys.map(key => `${key}=${params.get(key)}`).join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return NextResponse.json({ authorized: false, error: 'Crypto verification failed' }, { status: 403 });
    }

    // 2. Decode the user parameters
    const userString = params.get('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user.id) {
      return NextResponse.json({ authorized: false, error: 'User profiles unavailable' }, { status: 400 });
    }

    // 3. No-DB Gatekeeping Verification Match Logic
    if (!gameId || !gameId.includes('_')) {
      return NextResponse.json({ authorized: false, error: 'Corrupt arena link structure' }, { status: 400 });
    }

    // CRITICAL FIX: Safely split ONLY at the first underscore.
    // This leaves underscores inside the opponent's username completely untouched!
    const firstUnderscoreIndex = gameId.indexOf('_');
    const player1Id = gameId.substring(0, firstUnderscoreIndex);
    const player2Username = gameId.substring(firstUnderscoreIndex + 1);

    const currentUserId = user.id.toString();
    const currentUsername = user.username || "";

    // Evaluate access matching parameters
    const isPlayer1 = currentUserId === player1Id;
    const isPlayer2 = currentUsername.toLowerCase() === player2Username.toLowerCase();

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({
        authorized: false,
        error: 'Access Denied: This arena match lobby is private.'
      }, { status: 403 });
    }

    // Return authorization status along with verified target payload data
    return NextResponse.json({ authorized: true, user });
  } catch (error) {
    return NextResponse.json({ authorized: false, error: 'Server authorization crash' }, { status: 500 });
  }
}