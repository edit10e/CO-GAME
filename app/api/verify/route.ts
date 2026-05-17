import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { initDataRaw, gameId } = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!initDataRaw || !botToken) {
      return NextResponse.json({ authorized: false, error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Verify that this user is actually who they say they are (Telegram Validation)
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    params.delete('hash');

    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys.map(key => `${key}=${params.get(key)}`).join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return NextResponse.json({ authorized: false, error: 'Invalid signature' }, { status: 403 });
    }

    // 2. Extract the verified user profile data from Telegram
    const userString = params.get('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user.id) {
      return NextResponse.json({ authorized: false, error: 'User profile invalid' }, { status: 400 });
    }

    const currentUserId = user.id.toString();

    // 3. NO-DB VERIFICATION LOGIC
    // We expect gameId (startParam) to be formatted as "player1ID_player2ID"
    // Example: "11111111_22222222"
    if (!gameId || !gameId.includes('_')) {
      return NextResponse.json({ authorized: false, error: 'Malformed game link' }, { status: 400 });
    }

    const [player1Id, player2Id] = gameId.split('_');

    // Check if the current user matches either allowed ID
    if (currentUserId !== player1Id && currentUserId !== player2Id) {
      return NextResponse.json({ 
        authorized: false, 
        error: 'You are not a player in this specific duel match.' 
      }, { status: 403 });
    }

    // Success! The user is authenticated AND authorized.
    return NextResponse.json({ authorized: true, user });

  } catch (error) {
    return NextResponse.json({ authorized: false, error: 'Server error' }, { status: 500 });
  }
}