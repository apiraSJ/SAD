#!/usr/bin/env node
// -*- coding: utf-8 -*-
// Import ระบบแจ้งซ่อมอาคารนอน design tokens (จาก design-system.css) เข้า Figma
// ผ่าน REST API (Create variables: POST /v1/files/:file_key/variables)
//
// วิธีใช้:
//   1) สร้าง Personal Access Token: https://www.figma.com/developers/api#access-tokens
//      (ตั้งชื่อได้เลย ขอ scope ที่ระบบให้ เลือก file_content:read + file_variables:write)
//   2) เปิดไฟล์ใน Figma ดู File key จาก URL: figma.com/file/<FILE_KEY>/...
//   3) ใส่ค่าใน config.json หรือตั้ง env แล้วรัน:
//        node import-variables.mjs
//
// หมายเหตุ: REST API นิยามไว้ว่า "nodes/frames สร้างผ่าน plugin ภายใน Figma เท่านั้น"
// ตรงนี้จึง import เป็น Variables (สี/สเปซ/รัศมี/ฟอนต์/เลย์เอาต์) ซึ่งเป็นสารตั้งต้น
// ที่ design system จะอ้างอิงได้เลยใน Figma.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function log(...a) { console.log('•', ...a); }
function errOut(...a) { console.error('✗', ...a); }

// ---------- config ----------
let cfg = {};
try {
  cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch {
  cfg = {};
}

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || cfg.FIGMA_TOKEN || '';
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || cfg.FIGMA_FILE_KEY || '';

const API = 'https://api.figma.com/v1';

async function api(method, urlPath, body) {
  const res = await fetch(API + urlPath, {
    method,
    headers: {
      'Authorization': `Bearer ${FIGMA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    errOut(`${method} ${urlPath} → HTTP ${res.status}`);
    if (typeof data === 'string') errOut(data.slice(0, 500));
    else errOut(JSON.stringify(data, null, 2).slice(0, 1200));
    process.exit(1);
  }
  return data;
}

// ---------- 1. ตรวจ token ----------
log('ตรวจ Personal Access Token …');
const me = await api('GET', '/me');
log(`เชื่อมต่อสำเร็จ: ${me.email || me.handle || '(no handle)'} (${me.id})`);

// ---------- 2. ตรวจไฟล์ ----------
log(`เปิดไฟล์ key: ${FIGMA_FILE_KEY}`);
const file = await api('GET', `/files/${FIGMA_FILE_KEY}?depth=1`);
log(`ไฟล์: "${file.name}"`);

// ---------- 3. เช็ค idempotency (หา collection "SAD/*" ที่ import ไปแล้ว) ----------
let existing = { variableCollections: [] };
try {
  existing = await api('GET', `/files/${FIGMA_FILE_KEY}/variables`);
} catch (e) {
  log('อ่าน variables เดิมไม่สำเร็จ (ข้ามไป ถ้ายังไม่มี collection)');
}
const done = (existing.variableCollections || []).filter((c) => (c.name || '').startsWith('SAD/'));
if (done.length) {
  log(`มี collection "SAD/*" แล้ว ${done.length} ชุด (${done.map((c) => c.name).join(', ')}) — ข้ามการ import ซ้ำ เพื่อกัน duplicate`);
  process.exit(0);
}

// ---------- 4. สร้าง payload ----------
const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens.json'), 'utf8'));

const collections = [];
const variables = [];
let colId = 1, modeId = 1, varId = 1;

for (const col of tokens.collections) {
  const cid = `VariableCollectionId:${colId++}`;
  const mid = `VariableModeId:${modeId++}`;
  collections.push({
    id: cid,
    name: col.name,
    modes: [{ id: mid, name: 'Default' }],
    defaultModeId: mid,
  });
  for (const item of col.items) {
    const vid = `VariableID:${varId++}`;
    let value = item.value;
    let scope = ['ALL_SCOPES'];
    if (item.type === 'COLOR') {
      value = hexToRgba(item.value);
      scope = ['ALL_SCOPES'];
    } else if (item.type === 'STRING') {
      scope = ['TEXT_FONT'];
    } else {
      // type FLOAT
      scope = col.name.includes('Typography') ? ['TEXT_SIZE', 'ALL_SCOPES'] : ['ALL_SCOPES'];
    }
    variables.push({
      id: vid,
      type: item.type,
      name: item.name,
      variableCollectionId: cid,
      valuesByMode: { [mid]: value },
      description: item.description || '',
      hiddenFromPublishing: false,
      scopes: scope,
      codeSyntax: {},
    });
  }
}

const payload = {
  source_inline: { variableCollections: collections, variables },
  cross_file_library_source: null,
};

// ---------- 5. POST สร้าง ----------
log(`กำลังสร้าง variables ${variables.length} ตัว ใน ${collections.length} collections …`);
const created = await api('POST', `/files/${FIGMA_FILE_KEY}/variables`, payload);

const mappings = created?.createdVariableMappings || {};
const count = Object.keys(mappings).length;
log(`สำเร็จ! สร้าง variables ใหม่ ${count} ตัว`);
for (const col of collections) {
  log(`  📁 ${col.name}`);
}

// ---------- 6. สรุป ----------
log('\n────────── สรุป ──────────');
log('Variables พร้อมใช้งานในไฟล์แล้ว (เปิด Properties > Variables เพื่อดู)');
log('ถ้าต้องการให้เป็น Library แชร์ข้ามไฟล์: คลิกขวา collection → Publish styles/variables (ต้องใช้บัญชีทีมแบบมีค่าใช้จ่าย)');
log('📌 REST สร้าง Frames/Components ไม่ได้ — ถ้าต้องการหน้าจอจริง สร้าง Frame และอ้างอิง variables เหล่านี้ หรือใช้ plugin HTML-to-Figma');

function hexToRgba(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, 1)`;
}