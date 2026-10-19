# GOTHAI — เที่ยวไทย ได้ทั้งเราและชุมชน

## ชื่อ
**GOTHAI** (Go Thai) เว็บแอปพลิเคชันแนะนำสถานที่ท่องเที่ยวและร้านค้าชุมชนทั่วประเทศไทย

## วัตถุประสงค์
1. เพื่อรวบรวมสถานที่ท่องเที่ยวทั่วประเทศไทยครบ 5 ภาค พร้อมรูปภาพ คำอธิบาย เวลาเปิด-ปิด ค่าเข้าชม และพิกัดบนแผนที่ ไว้ในที่เดียว
2. เพื่อแนะนำร้านค้าชุมชนที่เข้าร่วมโครงการในแต่ละสถานที่ ทำให้พ่อค้าแม่ค้ามีงาน มีอาชีพ และมีรายได้มากขึ้น
3. เพื่อเปิดการมองเห็นร้านค้าชุมชนให้ผู้ใช้ทั่วไปและนักท่องเที่ยวรู้จัก ผ่านหน้ารายละเอียดสถานที่ แผนที่ และช่องทางติดต่อ (LINE)
4. เพื่อเก็บความคิดเห็นของผู้ใช้ผ่านแบบสอบถาม นำไปพัฒนาเว็บไซต์และโครงการต่อ

## ขอบเขตและฟังก์ชันที่พัฒนาเสร็จ

| ส่วน | ฟังก์ชัน |
|---|---|
| **หน้าแรก (Home)** | Hero พร้อมช่องค้นหา, แถบหมวดหมู่ (ภูเขา ชายหาด เกาะ วัด น้ำตก ตลาด อุทยาน), 6 สถานที่แนะนำ, Top Rated, ปุ่มสำรวจตามภาค 5 ภาค และปุ่มไปหน้าแผนที่, คำถามที่พบบ่อย (FAQ) |
| **สถานที่ (Explore)** | แสดงสถานที่ 100 แห่งแบบการ์ด, ค้นหาด้วยชื่อ/จังหวัด, กรองตามภาค |
| **รายละเอียดสถานที่** | รูป, ชื่อ, จังหวัด, คำอธิบาย, เวลาเปิด, ค่าเข้า, พิกัด GPS, อาหารแนะนำ, **ร้านค้าร่วมโครงการ** (พร้อมปุ่ม LINE), ปุ่มนำทางด้วย Google Maps, ให้คะแนน 1–5 ดาว (ต้องเข้าสู่ระบบ), ปุ่ม "ฉันไปมาแล้ว" |
| **แผนที่ (Map View)** | แผนที่ Leaflet + OpenStreetMap ปักหมุดทุกสถานที่ (สีตามภาค), ชี้/กดหมุดแสดงการ์ดรายละเอียด, รายการสถานที่ด้านข้างพร้อมค้นหาและกรองภาค |
| **ติดตามสถานที่ (Tracker)** | แผนที่ประเทศไทยรูปขวานจากช่องหกเหลี่ยม 100 ช่อง ช่องจะปลดล็อกเมื่อผู้ใช้กด "ฉันไปมาแล้ว" |
| **แบบสอบถาม** | ประเมินความพึงพอใจ 4 ด้าน, ภาคที่สนใจ, แนะนำเว็บหรือไม่, ข้อเสนอแนะ (3 ขั้นตอน) |
| **เข้าสู่ระบบ** | Google Sign-in และอีเมล/รหัสผ่าน ผ่าน Firebase Authentication |
| **หลังบ้าน (Admin)** | ภาพรวมสถิติ (สถานที่ ร้านค้าร่วมโครงการ แบบสอบถาม รูปอัปโหลด ผู้ใช้), จัดการสถานที่ (เพิ่ม/แก้ไข/ลบ), ดูแบบสอบถาม, กราฟวิเคราะห์, อนุมัติรูปที่ผู้ใช้อัปโหลด, จัดการสิทธิ์ผู้ใช้ — เข้าได้เฉพาะบัญชีแอดมิน |
| **อื่นๆ** | สลับภาษาไทย/อังกฤษ (TH/EN), ธีมมืด/สว่าง, หน้า Loading, แอนิเมชันเปิด-ปิด Modal, รองรับมือถือ (Responsive) |

