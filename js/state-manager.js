/**
 * State Manager — Shared state ใน localStorage
 * Single Source of Truth: repair.requests (ทุกหน้าอ่าน/เขียนชุดนี้)
 * Cross-tab sync ผ่าน storage event
 */

const SM = (function () {
  const LS_USER = 'repair.currentUser';
  const LS_REQUESTS = 'repair.requests';
  const LS_VERSION = 'repair.version';

  const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  let cache = {
    user: null,
    requests: []
  };

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
      cache.user = u ? JSON.parse(u) : null;
      cache.requests = r ? JSON.parse(r) : null;
      if (!Array.isArray(cache.requests)) seed();
    } catch (e) {
      seed();
    }
  }

  function seed() {
    cache.user = null;
    cache.requests = MOCK_DATA.seedRequests.map((r) => JSON.parse(JSON.stringify(r)));
    try {
      localStorage.setItem(LS_VERSION, '1');
      localStorage.removeItem(LS_USER);
      persistRequests();
    } catch (e) { console.error(e); }
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
    const acc = MOCK_DATA.accounts[username];
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

  function assignTechnician(id, techName, actor) {
    const r = get(id);
    if (!r) return { ok: false, reason: 'ไม่พบรายการ' };
    if (r.status !== 'รับเรื่อง' && r.status !== 'รอตรวจสอบ') return { ok: false, reason: 'รับเรื่องก่อนจึงมอบหมายช่างได้' };
    if (!techName) return { ok: false, reason: 'กรุณาเลือกช่าง' };
    r.assignedTechnician = techName;
    r.assignedAt = thaiDate();
    if (r.status === 'รอตรวจสอบ') r.status = 'รับเรื่อง';
    pushHistory(r, r.status, actor, 'มอบหมาย ' + techName);
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
    registerStorageListener
  };
})();