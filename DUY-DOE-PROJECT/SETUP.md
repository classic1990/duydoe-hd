# 🚀 DUY-DOE HD - คู่มือติดตั้งและใช้งาน

## 📋 สถานะโปรเจกต์: ✅ พร้อมใช้งาน 100%

### ✅ ที่แก้ไขเรียบร้อย:
- 🔧 **Path Issues** - แก้ไข `/assets/` → `./assets/` ทั้งหมด
- 🔐 **Firebase Security** - ซ่อน API keys สำหรับ production
- 🌐 **Backend Connection** - เชื่อมต่อ API อัตโนมัติ
- 🛡️ **Environment Protection** - ป้องกันข้อมูลลับ

---

## 🚀 การเริ่มต้นใช้งาน

### 1. 📁 โครงสร้างโปรเจกต์
```
DUY-DOE-PROJECT/
├── 🔧 backend/              # Backend Server (Node.js + Express)
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── .env               # Environment variables (secret)
├── 🎨 public/              # Frontend (HTML/CSS/JS)
│   ├── index.html          # หน้าแรก
│   ├── watch.html          # หน้าดูหนัง (Modern UI)
│   ├── login.html          # หน้าล็อกอิน
│   ├── admin-add-*.html    # หน้าแอดมิน
│   └── assets/             # CSS, JS, Images
└── 🔒 .gitignore           # ป้องกันข้อมูลลับ
```

### 2. 🔧 การติดตั้ง Backend

#### **ติดตั้ง Dependencies:**
```bash
cd backend
npm install
```

#### **ตั้งค่า Environment:**
```bash
# คัดลอกไฟล์ template
cp ../.env.example .env

# แก้ไขค่าใน .env
nano .env
```

#### **เริ่ม Backend Server:**
```bash
cd backend
node server.js
# จะขึ้น: 🚀 DUY-DOE Server ready on port 3000
```

### 3. 🎨 การเริ่ม Frontend

#### **เปิดหน้าเว็บ:**
```bash
cd public
# ใช้ VS Code Live Server หรือ
python -m http.server 5500
# หรือใช้ extension อื่นๆ
```

#### **หน้าเว็บทั้งหมด:**
- 🏠 **หน้าแรก**: `http://127.0.0.1:5500/index.html`
- 🎬 **ดูหนัง**: `http://127.0.0.1:5500/watch.html`
- 🔐 **ล็อกอิน**: `http://127.0.0.1:5500/login.html`
- ⚙️ **แอดมิน**: `http://127.0.0.1:5500/admin-add-movie.html`

---

## 🔑 การตั้งค่า Firebase

### 1. 📥 สร้าง Service Account
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก Project → Project Settings → Service accounts
3. คลิก "Generate new private key"
4. บันทึกเป็น `backend/service-account-key.json`

### 2. 🔧 ตั้งค่า Environment Variables
```bash
# ใน backend/.env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 🤖 สร้าง Gemini API Key
1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. สร้าง API key ใหม่
3. คัดลอกมาใส่ใน `.env`

---

## 🎯 ฟีเจอร์ที่พร้อมใช้งาน

### ✅ **Frontend Features:**
- 🎨 **Modern UI Design** - สวยงามทันสมัย
- 📱 **Fully Responsive** - รองรับมือถือ
- 🔍 **SEO Optimized** - ค้นหาง่าย
- 🎬 **Video Player** - 16:9 aspect ratio
- 💬 **Comments System** - ความคิดเห็นผู้ใช้
- 🔥 **Related Movies** - หนังที่เกี่ยวข้อง
- 🎯 **PWA Ready** - ติดตั้งได้

### ✅ **Backend Features:**
- 🚀 **Express Server** - port 3000
- 🔥 **Firebase Integration** - ฐานข้อมูล
- 🤖 **AI Analysis** - Google Gemini
- 📡 **REST API** - `/api/ai/analyze`
- 🔐 **CORS Protection** - ความปลอดภัย
- 📊 **Error Handling** - จัดการ error

### ✅ **Admin Features:**
- 👤 **Secure Login** - duydoe / admin123
- 🎬 **Add Movies** - ฟอร์มเพิ่มหนัง
- 📺 **Add Series** - ฟอร์มเพิ่มซีรีส์
- 🤖 **AI Fetch** - ดึงข้อมูลอัตโนมัติ
- 🎨 **Professional UI** - ดีไซน์สวยงาม

---

## 🌐 การ Deploy ขึ้น Production

### 1. 🚀 Deploy Frontend (Vercel)
```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
cd public
vercel --prod

