/**
 * State Manager — Shared state ใน localStorage
 * Single Source of Truth: repair.requests (ทุกหน้าอ่าน/เขียนชุดนี้)
 * Cross-tab sync ผ่าน storage event
 */

const SM = (function () {
  const LS_USER = 'repair.currentUser';
  const LS_REQUESTS = 'repair.requests';
  const LS_USERS = 'repair.users';
  const LS_SETTINGS = 'repair.settings';
  const LS_VERSION = 'repair.version';

  const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  let cache = {
    user: null,
    requests: [],
    users: null,
    settings: null
  };

  function parseThaiDate(str) {
    const m = String(str || '').match(/^(\d{1,2}) ([^\s]+) (\d{4}) (\d{2}):(\d{2})$/);
    if (!m) return null;
    const month = THAI_MONTHS.indexOf(m[2]);
    if (month < 0) return null;
    const t = new Date(Number(m[3]) - 543, month, Number(m[1]), Number(m[2]), Number(m[3])).getTime();
    return Number.isFinite(t) ? t : null;
  }

  function defaultUsers() {
    return Object.values(MOCK_DATA.accounts).map((a) => ({
      username: a.username, password: a.password, name: a.name, role: a.role
    }));
  }

  function defaultSettings() {
    return {
      buildings: MOCK_DATA.buildings.slice(),
      floors: MOCK_DATA.floors.slice(),
      problemTypes: MOCK_DATA.problemTypes.slice()
    };
  }

  function thaiDate(d) {
    const date = d || new Date();
    const buddhistYear = date.getFullYear() + 543;
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${buddhistYear} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function uid() {
    let n = lastId + 1;
    while (cache.requests.some((r) => r.id === 'REP-' + String(n).padStart(4, '0'))) n++;
    lastId = n;
    return 'REP-' + String(n).padStart(4, '0');
  }

  function formatMoney(n) {
    return '฿' + Number(n || 0).toLocaleString('th-TH');
  }

  function emptyExpense() {
    return { parts: [], laborCost: 0, otherCost: 0 };
  }

  function expenseTotal(expense) {
    const e = expense || emptyExpense();
    const parts = (e.parts || []).reduce((sum, p) => sum + (Number(p.qty) || 0) * (Number(p.unitPrice) || 0), 0);
    return parts + (Number(e.laborCost) || 0) + (Number(e.otherCost) || 0);
  }

  function persistRequests() {
    try { localStorage.setItem(LS_REQUESTS, JSON.stringify(cache.requests)); }
    catch (e) { console.error('localStorage full/error', e); }
  }

  function persistUsers() {
    try { localStorage.setItem(LS_USERS, JSON.stringify(cache.users)); }
    catch (e) { console.error('localStorage full/error', e); }
  }

  function persistSettings() {
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(cache.settings)); }
    catch (e) { console.error('localStorage full/error', e); }
  }

  function persistUser() {
    try {
      if (cache.user) localStorage.setItem(LS_USER, JSON.stringify(cache.user));
      else localStorage.removeItem(LS_USER);
    } catch (e) { console.error(e); }
  }

  function load() {
    let version = null;
    try { version = localStorage.getItem(LS_VERSION); } catch (e) {}
    if (version !== '1') {
      seed();
      return;
    }
    try {
      const u = localStorage.getItem(LS_USER);
      const r = localStorage.getItem(LS_REQUESTS);
      const us = localStorage.getItem(LS_USERS);
      const st = localStorage.getItem(LS_SETTINGS);
      cache.user = u ? JSON.parse(u) : null;
      cache.requests = r ? JSON.parse(r) : null;
      cache.users = us ? JSON.parse(us) : null;
      cache.settings = st ? JSON.parse(st) : null;
      if (!Array.isArray(cache.requests)) seed();
      if (!Array.isArray(cache.users)) seedUsers();
      if (!cache.settings || typeof cache.settings !== 'object') seedSettings();
    } catch (e) {
      seed();
    }
  }

  function seed() {
    cache.user = null;
    cache.requests = MOCK_DATA.seedRequests.map((r) => JSON.parse(JSON.stringify(r)));
    cache.requests.forEach((r) => { if (!r.ts) r.ts = parseThaiDate(r.submittedAt) || Date.now(); });
    seedUsers();
    seedSettings();
    try {
      localStorage.setItem(LS_VERSION, '1');
      localStorage.removeItem(LS_USER);
      persistRequests();
      persistUsers();
      persistSettings();
    } catch (e) { console.error(e); }
  }

  function seedUsers() {
    cache.users = defaultUsers();
  }

  function seedSettings() {
    cache.settings = defaultSettings();
  }

  function reset() {
    seed();
  }

  let lastId = 0;
  function computeLastId() {
    lastId = cache.requests.reduce((m, r) => {
      const n = parseInt((r.id || '').replace(/\D/g, ''), 10);
      return Number.isFinite(n) && n > m ? n : m;
    }, 0);
  }

  /* ---------- Session ---------- */
  function login(username, password) {
    const acc = listUsers().find((u) => u.username === username);
    if (!acc || acc.password !== password) return null;
    cache.user = { username: acc.username, name: acc.name, role: acc.role };
    persistUser();
    return cache.user;
  }

  function logout() {
    cache.user = null;
    persistUser();
  }

  function user() { return cache.user; }
  function role() { return cache.user ? cache.user.role : null; }

  /* ---------- Requests ---------- */
  function requests() { return cache.requests; }

  function get(id) {
    return cache.requests.find((r) => r.id === id) || null;
  }

  function createRepair(data) {
    const now = thaiDate();
    const req = {
      id: uid(),
      ts: Date.now(),
      reporter: data.reporter,
      reporterUser: data.reporterUser,
      building: data.building,
      floor: data.floor,
      room: data.room,
      problemType: data.problemType,
      urgency: data.urgency,
      description: data.description.trim(),
      photo: data.photo || null,
      submittedAt: now,
      status: 'รอตรวจสอบ',
      assignedTechnician: null,
      assignedAt: null,
      startAt: null,
      completedAt: null,
      repairResult: null,
      expense: emptyExpense(),
      history: [
        { status: 'รอตรวจสอบ', timestamp: now, actor: data.reporter, note: 'สร้างคำขอแจ้งซ่อม' }
      ]
    };
    cache.requests.unshift(req);
    persistRequests();
    return req;
  }

  function pushHistory(req, status, actor, note) {
    req.history.push({ status, timestamp: thaiDate(), actor, note });
    req.status = status;
    persistRequests();
  }

  /* --- Status transitions (validate ชุดการกระทำ) --- */
  function acceptRequest(id, actor) {
    const r = get(id);
    if (!r || r.status !== 'รอตรวจสอบ') return { ok: false, reason: 'สถานะปัจจุบันไม่สามารถรับเรื่องได้' };
    pushHistory(r, 'รับเรื่อง', actor, 'ตรวจสอบและรับเรื่อง');
    return { ok: true };
  }

  function assignTechnician(id, techName, actor, note) {
    const r = get(id);
    if (!r) return { ok: false, reason: 'ไม่พบรายการ' };
    if (r.status !== 'รับเรื่อง' && r.status !== 'รอตรวจสอบ') return { ok: false, reason: 'รับเรื่องก่อนจึงมอบหมายช่างได้' };
    if (!techName) return { ok: false, reason: 'กรุณาเลือกช่าง' };
    const prev = r.assignedTechnician;
    r.assignedTechnician = techName;
    r.assignedAt = thaiDate();
    if (r.status === 'รอตรวจสอบ') r.status = 'รับเรื่อง';
    pushHistory(r, r.status, actor, note || (prev && prev !== techName ? 'เปลี่ยนช่างจาก ' + prev + ' เป็น ' + techName : 'มอบหมาย ' + techName));
    return { ok: true };
  }

  function startRepair(id, actor) {
    const r = get(id);
    if (!r) return { ok: false, reason: 'ไม่พบรายการ' };
    if (r.status !== 'รับเรื่อง') return { ok: false, reason: 'ต้องรับเรื่องและมอบหมายช่างก่อนเริ่มงาน' };
    r.startAt = thaiDate();
    pushHistory(r, 'กำลังซ่อม', actor, 'เริ่มดำเนินการซ่อม');
    return { ok: true };
  }

  function saveResult(id, { repairResult, parts, laborCost, otherCost }) {
    const r = get(id);
    if (!r) return { ok: false, reason: 'ไม่พบรายการ' };
    if (r.status !== 'กำลังซ่อม') return { ok: false, reason: 'บันทึกผลการซ่อมได้เมื่อสถานะเป็นกำลังซ่อม' };
    if (!repairResult || !repairResult.trim()) return { ok: false, reason: 'กรุณากรอกรายละเอียดผลการซ่อม' };
    const cleanParts = (parts || []).filter((p) => p && p.name && String(p.name).trim());
    const invalidCost = Number(laborCost) < 0 || Number(otherCost) < 0 ||
      (parts || []).some((p) => Number(p.qty) < 0 || Number(p.unitPrice) < 0);
    if (invalidCost) return { ok: false, reason: 'ค่าใช้จ่ายต้องไม่เป็นค่าลบ' };
    r.repairResult = repairResult.trim();
    r.expense = {
      parts: cleanParts.map((p) => ({ name: String(p.name).trim(), qty: Number(p.qty) || 0, unitPrice: Number(p.unitPrice) || 0 })),
      laborCost: Number(laborCost) || 0,
      otherCost: Number(otherCost) || 0
    };
    persistRequests();
    return { ok: true };
  }

  function closeRepair(id, actor) {
    const r = get(id);
    if (!r) return { ok: false, reason: 'ไม่พบรายการ' };
    if (r.status !== 'กำลังซ่อม') return { ok: false, reason: 'ปิดงานได้เมื่อซ่อมเสร็จแล้วเท่านั้น' };
    if (!r.repairResult || !r.repairResult.trim()) return { ok: false, reason: 'ต้องบันทึกผลการซ่อมก่อนปิดงาน' };
    r.completedAt = thaiDate();
    pushHistory(r, 'ซ่อมเสร็จ', actor, 'บันทึกผลการซ่อมและปิดงาน');
    return { ok: true };
  }

  /* ---------- Users (User Management) ---------- */
  function listUsers() {
    if (!Array.isArray(cache.users)) {
      cache.users = defaultUsers();
      persistUsers();
    }
    return cache.users;
  }

  function findUser(username) {
    return listUsers().find((u) => u.username === username) || null;
  }

  function saveUser(data) {
    const username = String(data.username || '').trim();
    const name = String(data.name || '').trim();
    const password = String(data.password || '');
    const role = String(data.role || '');
    if (!username) return { ok: false, reason: 'กรุณากรอกชื่อผู้ใช้' };
    if (!name) return { ok: false, reason: 'กรุณากรอกชื่อ-นามสกุล' };
    if (!password) return { ok: false, reason: 'กรุณากรอกรหัสผ่าน' };
    if (!Object.keys(MOCK_DATA.roleMeta).includes(role)) return { ok: false, reason: 'กรุณาเลือกสิทธิ์' };

    const users = listUsers();
    const idx = users.findIndex((u) => u.username === username);
    if (idx >= 0) {
      users[idx] = { username, name, password, role };
      persistUsers();
      return { ok: true, isNew: false };
    }
    users.push({ username, name, password, role });
    persistUsers();
    return { ok: true, isNew: true };
  }

  function deleteUser(username) {
    const users = listUsers();
    if (cache.user && cache.user.username === username) return { ok: false, reason: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้' };
    const idx = users.findIndex((u) => u.username === username);
    if (idx < 0) return { ok: false, reason: 'ไม่พบผู้ใช้นี้' };
    users.splice(idx, 1);
    persistUsers();
    return { ok: true };
  }

  function refreshSession() {
    if (!cache.user) return;
    const u = findUser(cache.user.username);
    if (u) cache.user = { username: u.username, name: u.name, role: u.role };
    persistUser();
  }

  /* ---------- Settings (UR-18) ---------- */
  function settings() {
    if (!cache.settings || typeof cache.settings !== 'object') {
      cache.settings = defaultSettings();
      persistSettings();
    }
    return cache.settings;
  }

  function saveSettings(next) {
    const s = settings();
    const merged = {
      buildings: Array.isArray(next.buildings) ? next.buildings.map((x) => String(x).trim()).filter(Boolean) : s.buildings,
      floors: Array.isArray(next.floors) ? next.floors.map((x) => String(x).trim()).filter(Boolean) : s.floors,
      problemTypes: Array.isArray(next.problemTypes) ? next.problemTypes.map((x) => String(x).trim()).filter(Boolean) : s.problemTypes
    };
    if (!merged.buildings.length) return { ok: false, reason: 'ต้องมีอาคารอย่างน้อย 1 รายการ' };
    if (!merged.floors.length) return { ok: false, reason: 'ต้องมีชั้นอย่างน้อย 1 รายการ' };
    if (!merged.problemTypes.length) return { ok: false, reason: 'ต้องมีประเภทปัญหาอย่างน้อย 1 รายการ' };
    cache.settings = merged;
    persistSettings();
    return { ok: true };
  }

  /* ---------- Stats (คำนวณจาก shared state) ---------- */
  function stats() {
    const list = cache.requests;
    const byStatus = { 'รอตรวจสอบ': 0, 'รับเรื่อง': 0, 'กำลังซ่อม': 0, 'ซ่อมเสร็จ': 0 };
    const byType = {};
    const byBuilding = {};
    let totalCost = 0;

    (list || []).forEach((r) => {
      if (byStatus[r.status] === undefined) byStatus[r.status] = 0;
      byStatus[r.status]++;
      byType[r.problemType] = (byType[r.problemType] || 0) + 1;
      byBuilding[r.building] = (byBuilding[r.building] || 0) + 1;
      if (r.status === 'ซ่อมเสร็จ') totalCost += expenseTotal(r.expense);
    });

    return {
      total: list.length,
      byStatus,
      byType,
      byBuilding,
      totalCost,
      pending: byStatus['รอตรวจสอบ'],
      accepted: byStatus['รับเรื่อง'],
      working: byStatus['กำลังซ่อม'],
      done: byStatus['ซ่อมเสร็จ']
    };
  }

  function registerStorageListener(cb) {
    window.addEventListener('storage', (e) => {
      if (e.key === LS_REQUESTS || e.key === LS_USER) {
        load();
        if (cb) cb(e.key);
      }
    });
  }

  load();
  computeLastId();

  return {
    login, logout, user, role,
    requests, get, createRepair,
    acceptRequest, assignTechnician, startRepair, saveResult, closeRepair,
    reset,
    stats,
    thaiDate, formatMoney, expenseTotal, uid,
    registerStorageListener,
    listUsers, findUser, saveUser, deleteUser, refreshSession,
    settings, saveSettings
  };
})();