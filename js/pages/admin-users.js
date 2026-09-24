/**
 * Page: User Management + Settings (Admin / UR-16..18)
 * - จัดการผู้ใช้: เพิ่ม / แก้ไข / ลบ + ตั้งสิทธิ์
 * - ตั้งค่าข้อมูลอ้างอิง: อาคาร / ชั้น / ประเภทปัญหา
 */
Pages['admin-users'] = (function () {
  let formOpen = false;
  let editingUser = null;

  function roleOptions(selected) {
    return Object.entries(MOCK_DATA.roleMeta).map(([k, v]) =>
      `<option value="${k}" ${k === selected ? 'selected' : ''}>${UI.esc(v.label)}</option>`).join('');
  }

  function render(root, params, user) {
    const users = SM.listUsers();
    const settings = SM.settings();
    const currentUsername = user.username;

    const rows = users.map((u) => {
      const isMe = u.username === currentUsername;
      return `
        <tr>
          <td style="font-weight:700;color:var(--navy-900)">${UI.esc(u.username)} ${isMe ? '<span class="chip chip-blue">คุณ</span>' : ''}</td>
          <td>${UI.esc(u.name)}</td>
          <td><span class="chip">${UI.esc((MOCK_DATA.roleMeta[u.role] || {}).label || u.role)}</span></td>
          <td class="text-right">
            <button class="btn btn-outline btn-sm" data-edit="${UI.esc(u.username)}">แก้ไข</button>
            <button class="btn btn-ghost btn-sm" data-del="${UI.esc(u.username)}" ${isMe ? 'disabled' : ''}>ลบ</button>
          </td>
        </tr>`;
    }).join('');

    const settingsList = (listKey, items, inputId, btnId) => `
      <div class="mb-3">
        ${items.map((item, i) => `
          <div class="set-item">
            <span>${UI.esc(item)}</span>
            <button class="btn btn-ghost btn-sm" data-set="${UI.esc(listKey)}" data-idx="${i}" title="ลบ">✕</button>
          </div>`).join('')}
      </div>
      <div class="flex" style="gap:8px">
        <input class="input" id="${inputId}" placeholder="เพิ่มรายการ..." style="flex:1">
        <button class="btn btn-outline btn-sm" id="${btnId}">+ เพิ่ม</button>
      </div>`;

    const editing = editingUser ? SM.findUser(editingUser) : null;

    root.innerHTML = `
      ${UI.pageHeader('ผู้ใช้และสิทธิ์', 'จัดการบัญชีผู้ใช้ + ตั้งค่าข้อมูลอ้างอิง (UR-16..18)', `
        <button class="btn btn-primary" id="btn-add-user">+ เพิ่มผู้ใช้</button>
      `)}

      ${formOpen ? `
        <div class="card card-pad mb-4" id="user-form">
          <div class="flex-between" style="margin-bottom:8px">
            <div class="seg-title" style="margin:0">${editing ? 'แก้ไขผู้ใช้: ' + UI.esc(editing.username) : 'เพิ่มผู้ใช้ใหม่'}</div>
            <button class="btn btn-ghost btn-sm" id="btn-user-cancel">✕ ปิด</button>
          </div>
          <div class="detail-grid d2">
            <div class="field" id="f-username">
              <label for="u-username">ชื่อผู้ใช้ (Username) *</label>
              <input class="input" id="u-username" value="${editing ? UI.esc(editing.username) : ''}" ${editing ? 'disabled' : ''} placeholder="เช่น tech04">
              <div class="field-error">กรุณากรอกชื่อผู้ใช้ที่ยังไม่ซ้ำ</div>
            </div>
            <div class="field" id="f-name">
              <label for="u-name">ชื่อ-นามสกุล *</label>
              <input class="input" id="u-name" value="${editing ? UI.esc(editing.name) : ''}">
              <div class="field-error">กรุณากรอกชื่อ-นามสกุล</div>
            </div>
            <div class="field" id="f-pass">
              <label for="u-pass">รหัสผ่าน *</label>
              <input class="input" id="u-pass" type="text" value="${editing ? UI.esc(editing.password) : ''}" placeholder="เช่น 1234">
              <div class="field-error">กรุณากรอกรหัสผ่าน</div>
            </div>
            <div class="field">
              <label for="u-role">สิทธิ์การใช้งาน *</label>
              <select class="select" id="u-role">${roleOptions(editing ? editing.role : 'cadet')}</select>
            </div>
          </div>
          <button class="btn btn-primary" id="btn-user-save">บันทึกผู้ใช้</button>
        </div>` : ''}

      <div class="card card-pad mb-4">
        <div class="seg-title" style="margin-bottom:12px">👥 รายชื่อผู้ใช้ (${users.length})</div>
        <div class="table-wrap" style="display:block">
          <table class="data-table">
            <thead><tr><th>Username</th><th>ชื่อ-นามสกุล</th><th>สิทธิ์</th><th class="text-right">จัดการ</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="field-hint mt-2" style="font-size:12px">บัญชีที่แก้ไขภายหลังจะใช้ล็อกอินเข้าสู่ระบบได้ทันที · ช่างที่เพิ่มใหม่จะปรากฏในรายการมอบหมายงาน</p>
      </div>

      <div class="detail-layout">
        <div class="seg">
          <div class="card card-pad mb-4">
            <div class="seg-title" style="margin-bottom:12px">🏢 อาคาร</div>
            ${settingsList('buildings', settings.buildings, 'add-building', 'btn-add-building')}
          </div>
          <div class="card card-pad">
            <div class="seg-title" style="margin-bottom:12px">🔢 ชั้น</div>
            ${settingsList('floors', settings.floors, 'add-floor', 'btn-add-floor')}
          </div>
        </div>
        <div class="seg">
          <div class="card card-pad">
            <div class="seg-title" style="margin-bottom:12px">🧰 ประเภทปัญหา</div>
            ${settingsList('problemTypes', settings.problemTypes, 'add-problem', 'btn-add-problem')}
          </div>
        </div>
      </div>`;

    bind(root, currentUsername);
  }

  function bind(root, currentUsername) {
    /* --- toggle form --- */
    const btnAdd = root.querySelector('#btn-add-user');
    if (btnAdd) btnAdd.addEventListener('click', () => { formOpen = true; editingUser = null; App.refresh(); });

    const btnCancel = root.querySelector('#btn-user-cancel');
    if (btnCancel) btnCancel.addEventListener('click', () => { formOpen = false; editingUser = null; App.refresh(); });

    /* --- user CRUD --- */
    root.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => { formOpen = true; editingUser = btn.dataset.edit; App.refresh(); });
    });

    root.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.del;
        UI.confirm({
          title: 'ลบผู้ใช้?',
          body: `ยืนยันลบผู้ใช้ <b>${UI.esc(username)}</b>?`,
          confirmText: 'ลบ',
          danger: true,
          onConfirm: () => {
            const res = SM.deleteUser(username);
            if (res.ok) { UI.success('ลบผู้ใช้ ' + username + ' แล้ว'); }
            else UI.error(res.reason);
            App.refresh();
          }
        });
      });
    });

    const btnSave = root.querySelector('#btn-user-save');
    if (btnSave) btnSave.addEventListener('click', () => {
      const username = (root.querySelector('#u-username').value || '').trim();
      const name = (root.querySelector('#u-name').value || '').trim();
      const password = root.querySelector('#u-pass').value;
      const role = root.querySelector('#u-role').value;
      const fU = root.querySelector('#f-username');
      const fN = root.querySelector('#f-name');
      const fP = root.querySelector('#f-pass');
      [fU, fN, fP].forEach((f) => f.classList.remove('invalid'));

      const exists = SM.findUser(username);
      if (editingUser ? false : exists) { fU.classList.add('invalid'); return; }
      if (!name) { fN.classList.add('invalid'); return; }
      if (!password) { fP.classList.add('invalid'); return; }

      const res = SM.saveUser({ username, name, password, role });
      if (!res.ok) { fU.classList.add('invalid'); UI.error(res.reason); return; }

      if (username === currentUsername) SM.refreshSession();
      UI.success(res.isNew ? 'เพิ่มผู้ใช้ ' + username + ' แล้ว' : 'อัปเดตผู้ใช้ ' + username + ' แล้ว');
      formOpen = false;
      editingUser = null;
      App.refresh();
    });

    /* --- settings --- */
    bindSettingsAdd(root, 'buildings', 'add-building', 'btn-add-building');
    bindSettingsAdd(root, 'floors', 'add-floor', 'btn-add-floor');
    bindSettingsAdd(root, 'problemTypes', 'add-problem', 'btn-add-problem');

    root.querySelectorAll('[data-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.set;
        const idx = Number(btn.dataset.idx);
        const s = SM.settings();
        const next = { ...s, [key]: s[key].filter((_, i) => i !== idx) };
        const res = SM.saveSettings(next);
        if (res.ok) UI.success('ลบรายการแล้ว');
        else UI.error(res.reason);
        App.refresh();
      });
    });
  }

  function bindSettingsAdd(root, key, inputId, btnId) {
    const input = root.querySelector('#' + inputId);
    const btn = root.querySelector('#' + btnId);
    if (!input || !btn) return;
    const add = () => {
      const v = input.value.trim();
      if (!v) { UI.error('กรุณากรอกรายการก่อนเพิ่ม'); return; }
      if ((SM.settings()[key] || []).includes(v)) { UI.error('รายการนี้มีอยู่แล้ว'); return; }
      const res = SM.saveSettings({ ...SM.settings(), [key]: SM.settings()[key].concat(v) });
      if (res.ok) UI.success('เพิ่ม "' + v + '" แล้ว');
      else UI.error(res.reason);
      App.refresh();
    };
    btn.addEventListener('click', add);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
  }

  return { render };
})();