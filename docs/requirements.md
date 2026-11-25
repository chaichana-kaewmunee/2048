# 2048: Neon Fusion — Requirements

สถานะเอกสาร: **DRAFT** — Owner อนุมัติรายข้อแล้วบางส่วน แต่ **Phase 1 Gate ยังไม่ผ่าน** (ดู §4)
ผู้ตรวจสอบ: Owner (ยังไม่ได้อนุมัติเอกสารฉบับสุดท้าย)

ป้ายกำกับ:
- **APPROVED** — Owner ตัดสินใจแล้ว
- **ASSUMPTION** — ค่าตั้งต้นที่ผู้จัดทำเสนอ ยังไม่ได้รับการยืนยัน
- **PENDING** — เสนอแล้ว แต่ Owner ยังไม่ได้ยืนยันเป็นรายข้อ
- **OPEN** — ยังไม่มีการตัดสินใจ ต้องถาม Owner ก่อนพัฒนาส่วนนั้น

---

## 1. Approved Requirements

### 1.1 ขอบเขต MVP (APPROVED)
- เกม 2048 บนกระดาน 4×4 เท่านั้น (D7)
- Game Core เป็น TypeScript บริสุทธิ์ ไม่พึ่ง React, Phaser หรือ Browser API (Master Prompt §3)
- Frontend: React (UI) + Phaser 3 (การแสดงผลและ input กระดาน)
- Backend: Bun + Elysia REST API
- ฐานข้อมูล: SQLite WASM ทำงานในเบราว์เซอร์ (OPEN-1) ด้วย Storage Strategy ตาม §1.5 Backend ไม่เก็บข้อมูลผู้เล่น
- ไม่มีการยืนยันตัวตน (D3)
- ไม่มี Leaderboard (D1, ดู §3)

### 1.2 Game Rules (APPROVED — OPEN-6 อนุมัติตามข้อเสนอ)
| ข้อ | พฤติกรรม |
|---|---|
| กระดาน | 4×4 ช่องว่างแทนด้วย `0` |
| การเลื่อน | เลื่อนทั้งหมดไปทางใดทางหนึ่งจากสี่ทิศ (ซ้าย ขวา ขึ้น ลง) |
| การรวม | ช่องที่เท่ากันและอยู่ติดกันรวมเป็นค่าเป็นสองเท่า รวมได้ครั้งเดียวต่อการเลื่อนหนึ่งครั้ง |
| คะแนน | ทุกการรวมเพิ่มคะแนนเท่ากับค่าของช่องที่รวมแล้ว |
| การเกิดช่องใหม่ | หลังการเลื่อนที่เปลี่ยนกระดาน เกิดช่อง `2` (90%) หรือ `4` (10%) ในช่องว่างแบบสุ่ม |
| การเลื่อนที่ไม่เปลี่ยนกระดาน | ไม่เกิดช่องใหม่ ไม่เปลี่ยนคะแนน และไม่บันทึกลง Undo History |
| ชนะ | ครั้งแรกที่มีช่องถึง `2048` แสดงหน้าชนะเพียงครั้งเดียวต่อเกม |
| แพ้ | ไม่มีช่องว่างและไม่มีช่องติดกันที่เท่ากัน |
| ความสุ่ม | RNG ต้องฉีดเข้าไปได้ เพื่อให้เทสต์ทำซ้ำได้ (D8) |

### 1.3 การเล่นต่อหลัง 2048 (APPROVED)
- หลังได้ `2048` เกมดำเนินต่อได้ (D6)

### 1.4 Undo (APPROVED — OPEN-2 อนุมัติแล้ว)
- Undo ได้ไม่จำกัดจำนวนครั้งภายในเกมปัจจุบัน (D5)
- Undo ต้องไม่ทำให้ Game State เสียความถูกต้อง
- การเริ่มเกมใหม่หรือออกจากเกม ให้ Undo History ของเกมเดิมสิ้นสุดลง
- Undo ไม่กระทบ Best Score ที่บันทึกไปแล้ว
- สถิติการเล่นนับเมื่อจบเกมเท่านั้น
- Undo ไม่สามารถย้อนกลับไปแก้ไขสถิติที่บันทึกแล้ว

