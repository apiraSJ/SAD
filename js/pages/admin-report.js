/**
 * Page: Admin Report / Overview (UR-10)
 * สรุปสถิติงานซ่อม + กรองตามช่วงเวลา / อาคาร / ประเภท / สถานะ
 */
Pages['admin-report'] = (function () {

  function render(root, params, user) {
    const q = (params && params.query) || {};
    const period = ['all', '7d', '30d'].includes(q.period) ? q.period : 'all';
    const building = q.building || 'ทั้งหมด';
    const type = q.type || 'ทั้งหมด';

    const settings = SM.settings();
    const requests = SM.requests();

    const cutoff = period === '7d'
      ? Date.now() - 7 * 864e5
      : period === '30d' ? Date.now() - 30 * 864e5 : null;

    let list = requests.slice();
    if (cutoff) list = list.filter((r) => (r.ts || 0) >= cutoff);
    if (building !== 'ทั้งหมด') list = list.filter((r) => r.building === building);
    if (type !== 'ทั้งหมด') list = list.filter((r) => r.problemType === type);

    const byStatus = { 'รอตรวจสอบ': 0, 'รับเรื่อง': 0, 'กำลังซ่อม': 0, 'ซ่อมเสร็จ': 0 };
    let totalCost = 0;
    list.forEach((r) => {
      if (byStatus[r.status] === undefined) byStatus[r.status] = 0;
      byStatus[r.status]++;
      if (r.status === 'ซ่อมเสร็จ') totalCost += SM.expenseTotal(r.expense);
    });

    const statusRows = Object.entries(byStatus).map(([st, v]) => {
      const pct = list.length ? Math.round((v / list.length) * 100) : 0;
      const fillCls = { 'รอตรวจสอบ': 'amber', 'รับเรื่อง': '', 'กำลังซ่อม': 'orange', 'ซ่อมเสร็จ': 'green' }[st] || '';
      return `
        <div class="bar-row">
          <div class="bar-label">${st}</div>
          <div class="bar-track"><div class="bar-fill ${fillCls}" style="width:${pct}%"></div></div>
          <div class="bar-value">${v}</div>
        </div>`;
    }).join('');

    const costRows = list
      .filter((r) => r.status === 'ซ่อมเสร็จ')
      .slice(0, 8)
      .map((r) => `
        <tr>
          <td style="font-weight:700;color:var(--navy-900)">${r.id}</td>
          <td>${UI.esc(r.problemType)}</td>
          <td>${UI.esc(r.building)} · ห้อง ${UI.esc(r.room)}</td>
          <td>${UI.esc(r.assignedTechnician || '—')}</td>
          <td class="text-right">${SM.formatMoney(SM.expenseTotal(r.expense))}</td>
        </tr>`).join('');

    const periodLink = (p, label) =>
      `<a class="filter-pill ${period === p ? 'active' : ''}" href="#/admin/report?period=${p}&building=${encodeURIComponent(building)}&type=${encodeURIComponent(type)}">${label}</a>`;
    const buildingOpts = ['ทั้งหมด'].concat(settings.buildings).map((b) =>
      `<option value="${b}" ${b === building ? 'selected' : ''}>${b}</option>`).join('');
    const typeOpts = ['ทั้งหมด'].concat(settings.problemTypes).map((t) =>
      `<option value="${t}" ${t === type ? 'selected' : ''}>${t}</option>`).join('');

    root.innerHTML = `
      ${UI.pageHeader('ภาพรวม / รายงาน', 'สรุปงานซ่อมพร้อมตัวกรอง (' + UI.esc(user.name) + ')')}

      <div class="card card-pad mb-4">
        <div class="seg-title" style="margin-bottom:12px">🔎 ตัวกรอง</div>
        <div class="filter-pills mb-3">
          ${periodLink('all', 'ทั้งหมด')}
          ${periodLink('7d', '7 วันล่าสุด')}
          ${periodLink('30d', '30 วันล่าสุด')}
        </div>
        <div class="detail-grid d2">
          <div class="field" style="margin:0">
            <label for="fl-building">อาคาร</label>
            <select class="select" id="fl-building">${buildingOpts}</select>
          </div>
          <div class="field" style="margin:0">
            <label for="fl-type">ประเภทปัญหา</label>
            <select class="select" id="fl-type">${typeOpts}</select>
          </div>
        </div>
      </div>

      <div class="stat-grid cols-4 mb-4">
        ${UI.statCard('📊', 'รายการทั้งหมด', list.length, 'ตามตัวกรอง', 'var(--gray-100)')}
        ${UI.statCard('⏳', 'รอตรวจสอบ', byStatus['รอตรวจสอบ'], 'ยังไม่รับเรื่อง', '#FEF3C7')}
        ${UI.statCard('🛠️', 'กำลังดำเนินการ', byStatus['รับเรื่อง'] + byStatus['กำลังซ่อม'], 'รับเรื่อง/กำลังซ่อม', '#FFEDD5')}
        ${UI.statCard('💰', 'ค่าใช้จ่าย', SM.formatMoney(totalCost), 'เฉพาะงานที่เสร็จ', '#E0E7FF')}
      </div>

      <div class="detail-layout">
        <div class="seg">
          <div class="card card-pad">
            <div class="seg-title">📌 สรุปตามสถานะ</div>
            ${list.length ? statusRows : '<p class="muted mt-2">ไม่มีข้อมูลตามตัวกรองนี้</p>'}
          </div>
        </div>
        <div class="seg">
          <div class="card card-pad">
            <div class="seg-title">💳 ค่าใช้จ่ายงานที่เสร็จล่าสุด</div>
            <div class="table-wrap" style="display:block">
              <table class="data-table">
                <thead><tr><th>เลขที่</th><th>ประเภท</th><th>สถานที่</th><th>ช่าง</th><th class="text-right">รวม</th></tr></thead>
                <tbody>${costRows || '<tr><td colspan="5" class="muted">ไม่มีข้อมูลงานที่เสร็จ</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;

    bindFilters(root, period, building, type);
  }

  function bindFilters(root, period, building, type) {
    root.querySelector('#fl-building').addEventListener('change', (e) => {
      App.navigate('admin/report?period=' + period + '&building=' + encodeURIComponent(e.target.value) + '&type=' + encodeURIComponent(type));
    });
    root.querySelector('#fl-type').addEventListener('change', (e) => {
      App.navigate('admin/report?period=' + period + '&building=' + encodeURIComponent(building) + '&type=' + encodeURIComponent(e.target.value));
    });
  }

  return { render };
})();