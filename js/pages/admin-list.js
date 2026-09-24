/**
 * Page: Admin Repair List
 * ตาราง(desktop)/การ์ด(mobile) + filter สถานะ + ค้นหา + ช่างผู้รับผิดชอบ
 */
Pages['admin-list'] = (function () {
  const STATUSES = ['ทั้งหมด', 'รอตรวจสอบ', 'รับเรื่อง', 'กำลังซ่อม', 'ซ่อมเสร็จ'];

  function techCell(r) {
    if (r.assignedTechnician) return `<span class="chip chip-blue">👷 ${UI.esc(r.assignedTechnician)}</span>`;
    if (r.status === 'รับเรื่อง' || r.status === 'รอตรวจสอบ') return `<span class="chip" style="background:#FEF3C7;color:#B45309">⏳ ยังไม่ได้มอบหมาย</span>`;
    return '<span class="muted">—</span>';
  }

  function cardHtml(r) {
    return UI.requestCard(r, `${techCell(r)}<span class="btn btn-outline btn-sm">เปิดดู →</span>`);
  }

  function tableRows(list) {
    return list.map((r) => `
      <tr data-id="${r.id}">
        <td style="font-weight:700;color:var(--navy-900)">${r.id}</td>
        <td>${UI.esc(r.reporter)}</td>
        <td>${UI.esc(r.building)} · ชั้น ${UI.esc(r.floor)} · ห้อง ${UI.esc(r.room)}</td>
        <td>${UI.esc(r.problemType)}</td>
        <td>${UI.urgencyChip(r.urgency)}</td>
        <td>${techCell(r)}</td>
        <td>${UI.statusBadge(r.status)}</td>
        <td style="font-size:12px;color:var(--gray-500)">${UI.esc(r.submittedAt)}</td>
      </tr>`).join('');
  }

  function render(root, params, user) {
    const current = params.status || (params.query && params.query.status) || 'ทั้งหมด';
    const requests = SM.requests();
    const filtered = (current === 'ทั้งหมด' ? requests : requests.filter((r) => r.status === current));

    const pills = STATUSES.map((s) => {
      const count = s === 'ทั้งหมด' ? requests.length : requests.filter((r) => r.status === s).length;
      const href = s === 'ทั้งหมด' ? '#/admin/list' : '#/admin/list/' + encodeURIComponent(s);
      return `<a class="filter-pill ${s === current ? 'active' : ''}" href="${href}">${s} (${count})</a>`;
    }).join('');

    const rows = tableRows(filtered);
    const cards = filtered.length ? filtered.map(cardHtml).join('') : UI.emptyState('🔍', 'ไม่พบรายการในสถานะนี้');
    const summary = SM.stats();

    root.innerHTML = `
      ${UI.pageHeader('รายการแจ้งซ่อม', 'ตรวจสอบ รับเรื่อง และมอบหมายช่าง', `
        <div class="chip chip-blue">${summary.pending} รายการรอตรวจ</div>
      `)}

      <div class="toolbar mb-2">
        <input class="input" id="search" placeholder="ค้นหาเลขที่ / ผู้แจ้ง / ห้อง..." style="max-width:320px">
      </div>

      <div class="filter-pills">${pills}</div>

      ${filtered.length === 0 ? cards : `
        <div class="rc-list">${cards}</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>เลขที่</th><th>ผู้แจ้ง</th><th>สถานที่</th><th>ประเภท</th>
                <th>ความเร่งด่วน</th><th>ช่าง</th><th>สถานะ</th><th>วันที่</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `}`;

    root.querySelector('#search').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const pool = filtered.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.reporter.toLowerCase().includes(q) ||
        (r.building + r.room).toLowerCase().includes(q)
      );
      const cardsHtml = pool.length
        ? pool.map(cardHtml).join('')
        : `<div class="empty-state" style="padding:20px">🔍 ไม่พบรายการที่ค้นหา</div>`;
      const rowsHtml = pool.length
        ? tableRows(pool)
        : `<tr><td colspan="8"><div class="empty-state" style="padding:20px">🔍 ไม่พบรายการที่ค้นหา</div></td></tr>`;
      const rcList = root.querySelector('.rc-list');
      const tbody = root.querySelector('.data-table tbody');
      if (rcList) rcList.innerHTML = cardsHtml;
      if (tbody) tbody.innerHTML = rowsHtml;
      bindRows(root);
    });

    bindRows(root);
  }

  function bindRows(root) {
    root.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', () => App.navigate('admin/detail/' + el.dataset.id));
    });
  }

  return { render };
})();