### 1.5 Persistence (APPROVED — OPEN-8 Storage Strategy อนุมัติแล้ว)
- ใช้ SQLite เก็บ Best Score และสถิติการเล่นของผู้เล่น (D2)
- Storage Strategy สำหรับ MVP: **SQLite WASM + kvvfs (localStorage)** (OPEN-8)
- การอนุมัตินี้เป็นการอนุมัติ Storage Strategy เท่านั้น **ยังไม่ได้เลือก SQLite WASM Library ตัวใด** (ดู OPEN-11)
- Backend Elysia ไม่เก็บ ไม่อ่าน และไม่ประมวลผลข้อมูลผู้เล่นใด ๆ
- ออกแบบให้เหมาะกับการใช้งานแบบ Local-first
- ไม่เก็บ Leaderboard
- ข้อกำหนดเพิ่มเติม (Owner กำหนด):
  - **ต้องตรวจสอบข้อจำกัด Storage Quota** ของ kvvfs (ประมาณ 5MB ตามเอกสาร SQLite) และ Browser Compatibility ก่อนพัฒนา
  - **ต้องพิจารณาการใช้งานหลาย Tab** (kvvfs ไม่มี locking ข้ามแท็บ และอาจเกิด corruption ตามเอกสาร) กลไกที่เลือกต้องเสนอให้ Owner อนุมัติ (OPEN-13)
  - **ต้องจัดการข้อมูลเสียหาย** โดยไม่ทำให้แอปพัง (OPEN-13)
  - **ต้องรองรับกรณี Browser Storage ไม่พร้อมใช้งานหรือเต็ม** แอปต้องเล่นต่อได้โดยไม่ล้มเหลว รูปแบบการแจ้งผู้เล่นเป็น OPEN-14
  - **ต้องไม่รับประกันว่าข้อมูลจะอยู่ถาวร** ผู้ใช้สามารถ Clear Site Data ได้ และเอกสาร/UI ต้องไม่สัญญาความคงทนของข้อมูล

### 1.6 การพัฒนาและการเสิร์ฟ (APPROVED — OPEN-4)
- Development: Vite Dev Server ทำ Frontend และ HMR แยกจาก Elysia Backend (D4)
- Production: แยกการเสิร์ฟ Frontend และ Backend
  - Frontend Build เป็น Static Assets และ Deploy ผ่าน Static Web Server หรือ Static Hosting
  - Backend ใช้ Elysia ให้บริการ API เท่านั้น
  - ไม่กำหนดให้ Elysia เสิร์ฟ Frontend
  - ต้องกำหนด CORS และ API Base URL ให้เหมาะกับ Production Environment
- ห้ามเพิ่มระบบ Infrastructure หรือบริการภายนอกโดยไม่ได้รับอนุมัติ
- ยังไม่ Implement ใน Phase 1
- Storage ของ MVP (kvvfs): เอกสาร SQLite ที่อ่านไม่ได้ระบุว่า kvvfs ต้องใช้ COOP/COEP (ข้อกำหนดนี้ระบุไว้ใน OPFS) แต่ยัง **ไม่ได้ทดสอบจริง** จึงยังไม่ยืนยันว่าไม่ต้องใช้ (ดู OPEN-10 และ §4.1)

### 1.7 ภาษา UI (APPROVED — OPEN-5 อนุมัติแล้ว)
- รองรับภาษาอังกฤษ (English) และภาษาไทย (Thai) (D9)
- ภาษาเริ่มต้นคือ English
- ต้องสลับภาษาได้จาก UI
- ข้อความ UI ที่ผู้ใช้มองเห็นทั้งหมดต้องรองรับทั้งสองภาษา
- จำภาษาที่ผู้เล่นเลือกผ่าน localStorage
- ไม่ใช้ SQLite จัดเก็บการตั้งค่าภาษา

### 1.8 ความปลอดภัยของ Secret (APPROVED)
- API Key ใน `.claude/settings.local.json` ถือว่าเปิดเผยแล้ว (D10)
- ต้อง Revoke หรือ Rotate และออก Key ใหม่ ห้ามนำ Key เดิมกลับมาใช้
- ห้ามแสดง Secret ในเอกสาร รายงาน หรือ Git
- สถานะ D10: **ยังไม่ได้รับการยืนยัน** จนกว่าจะมีหลักฐานการ Rotate หรือ Revoke (ดู OPEN-7)

