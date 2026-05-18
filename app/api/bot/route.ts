import { NextResponse } from 'next/server';
import { Bot, InlineKeyboard, InputFile } from 'grammy'; // 📥 เพิ่ม InputFile เข้ามา
import fs from 'fs';                                      // 📥 เพิ่ม fs เพื่อใช้อ่านไฟล์รูปภาพ
import path from 'path';                                  // 📥 เพิ่ม path เพื่อจัดระเบียบตำแหน่งไฟล์

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.warn("⚠️ Warning: TELEGRAM_BOT_TOKEN is missing during build time.");
}

const bot = new Bot(token || "DUMMY_TOKEN_FOR_BUILD_PASS");

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

        // 🖼️ จัดการเตรียมไฟล์รูปภาพจากโฟลเดอร์ public
        // ใช้ path.resolve เพื่อล็อกตำแหน่งจาก Root Directory ให้แม่นยำยิ่งขึ้น
        const imagePath = path.resolve(process.cwd(), 'public', 'vs.jpg');

        let photoToSend: any;

        if (fs.existsSync(imagePath)) {
            const fileBuffer = fs.readFileSync(imagePath);
            photoToSend = new InputFile(fileBuffer, 'vs.jpg'); // ส่งไฟล์ผ่าน Buffer
        } else {
            console.warn(`⚠️ ไม่พบไฟล์ที่: ${imagePath} ระบบจะใช้รูปสำรองแทน`);
            // 🟢 เปลี่ยนลิงก์รูปภาพสำรองเป็น URL ทั่วไปที่ไม่ใช่ t.me (คราวนี้ไม่พังแน่นอน)
            photoToSend = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500";
        }

        // 🚀 ส่งรูปภาพ
        await ctx.replyWithPhoto(photoToSend, {
            caption: `🔥 <b>เกม กล้า ท้า!</b> 🔥\n\n@${challengerName} ท้าแข่งกับ @${opponentUsername}!\n\nกดเปิดเกมข้างล่างเลย👇`,
            reply_markup: keyboard,
            parse_mode: "HTML"
        });

    } catch (error) {
        console.error("Telegram bot runtime script issue:", error);
    }
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // ⚠️ เพิ่มการดักตรงนี้: ป้องกันบอทพังตอนสั่ง npm run build 
        // เนื่องจากตอนบิวด์ไม่มี Token จริง บอทจะเรียก .init() ไม่ผ่าน
        if (token && !bot.isInited()) {
            await bot.init();
        }

        // ถ้าเป็น Token ปลอมตอนบิวด์ ไม่ต้องให้แฮนเดิลอัปเดต
        if (token) {
            await bot.handleUpdate(body);
        }

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error("Webhook route crash:", error);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}