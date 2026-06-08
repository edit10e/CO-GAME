// app/api/bot/route.ts
import { NextResponse } from 'next/server';
import { Bot, InlineKeyboard, InputFile } from 'grammy';
import fs from 'fs';
import path from 'path';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.warn("⚠️ Warning: TELEGRAM_BOT_TOKEN is missing during build time.");
}

const bot = new Bot(token || "DUMMY_TOKEN_FOR_BUILD_PASS");

// ==========================================
// 1. คำสั่ง /vs (คงเดิม 100% ไม่เปลี่ยนแปลงข้อความ)
// ==========================================
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

        const opponentUsername = match[1];
        const roomParam = `${challengerId}_${opponentUsername}`;

        const keyboard = new InlineKeyboard().url(
            "⚔️ เข้าสู่การแข่งขัน ",
            `https://t.me/Exposegamebot/Expose_Game?startapp=${roomParam}`
        );

        const imagePath = path.resolve(process.cwd(), 'public', 'vs.jpg');

        let photoToSend: any;

        if (fs.existsSync(imagePath)) {
            const fileBuffer = fs.readFileSync(imagePath);
            photoToSend = new InputFile(fileBuffer, 'vs.jpg');
        } else {
            console.warn(`⚠️ ไม่พบไฟล์ที่: ${imagePath} ระบบจะใช้รูปสำรองแทน`);
            photoToSend = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500";
        }

        await ctx.replyWithPhoto(photoToSend, {
            caption: `@${challengerName} ท้าแข่งกับ @${opponentUsername}!\n\nกดเปิดเกมข้างล่างเลย👇`,
            reply_markup: keyboard,
            parse_mode: "HTML"
        });

    } catch (error) {
        console.error("Telegram bot runtime script issue:", error);
    }
});

// ===============================Í===========
// 2. ระบบดักจับ รูปภาพ/วิดีโอ/GIF และลบอัตโนมัติใน 60 วินาที (ทำงานทันทีไม่ต้องพิมพ์ข้อความ)
// ==========================================
bot.on(['message:photo', 'message:video', 'message:animation'], async (ctx) => {
    try {
        const chatId = ctx.chat.id;
        const mediaMessageId = ctx.message.message_id;

        // Get sender's username or fall back to first_name
        const sender = ctx.from?.username
            ? `@${ctx.from.username}`
            : ctx.from?.first_name ?? 'คุณ';

        // Reply immediately with the sender's name tagged
        const noticeMessage = await ctx.reply(
            `⏳ ${sender} รูปของคุณจะถูกลบในอีก 60 วินาที...`,
            { reply_to_message_id: mediaMessageId }
        );

        // Each media message gets its own independent timer
        setTimeout(async () => {
            try {
                await ctx.api.deleteMessage(chatId, mediaMessageId);
            } catch (err) {
                console.error("Failed to delete media:", err);
            }
            try {
                await ctx.api.deleteMessage(chatId, noticeMessage.message_id);
            } catch (err) {
                console.error("Failed to delete notice:", err);
            }
        }, 60000);

    } catch (error) {
        console.error("Error in auto-delete media function:", error);
    }
});

// ==========================================
// 3. Webhook Handling และการรันระบบ
// ==========================================
export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (token && !bot.isInited()) {
            await bot.init();
        }

        if (token) {
            await bot.handleUpdate(body);
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook route crash:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}