**นอกขอบเขต / ยังไม่ได้ทำ:** ระบบให้ร้านค้าสมัครเข้าร่วมโครงการเองผ่านเว็บ (ปัจจุบันเพิ่มร้านผ่านข้อมูลโดยผู้ดูแล), การแปลชื่ออาหารและร้านค้าเป็นภาษาอังกฤษ

## โครงสร้างข้อมูล Firebase
ใช้ **Firebase Realtime Database** (ข้อมูล), **Authentication** (เข้าสู่ระบบ) และ **Storage** (เก็บรูปที่ผู้ใช้อัปโหลด)

```
(root)
├── places/                     สถานที่ท่องเที่ยว
│   └── {placeId}               เช่น N001, C001, NE001, E001, S001
│       ├── name_th, name_en            ชื่อสถานที่ (ไทย/อังกฤษ)
│       ├── province, province_en       จังหวัด
│       ├── region                      ภาค เช่น "ภาคเหนือ"
│       ├── description, description_en คำอธิบาย
│       ├── opening_hours(_en)          เวลาเปิด-ปิด
│       ├── entrance_fee(_en)           ค่าเข้าชม
│       ├── image, thumbnail            path รูปภาพ
│       ├── lat, lng                    พิกัด
│       ├── source                      แหล่งที่มาของข้อมูล
│       ├── rating, reviewCount         คะแนนเฉลี่ย / จำนวนรีวิว
│       ├── foods[]   { name, desc }               อาหารแนะนำ
│       └── shops[]   { name, type, partner, line } ร้านค้าร่วมโครงการ
│
├── categories/                 ภาค { north, central, northeast, east, south } → { name }
│
├── users/
│   └── {uid}                   uid, email, displayName, photoURL,
│                               role ("admin" | "user"), createdAt, lastLogin
│
├── surveys/
│   └── {pushId}                userId, userName, email,
│                               ratings { design, content, usability, overall },
│                               region, recommend, comment, createdAt
│
└── uploads/
    └── {pushId}                userId, userName, placeId, placeName, region,
                                description, imageUrl, storagePath,
                                status ("pending" | "approved" | "rejected"), createdAt
```

## โครงสร้างหน้าจอ Route และ Component
เว็บเป็น Single Page Application (React) สลับหน้าด้วย state ใน `App.jsx`

| หน้า (Route) | ไฟล์หลัก | Component ที่ใช้ |
|---|---|---|
| หน้าแรก | `App.jsx` | `Hero`, `HomeSections` (CategoryBar, TopRated, RegionExplore), FeaturedSection, FaqSection |
| สถานที่ | `components/features/explore/RegionSection.jsx` | `PlaceCard` |
| แผนที่ | `pages/MapPage.jsx` | `HoloCard` (การ์ดบนแผนที่) |
| ติดตามสถานที่ | `pages/TrackerPage.jsx` | — |
| แบบสอบถาม | `pages/SurveyPage.jsx` | — |
| หลังบ้าน | `pages/admin/AdminDashboard.jsx` | `BarChart`, `LineChart`, `PieChart` |
| รายละเอียดสถานที่ (Modal) | `components/display/PlaceDetail.jsx` | เปิดได้จากทุกหน้า |

```
src/
├── components/
│   ├── layout/      Navbar
│   ├── ui/          PlaceCard, Loader, LoginModal, SurveyModal, UploadModal
│   ├── features/
│   │   ├── explore/ RegionSection
│   │   ├── map/     HoloCard
│   │   └── home/    Hero, HomeSections
│   └── display/     PlaceDetail
├── pages/           MapPage, TrackerPage, SurveyPage, admin/
├── hooks/           useModalClose
├── context/         AuthContext, LangContext, ThemeContext
├── services/        firebase, placesService, authService, surveysService,
│                    uploadsService, usersService, visitedService
├── data/            featuredPlaces, provinceCoords
└── App.jsx, main.jsx, index.css
```

