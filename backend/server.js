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

        console.log('🔍 Analyzing URL:', url);

        // Detect source type
        const sourceType = detectSourceType(url);
        console.log('📺 Source type:', sourceType);

        let result = {};

        // Handle different source types
        switch (sourceType) {
            case 'youtube':
                result = await analyzeYouTube(url);
                break;
            case 'goseries4k':
                result = await analyzeGoSeries4K(url);
                break;
            case 'embed':
                result = await analyzeEmbed(url);
                break;
            default:
                result = await analyzeGeneric(url);
        }

        // ถ้าไม่ใช่ fastMode ให้ส่งไปให้ AI ช่วยแต่งเนื้อหา
        if (!fastMode && result.title) {
            try {
                const prompt = `วิเคราะห์หนังจากข้อมูลนี้: "${result.title} - ${result.description}" 
                                1. สรุปเรื่องย่อให้น่าสนใจ ดึงดูด กระชับ (ภาษาไทย ไม่เกิน 200 ตัวอักษร)
                                2. เลือกหมวดหมู่ 1 อย่างจาก: (แอ็คชั่น, ดราม่า, สยองขวัญ, ตลก, โรแมนติก, การ์ตูน, ไซไฟ, ระทึกขวัญ, ผจญภัย, สารคดี)
                                3. ประเมินคุณภาพวิดีโอ (HD, Full HD, 4K) จากชื่อเรื่อง
                                ตอบเป็น JSON: {"summary": "...", "category": "...", "quality": "..."}`;

                const aiResult = await googleAIModel.generateContent(prompt);
                const aiData = JSON.parse(aiResult.response.text().match(/\{[\s\S]*\}/)?.[0] || '{}');

                if (aiData.summary) result.description = aiData.summary;
                if (aiData.category) result.category = aiData.category;
                if (aiData.quality) result.quality = aiData.quality;

                console.log('✨ AI Enhancement applied');
            } catch (aiError) {
                console.warn('⚠️ AI enhancement failed:', aiError.message);
            }
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===============================
// 🔍 SOURCE DETECTORS
// ===============================

function detectSourceType(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('goseries4k.com')) return 'goseries4k';
    if (url.includes('embed') || url.includes('player') || url.includes('iframe')) return 'embed';
    return 'generic';
}

// ===============================
// 📺 SOURCE ANALYZERS
// ===============================

async function analyzeYouTube(url) {
    const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];

    if (!videoId) {
        throw new Error('ไม่สามารถดึง YouTube Video ID ได้');
    }

    // ดึงข้อมูลจาก oEmbed API
    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await axios.get(oembedUrl, { timeout: 5000 });
        const data = response.data;

        return {
            title: data.title?.replace(' - YouTube', '').trim() || 'ไม่มีชื่อ',
            description: data.title || '',
            poster: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            videoUrl: `https://www.youtube.com/embed/${videoId}`,
            embed: `https://www.youtube.com/embed/${videoId}`,
            category: 'ทั่วไป',
            quality: 'HD',
            source: 'youtube',
            videoId: videoId
        };
    } catch (error) {
        // Fallback ถ้า oEmbed ไม่ทำงาน
        return {
            title: 'หนังจาก YouTube',
            description: '',
            poster: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            videoUrl: `https://www.youtube.com/embed/${videoId}`,
            embed: `https://www.youtube.com/embed/${videoId}`,
            category: 'ทั่วไป',
            quality: 'HD',
            source: 'youtube',
            videoId: videoId
        };
    }
}

async function analyzeGoSeries4K(url) {
    try {
        // Scraping จาก goseries4k
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'th,en;q=0.9'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // ดึงข้อมูลจาก meta tags
        let title = $('meta[property="og:title"]').attr('content') ||
            $('h1.entry-title').text() ||
            $('h1').first().text() ||
            'ไม่มีชื่อ';

        let description = $('meta[property="og:description"]').attr('content') ||
            $('.entry-content').text().substring(0, 200) ||
            '';

        let poster = $('meta[property="og:image"]').attr('content') ||
            $('img.wp-post-image').attr('src') ||
            $('img.attachment-post-thumbnail').attr('src') ||
            '';

        // ดึง iframe embed URL
        let embedUrl = $('iframe').attr('src') || url;

        // ดึงรายการตอน (episodes) ถ้าเป็นซีรีส์
        const episodes = [];
        $('.ep-item, .episode-item, [class*="episode"]').each((i, el) => {
            const epNum = $(el).find('.ep-num, .episode-number').text().trim() || (i + 1);
            const epTitle = $(el).find('.ep-title, .episode-title').text().trim() || `ตอนที่ ${epNum}`;
            const epLink = $(el).find('a').attr('href') || $(el).attr('data-url') || '';

            if (epLink) {
                episodes.push({
                    episode: parseInt(epNum) || (i + 1),
                    title: epTitle,
                    url: epLink,
                    embed: epLink
                });
            }
        });

        return {
            title: title.trim(),
            description: description.trim(),
            poster: poster,
            thumbnail: poster,
            videoUrl: embedUrl,
            embed: embedUrl,
            url: url,
            category: 'ทั่วไป',
            quality: 'HD',
            source: 'goseries4k',
            episodes: episodes.length > 0 ? episodes : null,
            type: episodes.length > 0 ? 'series' : 'movie'
        };
    } catch (error) {
        console.error('❌ GoSeries4K scraping error:', error);

        // Return basic info if scraping fails
        return {
            title: 'หนังจาก GoSeries4K',
            description: '',
            poster: '',
            videoUrl: url,
            embed: url,
            url: url,
            category: 'ทั่วไป',
            quality: 'HD',
            source: 'goseries4k'
        };
    }
}

async function analyzeEmbed(url) {
    // สำหรับ iframe embed URLs ต่างๆ
    return {
        title: 'วิดีโอจากแหล่งภายนอก',
        description: '',
        poster: '',
        videoUrl: url,
        embed: url,
        url: url,
        category: 'ทั่วไป',
        quality: 'HD',
        source: 'embed'
    };
}

async function analyzeGeneric(url) {
    try {
        // พยายามดึงข้อมูลพื้นฐานจาก URL
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 8000
        });

        const $ = cheerio.load(response.data);

        const title = $('meta[property="og:title"]').attr('content') ||
            $('title').text() ||
            'ไม่มีชื่อ';

        const description = $('meta[property="og:description"]').attr('content') || '';
        const poster = $('meta[property="og:image"]').attr('content') || '';

        return {
            title: title.trim(),
            description: description.trim(),
            poster: poster,
            thumbnail: poster,
            videoUrl: url,
            embed: url,
            url: url,
            category: 'ทั่วไป',
            quality: 'HD',
            source: 'generic'
        };
    } catch (error) {
        // Return basic info if scraping fails
        return {
            title: 'หนังใหม่',
            description: '',
            poster: '',
            videoUrl: url,
            embed: url,
            url: url,
            category: 'ทั่วไป',
            quality: 'HD',
            source: 'generic'
        };
    }
}
// เพิ่มส่วนนี้เพื่อให้หน้าแรกไม่ขึ้น Cannot GET /
app.get('/', (req, res) => {
    res.send('<h1>🚀 DUY-DOE AI Backend is Running!</h1><p>Ready to analyze your movies.</p>');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 DUY-DOE Server ready on port ${PORT}`));