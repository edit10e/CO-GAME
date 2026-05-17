import { NextResponse } from 'next/server';
import { Bot, InlineKeyboard } from 'grammy';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

bot.command('vs', async (ctx) => {
    try {
        if (!ctx.message || !ctx.from) {
            return;
        }

        const challengerId = ctx.from.id;
        const challengerName = ctx.from.username || ctx.from.first_name;

        const messageText = ctx.message.text || "";
        const match = messageText.match(/@(\w+)/);

        if (!match) {
            await ctx.reply("❌ Usage: /vs @username (Please target a valid opponent!)");
            return;
        }
        // Replace the old keyboard block inside app/api/bot/route.ts with this:

        const opponentUsername = match[1];
        const roomParam = `${challengerId}_${opponentUsername}`;

        // This specific structure is required by Telegram to forward startapp on mobile devices
        const keyboard = new InlineKeyboard().url(
            "⚔️ Enter Match Arena",
            `https://t.me/Exposegamebot/Expose_Game?startapp=${roomParam}`
        );
        // SWITCHED TO HTML PARSING: Cleaner, bulletproof rendering
        await ctx.reply(
            `🔥 <b>EXPOSE DUEL CHALLENGE!</b> 🔥\n\n@${challengerName} has challenged @${opponentUsername} to a match!\n\n🔒 <i>Only these two combatants can access this secure room.</i>`,
            { reply_markup: keyboard, parse_mode: "HTML" }
        );
    } catch (error) {
        console.error("Telegram bot runtime script issue:", error);
    }
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!bot.isInited()) {
            await bot.init();
        }

        await bot.handleUpdate(body);
        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook route crash:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}