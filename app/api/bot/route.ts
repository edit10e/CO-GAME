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

// ==========================================
// 2. ระบบดักจับ รูปภาพ/วิดีโอ/GIF และลบอัตโนมัติใน 60 วินาที
// ==========================================
bot.on(['message:photo', 'message:video', 'message:animation'], async (ctx) => {
    try {
        // ดึงข้อความอธิบายใต้ภาพ/วิดีโอ (Caption)
        const captionText = ctx.message.caption || "";
        
        // ตรวจสอบว่าในข้อความมีการ Mention ถึงผู้ใช้ (@username) หรือไม่
        const hasMention = captionText.match(/@(\w+)/);

        // เงื่อนไข: ต้องเป็น มีเดีย และมีการแท็ก @ ถึงจะเข้าสู่ระบบลบอัตโนมัติ
        if (hasMention) {
            const chatId = ctx.chat.id;
            const mediaMessageId = ctx.message.message_id;

            // ส่งข้อความแจ้งเตือนผู้ใช้ว่าจะทำการลบ
            const noticeMessage = await ctx.reply("⏳ รูปภาพ/วิดีโอนี้จะถูกลบอัตโนมัติภายใน 60 วินาที...", {
                reply_to_message_id: mediaMessageId
            });

            // ⏱️ ใช้ setTimeout แยกรายข้อความ (Independent Background Job) 
            // เมื่อครบ 60 วินาที (60000ms) ระบบจะสั่งลบไฟล์และข้อความแจ้งเตือนชิ้นนั้นๆ ทันที
            setTimeout(async () => {
                try {
                    // ลบตัวไฟล์มีเดีย (รูปภาพ/วิดีโอ/GIF)
                    await ctx.api.deleteMessage(chatId, mediaMessageId);
                } catch (err) {
                    console.error("Failed to delete media file:", err);
                }

                try {
                    // ลบข้อความแจ้งเตือน "จะถูกลบอัตโนมัติภายใน 60 วินาที" ออกไปด้วยเพื่อความสะอาดของแชท
                    await ctx.api.deleteMessage(chatId, noticeMessage.message_id);
                } catch (err) {
                    console.error("Failed to delete notice message:", err);
                }
            }, 60000); 
        }
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