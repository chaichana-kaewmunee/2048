# 2048: Neon Fusion — Owner Decision Register

สถานะเอกสาร: **PROPOSED** (ยังไม่ได้รับการอนุมัติจาก Owner)
ใช้คู่กับ `docs/requirements.md`

## วิธีอ่าน

| สถานะ | ความหมาย |
|---|---|
| APPROVED | Owner ตัดสินแล้ว (อ้างอิงแหล่งที่มา) |
| PENDING | ยังไม่มีคำตอบจาก Owner ห้ามพัฒนาส่วนนั้นจนกว่าจะตัดสิน |
| ASSUMPTION | ค่าตั้งต้นที่ผู้จัดทำเสนอ ยังไม่ได้รับการยืนยัน |
| PARTIALLY VERIFIED | มีหลักฐานบางส่วน ยังไม่ครบเงื่อนไขปิด |

**หมายเหตุการตั้งรหัส:** รหัส `D1`–`D10` เป็นรหัสที่ Owner ใช้ก่อนหน้านี้ (ไม่มี `-`) รหัส `D-xx` ในตารางนี้เป็นรหัสที่ `requirements.md` อ้างถึง และยังไม่มีคำจำกัดความก่อนเอกสารนี้ ฉบับนี้กำหนดให้ตามที่ใช้ในเอกสาร และมีข้อสังเกตเรื่องการชนกันของรหัสที่หัวข้อ "ประเด็นที่ต้องยืนยัน"

---

## 1. การตัดสินใจที่ Owner ตัดสินแล้ว (D1–D10)

| รหัส | เรื่อง | สถานะ | แหล่งที่มา |
|---|---|---|---|
| D1 | ตัด Leaderboard ออกจาก MVP | APPROVED | Owner |
| D2 | เก็บ Best Score และสถิติด้วย SQLite | APPROVED | Owner |
| D3 | ไม่มี Authentication | APPROVED | Owner |
| D4 | Dev ใช้ Vite แยกจาก Elysia, Production แยก Static Frontend กับ API | APPROVED | Owner |
| D5 | Undo ไม่จำกัดในเกมปัจจุบัน | APPROVED | Owner |
| D6 | เล่นต่อหลัง 2048 ได้ | APPROVED | Owner |
| D7 | กระดาน 4×4 เท่านั้น | APPROVED | Owner |
| D8 | RNG ฉีดได้ (Deterministic สำหรับเทสต์) | APPROVED | Owner |
| D9 | UI รองรับ English (ค่าเริ่มต้น) และ Thai สลับได้ จำค่าผ่าน localStorage | APPROVED | Owner |
| D10 | API Key เดิมถือว่าเปิดเผยแล้ว ต้อง Revoke/Rotate | **PENDING** (ยังไม่มีหลักฐาน ดู D-33) | Owner ถือว่าเปิดเผยแล้ว |

---

## 2. ทะเบียนการตัดสินใจ (D-xx)

### 2.1 กฎเกม (Gameplay)

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-01 | การจัดวางช่องเริ่มต้น (จำนวนและค่า) | **PENDING** | (ก) 2 ช่อง ค่า 2 ทั้งหมด (ข) 2 ช่อง สุ่ม 2 หรือ 4 (ค) จำนวนอื่นที่ Owner กำหนด | Phase 3 (ยังไม่มีใน §1.2 จึงกำหนดค่าไม่ได้) |
| D-02 | การเกิดช่องใหม่: 2 (90%) / 4 (10%) | APPROVED | §1.2 (OPEN-6) | Phase 3 |
| D-03 | Classic หรือ Custom rules | APPROVED เฉพาะ §1.2 | กฎตาม §1.2 ทั้งหมดคือกฎที่อนุมัติ กฎอื่นที่ไม่ได้เขียนใน §1.2 ต้องถามก่อนใช้ (ดู D-01) | Phase 3 |
| D-04 | กระดานขนาด 4×4 | APPROVED | D7 | Phase 2–3 |
| D-05 | เล่นต่อหลัง 2048 | APPROVED | D6 | Phase 3, 5 |
| D-06 | Undo หลังแพ้ (สถานะ Over) | **PENDING** | (ก) ไม่อนุญาต (ข) อนุญาต (ค) อนุญาตเฉพาะภายในเวลาที่กำหนด | Phase 3, 5 |
| D-07 | เวลาบันทึก Best Score และนิยาม Won / Lost / Average Score (เกมที่เคยถึง 2048 แล้วแพ้นับเป็นอะไร) | **PENDING** (OPEN-12) | ข้อเสนอ: Best Score อัปเดตเมื่อจบเกม, Average นับจากเกมที่จบแล้ว, ยังต้องยืนยันกรณี 2048 แล้วแพ้ | Phase 3, 6 |
| D-08 | Undo ไม่จำกัดในเกมปัจจุบัน และไม่กระทบ Best Score ที่บันทึกแล้ว | APPROVED | D5, §1.4 | Phase 3 |
| D-09 | Leaderboard | APPROVED ไม่มีใน MVP | D1, §3 | — |

