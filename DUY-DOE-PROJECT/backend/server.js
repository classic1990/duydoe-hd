const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// เชื่อมต่อ Firebase (ใช้ไฟล์ที่คุณส่งมา)
let serviceAccount = require('./service-account-key.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// ตั้งค่า AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyASIzCaEn936KGtTSrMeORP_jDiii_LjII");
const googleAIModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });

app.use(cors());
app.use(express.json());

// Endpoint สำหรับวิเคราะห์หนัง
app.post('/api/ai/analyze', async (req, res) => {
    try {
        const { url, fastMode } = req.body;
        if (!url) return res.status(400).json({ error: 'กรุณาระบุ URL' });

        // 1. Scraping ข้อมูลพื้นฐาน
        const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000 
        });
        const $ = cheerio.load(response.data);
        
        let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        let description = $('meta[property="og:description"]').attr('content') || '';
        let poster = $('meta[property="og:image"]').attr('content') || '';
        let category = "ทั่วไป";

        // ปรับแต่ง Title และ Poster ถ้าเป็น YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            title = title.replace(' - YouTube', '').trim();
            const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
            if (videoId) poster = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }

        // 2. ถ้าไม่ใช่ fastMode ให้ส่งไปให้ AI ช่วยแต่งเนื้อหา
        if (!fastMode) {
            const prompt = `วิเคราะห์หนังจากข้อมูลนี้: "${title} - ${description}" 
                            1. สรุปเรื่องย่อให้น่าสนใจ ดึงดูด กระชับ (ภาษาไทย)
                            2. เลือกหมวดหมู่ 1 อย่างจาก: (หนังแอ็คชั่น, หนังดราม่า, หนังผี, หนังตลก, หนังรัก, หนังการ์ตูน)
                            ตอบเป็น JSON: {"summary": "...", "category": "..."}`;
            
            const result = await googleAIModel.generateContent(prompt);
            const aiData = JSON.parse(result.response.text().match(/\{[\s\S]*\}/)[0]);
            description = aiData.summary;
            category = aiData.category;
        }

        res.json({
            success: true,
            data: {
                title,
                description,
                poster,
                category,
                videoUrl: url.includes('youtube.com') ? url.replace('watch?v=', 'embed/') : url
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// เพิ่มส่วนนี้เพื่อให้หน้าแรกไม่ขึ้น Cannot GET /
app.get('/', (req, res) => {
    res.send('<h1>🚀 DUY-DOE AI Backend is Running!</h1><p>Ready to analyze your movies.</p>');
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 DUY-DOE Server ready on port ${PORT}`));