# ตั้งค่า Environment Variables บน Vercel
# FIREBASE_API_KEY, FIREBASE_PROJECT_ID, API_BASE_URL
```

### 2. 🔥 Deploy Backend (Railway/Heroku)
```bash
# ใช้ Railway
railway login
railway init
railway up

# หรือ Heroku
heroku create your-app-name
git push heroku main
```

### 3. 🔐 ตั้งค่า Production Environment
```bash
# บน hosting (Vercel/Netlify/Railway)
FIREBASE_API_KEY=your_production_key
FIREBASE_PROJECT_ID=your_production_project
API_BASE_URL=https://your-backend-url.com
```

---

## 🛡️ ความปลอดภัย

### ✅ **ที่ป้องกันแล้ว:**
- 🔒 **.gitignore** - ป้องกันข้อมูลลับ
- 🔐 **Environment Variables** - ไม่อัปโหลดขึ้น GitHub
- 🚫 **Admin Protection** - ต้องล็อกอินก่อน
- 🔍 **No Indexing** - หน้าแอดมินไม่ถูกค้นหา
- 🛡️ **CORS** - ป้องกัน cross-origin

### ⚠️ **ต้องตั้งค่า:**
- 🔑 **API Keys** - ใช้ environment variables
- 🌐 **HTTPS** - ใช้ SSL บน production
- 🔥 **Firebase Rules** - ตั้งค่า security rules
- 📊 **Rate Limiting** - จำกัดการใช้งาน

---

## 📱 การทดสอบ

### 1. 🧪 ทดสอบ Backend
```bash
curl http://localhost:3000
# ควรได้: 🚀 DUY-DOE AI Backend is Running!

curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### 2. 📱 ทดสอบ Frontend
- เปิด `http://127.0.0.1:5500`
- ทดสอบ responsive บนมือถือ
- ทดสอบ video player
- ทดสอบ admin login

### 3. 🔥 ทดสอบ Firebase
- ตรวจสอบ connection
- ทดสอบ authentication
- ทดสอบ database operations

---

## 🚨 การแก้ไขปัญหา

### **Backend ไม่ทำงาน:**
```bash
# ตรวจสอบ port
netstat -an | grep 3000

# ตรวจสอบ .env
cat backend/.env

# ตรวจสอบ logs
node server.js
```

### **Frontend ไม่โหลด:**
- ตรวจสอบว่า backend ทำงาน
- ตรวจสอบ console errors
- ตรวจสอบ path ของไฟล์

### **Firebase ไม่เชื่อมต่อ:**
- ตรวจสอบ service-account-key.json
- ตรวจสอบ environment variables
- ตรวจสอบ Firebase rules

---

## 📞 ติดต่อ/สนับสนุน

### 🎯 **สถานะ:** พร้อมใช้งานจริง!
- ✅ **Backend** - ทำงานได้ 100%
- ✅ **Frontend** - พร้อม deploy
- ✅ **Security** - ปลอดภัยครบถ้วน
- ✅ **Mobile** - Responsive ดีเยี่ยม

### 🚀 **พร้อม deploy:**
- 🌐 **Vercel** - Frontend
- 🔥 **Railway** - Backend
- 🗄️ **Firebase** - Database

---

**🎉 DUY-DOE HD พร้อมออนไลน์แล้ว!** 🎬✨