## วิธีติดตั้งและใช้งานระบบ

**สิ่งที่ต้องมี:** Node.js 18 ขึ้นไป และโปรเจกต์ Firebase

1. Clone โปรเจกต์
   ```bash
   git clone https://github.com/HOMESSRU-CS/Thai-Gothai.git
   cd Thai-Gothai
   npm install
   ```
2. สร้างไฟล์ `.env` ที่โฟลเดอร์หลัก ใส่ค่าจาก Firebase Console → Project settings
   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_DATABASE_URL=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_ADMIN_EMAIL=อีเมลที่จะได้สิทธิ์แอดมิน
   ```
3. ตั้งค่า Firebase
   - Realtime Database: Import ไฟล์ `public/data/places_all.json`
   - Authentication: เปิด Sign-in method **Google** และ **Email/Password**
4. รันเว็บ
   ```bash
   npm run dev        # โหมดพัฒนา → http://localhost:5173
   npm run build      # build สำหรับ deploy (ผลลัพธ์อยู่ในโฟลเดอร์ dist)
   ```

**การใช้งาน:** ผู้ใช้ทั่วไปดูสถานที่ แผนที่ และร้านค้าได้ทันที เข้าสู่ระบบเพื่อให้คะแนน บัญชีที่ตรงกับ `VITE_ADMIN_EMAIL` จะเห็นเมนู "หลังบ้าน" ในเมนูชื่อผู้ใช้มุมขวาบน

## ผลการทดสอบ

| รายการทดสอบ | ผลที่คาดหวัง | ผล |
|---|---|---|
| โหลดหน้าสถานที่ | แสดงการ์ดสถานที่ 100 แห่ง | ผ่าน |
| ค้นหาคำว่า "เกาะ" จากหน้าแรก | พาไปหน้าสถานที่ แสดงผลเฉพาะเกาะ (19 แห่ง) | ผ่าน |
| กรองตามภาค | แสดงเฉพาะสถานที่ในภาคที่เลือก | ผ่าน |
| เปิดหน้าแผนที่ | แสดงแผนที่และหมุด 100 จุด | ผ่าน |
| ชี้/กดหมุดบนแผนที่ | แสดงการ์ดรายละเอียดสถานที่ | ผ่าน |
| เปิดรายละเอียดเขื่อนแม่สรวย | แสดงร้านค้าร่วมโครงการ "เต้นลุงชัย" พร้อมปุ่ม LINE | ผ่าน |
| สถานที่ที่ไม่มีร้านร่วมโครงการ | แสดง "ไม่มีร้านค้าที่ร่วมโครงการ" | ผ่าน |
| สลับภาษา TH/EN | ข้อความหน้าเว็บและข้อมูลสถานที่เปลี่ยนเป็นภาษาอังกฤษ | ผ่าน |
| เข้าสู่ระบบด้วย Google | เข้าสู่ระบบได้ แสดงชื่อและรูปโปรไฟล์ | ผ่าน |
| บัญชีแอดมินเข้าหลังบ้าน | เห็นเมนูหลังบ้านและเข้าได้ | ผ่าน |
| ส่งแบบสอบถาม | ข้อมูลบันทึกลง Firebase | _รอทดสอบ_ |
| แสดงผลบนมือถือ | เมนูย่อเป็นไอคอน, Modal ขึ้นจากด้านล่าง, แผนที่อยู่ด้านบน | _รอทดสอบ_ |
| Build โปรเจกต์ (`npm run build`) | Build สำเร็จไม่มี error | ผ่าน |

## URL ของเว็บไซต์และ GitHub Repository
- **เว็บไซต์:** _(ใส่ลิงก์หลัง deploy เช่น https://gothai-webappcation.web.app)_
- **GitHub:** https://github.com/HOMESSRU-CS/Thai-Gothai

## เทคโนโลยีที่ใช้
React 18, Vite 5, Firebase (Realtime Database, Authentication, Storage), Leaflet + OpenStreetMap, Iconify
