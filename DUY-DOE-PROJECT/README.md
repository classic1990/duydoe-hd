# DUY-DOE HD PROJECT

## 📂 โครงสร้างโปรเจกต์

```
DUY-DOE-PROJECT/
├── backend/                # ส่วนของระบบหลังบ้าน (Node.js)
│   ├── node_modules/       # ไลบรารีต่างๆ (ไม่ต้องไปยุ่งกับมัน)
│   ├── service-account-key.json  # ไฟล์กุญแจ Firebase Admin
│   ├── .env                # เก็บ GEMINI_API_KEY (ห้ามหาย!)
│   ├── server.js           # ไฟล์หลักที่ใช้สั่ง node server.js
│   └── package.json        # ไฟล์ตั้งค่าโปรเจกต์ Node.js
│
├── public/                 # ส่วนของหน้าบ้าน (Frontend)
│   ├── assets/             # เก็บไฟล์เสริมแยกหมวดหมู่
│   │   ├── css/            # เก็บไฟล์ .css ทั้งหมด
│   │   │   ├── style-modern.css
│   │   │   ├── style-unified.css
│   │   │   └── admin-style.css
│   │   ├── js/             # เก็บไฟล์ .js สำหรับหน้าเว็บ
│   │   │   ├── admin-add-movie.js
│   │   │   ├── admin-add-series.js
│   │   │   ├── login-script.js
│   │   │   └── core/
│   │   │       ├── firebase-config.js
│   │   │       └── security.js
│   │   └── img/            # เก็บรูปภาพพื้นฐาน (Logo, Icons)
│   │
│   ├── admin-add-movie.html # หน้าเพิ่มหนัง
│   ├── admin-add-series.html # หน้าเพิ่มซีรีส์
│   ├── login.html          # หน้าล็อกอิน
│   ├── index.html          # หน้าแรกของเว็บไซต์
│   └── manifest.json       # PWA manifest
```

## 🚀 วิธีการเริ่มทำงาน

### 1. เปิด VS Code ที่โฟลเดอร์ DUY-DOE-PROJECT
```bash
cd D:\DEV\DUY-DOE-PROJECT
code .
```

### 2. รัน Backend (Node.js Server)
เปิด Terminal ใน VS Code แล้วพิมพ์:
```bash
cd backend
node server.js
```
ควรขึ้น: 🚀 DUY-DOE Server ready on port 3000

### 3. รัน Frontend (Live Server)
คลิกขวาที่ไฟล์ `public/admin-add-movie.html` แล้วเลือก **"Open with Live Server"**
จะเปิดหน้าเว็บผ่าน `http://127.0.0.1:5500`

## 🔐 ข้อมูลล็อกอิน
- **Username**: `duydoe`
- **Password**: `admin123`

## 📱 หน้าเว็บที่มี
- `/login.html` - หน้าล็อกอิน
- `/admin-add-movie.html` - หน้าเพิ่มหนัง
- `/admin-add-series.html` - หน้าเพิ่มซีรีส์
- `/index.html` - หน้าแรก

## 🎯 ฟีเจอร์ที่มี
- 🔐 **ระบบล็อกอิน** - ปลอดภัยด้วย session
- 🎬 **เพิ่มหนัง** - ดึงข้อมูลอัตโนมัติจากลิงก์
- 📺 **เพิ่มซีรีส์** - จัดการซีรีส์
- 🎨 **UI สวยงาม** - ดีไซน์ทันสมัย
- 📱 **Responsive** - รองรับมือถือ

## 🔥 Firebase Structure
```javascript
// Collection: movies
{
    title: "string",
    category: "string",        // "ทั่วไป", "แอคชัน", ...
    description: "string",
    poster: "string",         // YouTube thumbnail URL
    videoUrl: "string",       // YouTube embed URL
    badge: "string",          // "ทั่วไป", "ใหม่", ...
    createdAt: timestamp,
    updatedAt: timestamp,
    views: number
}

// Collection: series
{
    // โครงสร้างเดียวกับ movies
}
```

## 🛠️ การแก้ไข
- **CSS**: แก้ไขใน `public/assets/css/`
- **JavaScript**: แก้ไขใน `public/assets/js/`
- **HTML**: แก้ไขใน `public/`
- **Backend**: แก้ไขใน `backend/`

## 📝 หมายเหตุ
- ใช้ relative path (`./assets/...`) แทน absolute path (`/assets/...`)
- Backend ทำงานบน port 3000
- Frontend ทำงานบน port 5500 (Live Server)
- มีการเชื่อมต่อ Firebase และ AI พร้อมใช้งาน