### 1.9 ทดสอบ (APPROVED)
- ใช้ Deterministic RNG ในการทดสอบ (D8)
- ต้องทดสอบอย่างน้อยตาม Master Prompt Rule D (การเลื่อนทั้งสี่ทิศ, การรวม, ไม่รวมซ้ำในหนึ่งการเลื่อน, คะแนน, การเลื่อนที่ไม่ถูกต้อง, การเกิดช่องสุ่ม, ชนะ, แพ้, Undo, การคงสถานะ, Frontend integration, Backend API validation)

### 1.10 สถิติการเล่น (APPROVED — OPEN-3 อนุมัติรายการแล้ว)
- Total Games Played
- Total Games Won
- Total Games Lost
- Best Score
- Highest Tile
- Average Score

**นิยามของแต่ละรายการยังไม่ได้รับการยืนยัน (OPEN-12)** เช่น เกมที่เคยถึง 2048 แล้วแพ้ นับเป็น Won หรือ Lost หรือทั้งสอง, Average Score เฉลี่ยจากเกมที่จบเท่านั้นหรือไม่, Best Score อัปเดตระหว่างเกมหรือเมื่อจบเกม

---

## 2. Assumptions (ASSUMPTION — ยังไม่ได้รับการยืนยัน)

- **A1** ผู้ใช้เล่นบนเครื่องเดียว ไม่มีบัญชีผู้ใช้ จึงไม่มีการแยกข้อมูลระหว่างผู้ใช้
- **A2** ~~ภาษาเริ่มต้นและการจำค่า~~ ย้ายไปเป็น APPROVED ใน §1.7 แล้ว
- **A3** ~~Undo ย้อนคะแนนและกระดาน~~ ย้ายไปเป็น APPROVED ใน §1.4 แล้ว (การย้อนคะแนนและกระดานกลับเป็นความหมายเดียวกับ Undo ตามข้อ D5 และ §1.4)
- **A4** (ยังไม่ได้รับการทบทวนจาก Owner) Development ใช้ Port แยกสำหรับ Vite และ Elysia โดย Vite proxy `/api` ไปยัง Elysia
- **A5** (ยังไม่ได้รับการทบทวนจาก Owner) ตัวเลขและวันที่แสดงตาม Locale ของภาษาที่เลือก

---

## 3. Out of Scope (MVP)

- Leaderboard ทุกรูปแบบ รวมถึง API และ Database Schema (D1)
- การยืนยันตัวตน การลงทะเบียน และการล็อกอิน (D3)
- การเล่นหลายคนหรือ Multiplayer
- การเก็บข้อมูลผู้เล่นฝั่ง Backend (ตัดสินแล้วตาม OPEN-1 ตัวเลือก ข)
- การซิงก์ข้อมูลระหว่างอุปกรณ์
- การใช้ OPFS เป็นที่เก็บข้อมูลใน MVP (Owner เลือก kvvfs ตาม OPEN-8)
- การจัดการกระดานขนาดอื่นนอกจาก 4×4 (D7)
- การส่งคะแนนไปเซิร์ฟเวอร์เพื่อตรวจสอบความถูกต้อง
- Sound (Phase 7)
- Future Enhancement: Leaderboard ที่มีการยืนยันคะแนนฝั่งเซิร์ฟเวอร์ (เสนอภายหลังได้ ต้องมีการตัดสินใจใหม่)

---

## 4. Open Items