### 2.2 ข้อมูลและการจัดเก็บ (Persistence)

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-10 | Database: SQLite WASM + kvvfs (localStorage) | APPROVED (Storage Strategy) | D2, OPEN-8 | Phase 2, 5 |
| D-10a | ตัว Library ของ SQLite WASM | **PENDING** (OPEN-11) | ยังไม่ได้ตรวจ bundle, Bun/Vite, Browser | Phase 2 |
| D-11 | บันทึกกระดานและ Undo history ของเกมที่ค้างอยู่ข้ามการรีโหลด | **PENDING** | (ก) ไม่บันทึก (ข) บันทึกเฉพาะกระดาน (ค) บันทึกกระดานและ Undo | Phase 3, 5 |
| D-12 | Authentication | APPROVED ไม่มี | D3 | — |
| D-21 | หลายแท็บและการจัดการข้อมูลเสียหาย (OPEN-13) | **PENDING** | kvvfs ไม่มี locking ข้ามแท็บ ต้องเสนอกลไกให้ Owner อนุมัติ | Phase 5, 8 |
| D-22 | รูปแบบการแจ้งเมื่อ Storage ไม่พร้อมหรือเต็ม (OPEN-14) | **PENDING** | (ก) แบนเนอร์ (ข) Dialog (ค) แจ้งใน Settings เท่านั้น | Phase 5 |
| D-20 | เกมเล่นต่อได้เมื่อ Storage ใช้ไม่ได้ | APPROVED หลักการ | §1.5, DP-4 | Phase 5 |
| D-24 | ปุ่มรีเซ็ตสถิติ | **PENDING** | (ก) มี (ข) ไม่มี | Phase 5, 6 |
| D-27 | Schema version และการ migrate | **PENDING** | ตัดสินตอน Phase 3 หรือ 6 | Phase 3, 6 |
| D-34 | COOP/COEP สำหรับ kvvfs | PARTIALLY VERIFIED (OPEN-10) | เงื่อนไขปิด: ทดสอบโหลด kvvfs ใน Browser จริงโดยไม่ตั้ง header และบันทึกผล | Phase 5, 8, Deploy |
| D-23 | ความหมายของ "ออกจากเกม" (ปิดแท็บ, กลับเมนู หรือทั้งสอง) | **PENDING** | ผลกระทบต่อ Undo history (D5) | Phase 3, 5 |

### 2.3 Backend

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-17 | หน้าที่ของ Elysia นอกจาก Health endpoint (OPEN-9) | **PENDING** | (ก) Health อย่างเดียว (ข) Health + เสิร์ฟ Static Assets (ขัดกับ §1.6 จึงไม่แนะนำ) (ค) ตัวเลือกอื่น | Phase 6 |
| D-15 | เล่นได้โดยไม่มี Backend (Offline) | **PENDING** | Backend ไม่เก็บข้อมูลผู้เล่น จึงควรเล่นได้โดยไม่มี API ต้องยืนยันว่าเกมต้องทำงานเมื่อ Elysia ไม่ทำงาน และต้องการ PWA/Service Worker หรือไม่ (ขอบเขตนอก MVP ถ้าไม่ระบุ) | Phase 2, 5, 6 |
| D-18 | รูปแบบ Error response | **PENDING** (BE-5) | ต้องตัดสินก่อน Phase 2 shared types | Phase 2, 6 |
| D-31 | Vite proxy `/api` ไป Elysia ตอน Dev (A4) | ASSUMPTION | ไม่ขัดกับ D4 เพราะยังเป็นสองโปรเซส ต้องยืนยัน | Phase 2 |
| D-32 | ค่า CORS และ API Base URL ของ Production | **PENDING** (BE-6) | ค่าจริงรอ Owner (ต้องกำหนดตาม §1.6) | Phase 2, 8, Deploy |

