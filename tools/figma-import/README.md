# ส่ง Design ขึ้น Figma — ระบบแจ้งซ่อมอาคารนอน

มี 2 ทาง (ทางการเขียน node ทำไม่ได้ จึงเลือก REST ตามที่ตกลง):

## ทาง A: import Design Tokens เข้า Figma Variables (REST — ทำได้จริง)

**REST API ของ Figma สร้าง Variables ได้ แต่สร้าง Frame/Component ไม่ได้**
(คำจำกัดความของ Figma: node สร้างได้จาก plugin ภายในแอปเท่านั้น)

### ขั้นตอน

1. **สร้าง Personal Access Token**
   - https://www.figma.com/developers/api#access-tokens
   - sign in Figma → Settings → Security → Personal access tokens → **Generate new token** (ขอ scope `file_content:read` และ `file_variables:write`)

2. **หา File Key**
   - เปิดไฟล์ที่จะใส่ tokens ในเบราว์เซอร์
   - URL รูปแบบ `https://www.figma.com/file/<FILE_KEY>/<ชื่อไฟล์>` — เอาตัว `<FILE_KEY>` (เช่น `AbC123xYz`)

3. **ใส่ค่า** ใน `tools/figma-import/config.json` (หรือตั้ง env `FIGMA_TOKEN` / `FIGMA_FILE_KEY`)

4. **รัน**
   ```powershell
   node tools/figma-import/import-variables.mjs
   ```

5. เปิดไฟล์ใน Figma → **Explore → Variables** จะเห็น collection:
   | Collection | ประเภท |
   |---|---|
   | `SAD/Colors` | สี brand/neutral/status/feedback |
   | `SAD/Spacing` | 8 ขนาด (4–40px) |
   | `SAD/Radii` | 3 รัศมี (6/10/16) |
   | `SAD/Typography` | fontFamily + 5 fontSize |
   | `SAD/Layout` | sidebar 248, topbar 64 |

> Script กัน duplicate อัตโนมัติ: ถ้ามี collection ขึ้นต้น `SAD/` อยู่แล้ว จะข้ามไป

> ถ้าเป็นบัญชีฟรี **ตัวแปรใช้งานในไฟล์ได้ทันที** (ต้องมีบัญชีทีมแบบเสียเงิน จึงจะ Publish เป็น Library แชร์ข้ามไฟล์ได้)

## ทาง B: วาด Frame จริงด้วย plugin (สำหรับคนทำ design ต่อ)

- สร้าง Frame 1440×900 (Desktop) / 375×812 (Mobile) ใน Figma
- ใช้ **/images** และ `tools/figma-import/tokens.json` เป็นตัวอ้างอิงตัวแปร
- หรือใช้ plugin อย่าง **HTML to Figma / HTML.to.Design** ยิง URL/ไฟล์ HTML ไปแปลงเป็น Frame ได้เลย

## คำแนะนำ

- หลัง import tokens แล้ว ถ้าเปิด session opencode ใหม่ (เชื่อม MCP Figma ได้) บอกได้ — จะช่วย verify/วาดต่อผ่าน MCP (อ่านได้อย่างเดียว) ไม่ต้องพึ่ง token