| ID | ประเด็น | สถานะ | ผลกระทบ |
|---|---|---|---|
| OPEN-1 | SQLite กับ Local-first | **RESOLVED** Owner เลือก SQLite ใน Browser ผ่าน WASM, Backend ไม่เก็บข้อมูลผู้เล่น | ลด Phase 6 เหลือ Health endpoint และการเสิร์ฟ (ดู OPEN-9) |
| OPEN-2 | Undo กระทบสถิติและ Best Score หรือไม่ | **RESOLVED** ดู §1.4 | Integrity ของ Best Score |
| OPEN-3 | รายการสถิติการเล่น | **RESOLVED** รายการดู §1.10 (นิยามรอ OPEN-12) | Schema และหน้า Statistics |
| OPEN-4 | Production deployment | **RESOLVED** แยกการเสิร์ฟ Frontend (Static) และ Backend (Elysia API) ดู §1.6 | Phase 2 และ Phase 8 |
| OPEN-5 | ภาษาเริ่มต้นและการจำค่าภาษา | **RESOLVED** ดู §1.7 | Phase 5 |
| OPEN-6 | Game Rules §1.2 | **RESOLVED** Owner ยืนยันตามข้อเสนอ ดู §1.2 | Phase 3 |
| OPEN-7 | D10: ยังไม่มีหลักฐานการ Rotate หรือ Revoke Key | **PENDING** | Gate ของ Phase 1 ไม่ผ่านจนกว่าจะมีหลักฐาน |
| OPEN-8 | Storage Strategy (SQLite WASM + kvvfs) | **RESOLVED** ดู §1.5 (ไม่รวมการเลือก Library ซึ่งเป็น OPEN-11) | Phase 2 และ Phase 5 |
| OPEN-9 | Elysia มีหน้าที่อะไรนอกจาก Health endpoint | **OPEN** | ขอบเขต Phase 6 |
| OPEN-10 | COOP/COEP headers สำหรับ kvvfs | **PARTIALLY VERIFIED** เอกสารระบุข้อกำหนด COOP/COEP กับ OPFS เท่านั้น แต่ยังไม่ได้ทดสอบ kvvfs ใน Browser โดยไม่มี header ดู §4.1 | Phase 2, 5, 8 และการ Deploy |
| OPEN-11 | เลือก SQLite WASM Library | **PENDING** ตรวจ registry แล้ว (VERIFIED metadata) แต่ยังไม่ได้ตรวจ kvvfs/ขนาด/Browser ดู §4.1 | Phase 2 (dependencies) |
| OPEN-12 | นิยามสถิติ (Won/Lost กรณีถึง 2048 แล้วแพ้, Average Score, Highest Tile, เวลาบันทึก Best Score) | **OPEN** | Schema และ Statistics |
| OPEN-13 | กลไกหลาย Tab และการจัดการข้อมูลเสียหาย สำหรับ kvvfs | **OPEN** ต้องมีข้อเสนอให้ Owner อนุมัติ | Phase 5 และ Phase 8 |
| OPEN-14 | รูปแบบการแจ้งผู้เล่นเมื่อ Storage ไม่พร้อมใช้งานหรือเต็ม | **OPEN** | Phase 5 |

### 4.1 ผลการตรวจเอกสารทางการ (OPEN-8 / OPEN-10 / OPEN-11)

แหล่งที่อ่านจริงในรอบนี้: `sqlite.org/wasm/doc/trunk/persistence.md` (ส่วนแรกและส่วนที่ครอบคลุม COOP/COEP) และ `sqlite.org/wasm/doc/trunk/kvvfs.md` (ประมาณครึ่งแรก) ยังไม่ได้ทดสอบโค้ดจริง และยังไม่ได้ติดตั้งอะไร

| ตัวเลือก | ข้อเท็จจริงจากเอกสาร | ข้อควรระวัง |
|---|---|---|
| kvvfs (localStorage) | ทำงานในเธรดหลักเท่านั้น (v1) ประมาณ **5MB** (JS ใช้ 2 ไบต์ต่ออักขระ จึงใช้จริงได้น้อยกว่า) รองรับ 1 DB ต่อ storage เมื่อเต็มการเขียนจะล้มเหลว | ไม่มี locking ข้ามแท็บ อาจเกิด corruption (เอกสารระบุว่าเป็นไปได้จริง) ใช้ WebLocks ได้แต่เป็นฝั่ง client เท่านั้น (OPEN-13) |
| kvvfs key prefix | คีย์ทั้งหมดขึ้นต้นด้วย `kvvfs-local-` เพื่อไม่ชนกับข้อมูลอื่นใน localStorage | การตั้งค่าภาษา (§1.7) ใช้คีย์อื่นได้โดยไม่ชน |
| kvvfs ความปลอดภัยข้อมูล | ข้อมูลหายได้จากการล้างข้อมูลเว็บหรือเหตุผลฝั่งเบราว์เซอร์ | ต้องไม่รับประกันความถาวร (§1.5) |
| OPFS VFS | ต้องรันใน Worker และต้องมี COOP/COEP (ใช้ SharedArrayBuffer) | ไม่ใช้ใน MVP ตาม OPEN-8 |
| OPFS SAHPool / WASMFS | เอกสารระบุว่า SAHPool ไม่รองรับ concurrency ข้ามแท็บ WASMFS เป็น work in progress และต้อง COOP/COEP ทั้งไลบรารี | ไม่ใช้ใน MVP |
| Incognito / Guest | เอกสารระบุว่าควอตาอาจต่ำลงหรือไม่คงทน และตรวจล่วงหน้าไม่ได้อย่างน่าเชื่อถือ | ต้องรองรับ storage ไม่พร้อมใช้งาน (OPEN-14) |