### 2.4 เทคโนโลยีและ Workflow

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-19 | Stack: Bun, TypeScript, React, Phaser 3, Elysia, Modular Monorepo | **PENDING** (ระบุใน Master Prompt แต่ Owner ยังไม่ยืนยันใน Phase 1) | Master Prompt §1 | Phase 2 |
| D-16 | Git workflow (สาขา, รูปแบบ commit, นโยบาย push) | **PENDING** | สถานะปัจจุบัน: `597d580 first commit` ถูก push ไป `origin/main` แล้ว (ตาม Phase 0) ต้องกำหนดกติกาก่อนทำ commit ถัดไป | ทุก Phase |
| D-28 | เป้าหมายประสิทธิภาพ FPS/Input latency, ขนาด Bundle, Browser ที่รองรับ (NFR-4/5/6) | **PENDING** | ตัวเลขยังเป็น UNKNOWN ต้องรอ Owner (Browser ผูกกับ D-10a) | Phase 2, 9 |
| D-29 | เครื่องมือ E2E และเป้าหมาย coverage | **PENDING** | ยังไม่มีข้อเสนอให้เลือก | Phase 2, 8 |

### 2.5 UI / UX / Accessibility / Responsive

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-14 | ทิศทางภาพ ธีม และชุดสี | **PENDING** | ต้องให้ Owner เลือกแนวทาง (เช่น neon โทนมืด หรือ สว่าง) | Phase 4, 5, 7 |
| D-25 | Reduced motion และ WCAG level / contrast | **PENDING** | ต้องเลือกระดับ WCAG (เช่น AA) | Phase 5, 7 |
| D-26 | Breakpoint, ขนาดหน้าจอที่รองรับ และการปัดนิ้ว (swipe) | **PENDING** | ต้องเลือก breakpoint และว่าจะรองรับ swipe หรือไม่ | Phase 5, 7 |
| D-30 | การแสดงตัวเลขและวันที่ตาม Locale (A5) | ASSUMPTION | ตามภาษาที่เลือก ต้องยืนยัน | Phase 5 |

### 2.6 Audio

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-13 | เสียงเอฟเฟกต์ เพลงประกอบ ปุ่มเปิดปิดเสียง | **PENDING** | (ก) ไม่มี (ข) เอฟเฟกต์เท่านั้น (ค) เอฟเฟกต์และเพลง | Phase 7 |

### 2.7 Security

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-33 | หลักฐานการ Revoke/Rotate API Key เดิม (OPEN-7) | **PENDING** | ต้องมีหลักฐานจากผู้ให้บริการ โดยไม่แสดงค่า Secret ใช้เป็น Gate ของ Phase 1 | Phase 1 Gate |

### 2.8 เอกสารและการอนุมัติ

| รหัส | หัวข้อ | สถานะ | ตัวเลือก / ข้อเสนอ | ผลต่อ Phase |
|---|---|---|---|---|
| D-35 | Owner อนุมัติ `requirements.md` ฉบับสุดท้ายเป็นลายลักษณ์อักษร (AC-5) | **PENDING** | รอหลังตอบข้อที่ PENDING ข้างต้น | Phase 1 Gate |

---

## 3. ประเด็นที่ต้องยืนยัน (ข้อสังเกตจากการตรวจเอกสาร)

1. **การชนกันของรหัส:** `D6` (เล่นต่อหลัง 2048, APPROVED) ไม่เกี่ยวกับ `D-06` (Undo หลังแพ้, PENDING) เพื่อหลีกเลี่ยงความสับสน Owner อาจต้องเลือกให้เปลี่ยนรหัส `D-xx` เป็นชุดอื่น
2. **OPEN-12 ยังไม่ปิด:** นิยาม Won/Lost/Average Score และเวลาบันทึก Best Score ยัง PENDING (D-07) ทั้งที่ §1.10 อนุมัติรายการสถิติแล้ว
3. **ข้อกำหนดกฎเกมที่ยังไม่มี:** §1.2 ไม่ระบุการจัดวางช่องเริ่มต้น (D-01) ซึ่ง Master Prompt ระบุว่าต้องตัดสิน
4. **ความสัมพันธ์ Elysia กับเกม:** ถ้า Backend ไม่เก็บข้อมูลผู้เล่น (BE-1) ยังไม่ชัดว่า Elysia จำเป็นต่อการเล่นหรือไม่ (D-15, D-17)
5. **kvvfs และ Browser:** ยังไม่ได้ทดสอบ Browser จริง (D-34 และ D-10a) จึงยังไม่ควรเลือก Library

---

## 4. การอนุมัติ

| ผู้อนุมัติ | วันที่ | ผล (อนุมัติ / อนุมัติพร้อมเงื่อนไข / ปฏิเสธ) | หมายเหตุ |
|---|---|---|---|
| Owner | | | |
