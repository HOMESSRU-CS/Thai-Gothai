# 🗺️ ท่องเที่ยวไทย — Thai Tourism Web App

เว็บแอปพลิเคชันรวบรวมสถานที่ท่องเที่ยวในประเทศไทย พร้อม Firebase Backend

## ฟีเจอร์

- 🌏 สถานที่ท่องเที่ยว 4 ภาค (เหนือ, กลาง, ตะวันออก, ใต้)
- 🌙 ธีมมืด/สว่าง (Dark/Light Mode)
- 🔐 ล็อกอิน Email/Password และ Google
- 📷 อัปโหลดรูปภาพพร้อมประมวลผล (ปรับความสว่าง/คอนทราสต์)
- 📝 แบบสอบถามความพึงพอใจ
- 📊 หลังบ้าน Admin พร้อมกราฟ

---

## การติดตั้ง

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **Add project** → ตั้งชื่อ → สร้าง
3. ไปที่ **Authentication** → **Sign-in method** → เปิด **Email/Password** และ **Google**
4. ไปที่ **Firestore Database** → **Create database** → เลือก Production mode
5. ไปที่ **Storage** → **Get started**

### 2. ตั้งค่า Firebase Config

```bash
# Copy .env.example เป็น .env
cp .env.example .env
```

แก้ไข `.env` ด้วย credentials จาก Firebase Console:
**Project Settings → Your apps → Web app → SDK setup**

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...

# อีเมลที่จะเป็น Admin
VITE_ADMIN_EMAIL=your@email.com
```

### 3. ติดตั้ง Firestore Rules

ไปที่ Firestore → Rules → วาง content จาก `firestore.rules`

ไปที่ Storage → Rules → วาง content จาก `storage.rules`

### 4. รัน Project

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## โครงสร้างโปรเจกต์

```
src/
├── firebase/config.js        Firebase init
├── contexts/
│   ├── ThemeContext.jsx       จัดการ Dark/Light mode
│   └── AuthContext.jsx        จัดการ Authentication state
├── services/
│   ├── authService.js         Login, Register, Google auth
│   ├── placesService.js       CRUD สถานที่
│   ├── surveysService.js      บันทึกและดึงข้อมูลแบบสอบถาม
│   ├── uploadsService.js      อัปโหลดรูปภาพ + Canvas processing
│   └── usersService.js        จัดการผู้ใช้
├── components/
│   ├── Navbar.jsx             Navigation + theme toggle + auth
│   ├── Hero.jsx               หน้าแรก
│   ├── RegionSection.jsx      แสดงสถานที่ตามภาค
│   ├── PlaceCard.jsx          การ์ดสถานที่
│   ├── PlaceDetail.jsx        รายละเอียด + GPS + rating
│   ├── LoginModal.jsx         ล็อกอิน/สมัครสมาชิก
│   ├── UploadModal.jsx        อัปโหลดรูปพร้อมประมวลผล
│   ├── SurveyModal.jsx        แบบสอบถาม
│   └── admin/
│       ├── AdminDashboard.jsx  หลังบ้าน (OverviewTab, ContentTab, etc.)
│       └── charts/
│           ├── BarChart.jsx
│           ├── PieChart.jsx
│           └── LineChart.jsx
├── data/initialPlaces.js      ข้อมูลสถานที่เริ่มต้น (seed)
└── main.jsx / App.jsx
```

## Admin Access

ผู้ใช้ที่มีอีเมลตรงกับ `VITE_ADMIN_EMAIL` จะได้รับสิทธิ์ Admin อัตโนมัติเมื่อล็อกอิน  
Admin สามารถเข้าถึงหลังบ้านได้จาก Navbar → **หลังบ้าน**
"# Thai-gothai" 