**OPEN-10 (COOP/COEP) — PARTIALLY VERIFIED (ไม่ใช่ RESOLVED และไม่ใช่ NOT APPLICABLE):**
- เอกสาร SQLite ที่อ่านระบุว่า COOP/COEP จำเป็นสำหรับ OPFS VFS (ใช้ SharedArrayBuffer) และ WASMFS
- เอกสาร kvvfs ที่อ่านได้ (ทั้งสองส่วนที่ดึงมา) **ไม่ได้กล่าวถึง** COOP/COEP แต่หน้าเอกสารนั้นยาวกว่าที่ดึงมา จึงยืนยันว่าไม่ต้องใช้ไม่ได้ (ส่วนที่เหลือยังไม่ได้อ่าน)
- ยังไม่ได้ทดสอบ kvvfs โหลดจริงโดยไม่มี header เพราะยังไม่มีโปรเจกต์และห้ามติดตั้ง
- **เงื่อนไขปิด:** ทดสอบโหลด kvvfs ใน Browser จริงโดยไม่ตั้ง COOP/COEP และบันทึกผล ทำใน Phase 5 (ต้องมีโปรเจกต์ก่อน)

**OPEN-11 (เลือก Library) — PENDING:**
- เอกสาร SQLite ระบุว่า canonical build ของ `sqlite3.wasm` รวม kvvfs และ `JsStorageDb` (OO1 API) ซึ่งเป็นตัวเลือกที่สอดคล้องกับ Storage Strategy
- **VERIFIED (npm registry ผ่าน `npm view`, ไม่ได้ install):** `@sqlite.org/sqlite-wasm` เวอร์ชันล่าสุด `3.54.1-build1`, license Apache-2.0, dist-tag `latest` คือ 3.54.1-build1, `time.modified` 2026-10-19 (ค่าจาก registry ตามที่ได้รับ)
- ผู้จัดทำยัง **ไม่ได้** ตรวจ: ขนาด bundle, ความเข้ากันได้กับ Bun และ Vite, Browser ที่รองรับ, และว่า package นี้ build kvvfs ไว้จริง (ต้องยืนยันจาก package ก่อนเลือก)
- ยังไม่ได้เลือก Library จนกว่า Owner จะอนุมัติ
- ยังไม่ควรเลือก Library จนกว่าจะตรวจ: ความเข้ากันได้กับ Bun และ Vite, ขนาด bundle, ใบอนุญาต, ความเคลื่อนไหวของ package, และ Browser ที่รองรับ

### 4.2 การอนุมัติใน Phase 1 รอบนี้

รายการที่ Owner อนุมัติและย้ายไปเป็น APPROVED แล้ว (ไม่มี PROPOSED เหลืออยู่):
- OPEN-2 Undo → §1.4
- OPEN-3 Statistics → §1.10
- OPEN-5 Language → §1.7
- OPEN-8 Storage Strategy → §1.5
- OPEN-6 Game Rules → §1.2

การอนุมัติทั้งหมดนี้ **ไม่ใช่การอนุมัติ Phase 1 Gate**

---

## 5. การตรวจสอบความสอดคล้อง (Consistency Check)

- `README.md`: มีเพียง `# 2048` ไม่ขัดแย้งกับเอกสารนี้
- `.gitignore`: ignore `.claude/settings.local.json` แล้ว (ยืนยันด้วย `git check-ignore`)
- โค้ดต้นทาง: ยังไม่มี (ไม่มี `package.json`, `tsconfig.json`, หรือไฟล์ source)
- Master Prompt Phase 6 กล่าวถึง Leaderboard "หากได้รับอนุมัติ" ซึ่งยังไม่ได้รับอนุมัติ จึงไม่อยู่ใน MVP
- ตรวจแล้วว่าไม่มีข้อความ PROPOSED ค้างอยู่ในส่วนที่อนุมัติ และ OPEN-2/3/5/8 ไม่มีข้อความขัดกับ §1
- ยังไม่ได้ตรวจการ build หรือการทดสอบใด ๆ เพราะยังไม่มีโค้ด

---

## 6. Non-Functional Requirements

| ID | ข้อกำหนด | สถานะ |
|---|---|---|
| NFR-1 | Game Core ต้องไม่ import React, Phaser หรือ DOM/Browser API | APPROVED (Master Prompt §3) |
| NFR-2 | TypeScript strict mode และหลีกเลี่ยง `any` | PROPOSED |
| NFR-3 | การเลื่อนทำซ้ำได้ด้วย RNG ที่ฉีดเข้าไป | APPROVED (D8) |
| NFR-4 | เป้าหมายประสิทธิภาพ (FPS, เวลาตอบสนองต่อการกดปุ่ม) | PENDING ไม่มีตัวเลขจาก Owner (UNKNOWN) |
| NFR-5 | ขนาด Bundle สูงสุด | PENDING |
| NFR-6 | Browser ที่รองรับ | PENDING (ผูกกับ OPEN-11) |
| NFR-7 | Dependencies ต้องมี lockfile และ pin เวอร์ชัน | PROPOSED (ทำใน Phase 2) |

## 7. Game State Lifecycle

สถานะด้านล่างมาจากกฎที่อนุมัติแล้ว (§1.2–§1.4) การตั้งชื่อและการแสดงผลยังเป็น PROPOSED

| สถานะ | เข้าเมื่อ | ทำได้ | ออกเมื่อ | สถานะเอกสาร |
|---|---|---|---|---|
| Playing | เริ่มเกมใหม่ หรือเลือกเล่นต่อหลังชนะ | เลื่อน, Undo | ชนะครั้งแรก หรือแพ้ | PROPOSED |
| Won | มีช่องถึง `2048` ครั้งแรกในเกม | ดูหน้าชนะ (แสดงครั้งเดียวต่อเกม) | ผู้เล่นเลือกเล่นต่อ หรือจบเกม | PROPOSED (ปุ่มและพฤติกรรมเป็น PENDING) |
| Over | ไม่มีการเลื่อนที่เปลี่ยนกระดานได้ | ดูหน้าแพ้, เริ่มเกมใหม่ | เริ่มเกมใหม่ | PROPOSED (Undo หลังแพ้เป็น PENDING D-06) |
| (ทุกสถานะ) | เริ่มเกมใหม่ หรือออกจากเกม | ประวัติ Undo ของเกมเดิมสิ้นสุด | — | APPROVED (§1.4) |

ประเด็นที่ยังไม่ชัด: "ออกจากเกม" หมายถึงอะไร (ปิดแท็บ, กลับเมนู หรือทั้งสองอย่าง) เป็น PENDING

## 8. UI/UX Requirements

- รายการหน้าจอที่เสนอ: เมนูหลัก, หน้าเกม (HUD แสดงคะแนนและ Best Score), Settings, Statistics, Dialog ชนะ, Dialog แพ้ — **PROPOSED**
- ปุ่ม New Game และ Undo อยู่ในหน้าเกม — **PROPOSED**
- ทิศทางภาพ, ธีม และชุดสี — **PENDING** (D-14)
- ข้อความทั้งหมดที่ผู้ใช้เห็นต้องมีทั้ง English และ Thai (§1.7 APPROVED)

## 9. Accessibility Requirements

| ID | ข้อกำหนด | สถานะ |
|---|---|---|
| A11Y-1 | เล่นและใช้ปุ่มทั้งหมดด้วยคีย์บอร์ดได้ (ลูกศรสำหรับการเลื่อน) | PROPOSED |
| A11Y-2 | ปุ่มและ Dialog มีข้อความกำกับและ focus ที่มองเห็นได้ | PROPOSED |
| A11Y-3 | Canvas ของ Phaser ไม่สื่อความหมายเอง จึงต้องมีข้อความสรุปสถานะเกมนอก canvas | PROPOSED |
| A11Y-4 | ลด animation ได้ (prefers-reduced-motion) | PENDING (D-25) |
| A11Y-5 | ระดับ WCAG และ contrast ขั้นต่ำ | PENDING (D-25) |

## 10. Responsive Design Requirements

- ใช้งานได้บนเดสก์ท็อปและมือถือ — **PROPOSED**
- จุด breakpoint และขนาดหน้าจอที่รองรับ — **PENDING** (D-26)
- การปัดนิ้ว (swipe) บนมือถือ — **PENDING** (D-26)

## 11. Audio Requirements

- เสียงเอฟเฟกต์, เพลงประกอบ และปุ่มเปิดปิดเสียง — **PENDING** (D-13, Phase 7)

## 12. Backend Requirements

| ID | ข้อกำหนด | สถานะ |
|---|---|---|
| BE-1 | Backend ไม่เก็บ ไม่อ่าน และไม่ประมวลผลข้อมูลผู้เล่น | APPROVED (§1.5) |
| BE-2 | ไม่มี Leaderboard, Score submission หรือ Authentication | APPROVED (D1, D3) |
| BE-3 | Health endpoint และการกำหนด API version (`/api/v1/...`) | PROPOSED |
| BE-4 | หน้าที่ของ Elysia นอกจาก Health endpoint | PENDING (OPEN-9) |
| BE-5 | รูปแบบ error response | PENDING (ต้องตัดสินก่อน Phase 2 shared types) |
| BE-6 | ค่า CORS และ API base URL ของ Production | APPROVED ว่าต้องกำหนด (§1.6) ค่าจริงเป็น PENDING |

## 13. Data Persistence Requirements

| ID | ข้อกำหนด | สถานะ |
|---|---|---|
| DP-1 | เก็บ Best Score และสถิติ 6 รายการด้วย SQLite WASM + kvvfs | APPROVED (§1.5, §1.10) |
| DP-2 | เก็บค่าภาษาใน localStorage ไม่ใช่ SQLite | APPROVED (§1.7) |
| DP-3 | ต้องไม่สัญญาว่าข้อมูลคงทนถาวร | APPROVED (§1.5) |
| DP-4 | เกมเล่นต่อได้เมื่อ Storage ไม่พร้อมใช้งานหรือเต็ม | APPROVED (§1.5) รูปแบบการแจ้งเตือนเป็น PENDING (OPEN-14) |
| DP-5 | ข้อมูลเสียหายและการเปิดหลายแท็บ | PENDING (OPEN-13) |
| DP-6 | กระดานและ Undo history ของเกมที่ค้างอยู่ จะถูกบันทึกข้ามการรีโหลดหรือไม่ | PENDING (D-11) |
| DP-7 | Schema version และการ migrate | PENDING (Phase 3/6) |
| DP-8 | ปุ่มรีเซ็ตสถิติ | PENDING |

## 14. Testing Requirements

- ทดสอบอย่างน้อยตาม Rule D และ §1.9 — **APPROVED**
- Unit test สำหรับ Game Core พร้อม RNG ที่กำหนดค่าได้ — **PROPOSED**
- Integration test สำหรับ React และ Phaser — **PROPOSED**
- เครื่องมือ E2E และเป้าหมาย coverage — **PENDING**

## 15. Acceptance Criteria (ข้อเสนอสำหรับ Phase 1 Gate)

- AC-1: ทุก OPEN และ PENDING ที่กระทบ Phase 3 (กฎ, Undo, การบันทึกคะแนน) ได้รับการตัดสินแล้ว
- AC-2: OPEN-7 มีหลักฐานการ Rotate หรือ Revoke Key จากผู้ให้บริการ (ไม่แสดง Secret)
- AC-3: ทุกกฎใน §1.2 ต้องแมปกับเทสต์อัตโนมัติใน Phase 3 (ยังไม่มีในเวลานี้)
- AC-4: ไม่มีข้อความ PENDING ในส่วนที่อ้างว่า APPROVED และไม่มี Secret ในเอกสาร
- AC-5: Owner อนุมัติเอกสารฉบับสุดท้ายเป็นลายลักษณ์อักษร
