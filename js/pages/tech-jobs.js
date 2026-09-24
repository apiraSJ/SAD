/**
 * Page: Technician Jobs
 * งานที่ได้รับมอบหมายของช่าง (ช่างไฟฟ้า A = tech01)
 */
Pages['tech-jobs'] = (function () {
  const PILLS = ['ทั้งหมด', 'รับเรื่อง', 'กำลังซ่อม', 'ซ่อมเสร็จ'];

  function render(root, params, user) {
    const current = params.status || (params.query && params.query.status) || 'ทั้งหมด';
    const all = SM.requests().filter((r) => r.assignedTechnician === user.name);
    const filtered = current === 'ทั้งหมด' ? all : all.filter((r) => r.status === current);

    const stats = {
      ready: all.filter((r) => r.status === 'รับเรื่อง').length,
      working: all.filter((r) => r.status === 'กำลังซ่อม').length,
      done: all.filter((r) => r.status === 'ซ่อมเสร็จ').length
    };

    const pills = PILLS.map((s) => {
      const count = s === 'ทั้งหมด' ? all.length :
        (s === 'รับเรื่อง' ? stats.ready : (s === 'กำลังซ่อม' ? stats.working : stats.done));
      const href = s === 'ทั้งหมด' ? '#/tech/jobs' : '#/tech/jobs/' + encodeURIComponent(s);
      return `<a class="filter-pill ${s === current ? 'active' : ''}" href="${href}">${s} (${count})</a>`;
    }).join('');

    const cards = filtered.length ? filtered.map((r) => {
      const action = r.status === 'ซ่อมเสร็จ'
        ? `<span class="btn btn-outline btn-sm">ดูผลซ่อม →</span>`
        : `<span class="btn btn-primary btn-sm">เปิดงาน →</span>`;
      return UI.requestCard(r, action);
    }).join('') : UI.emptyState('🧰', 'ไม่มีงานในหมวดนี้');

    const rows = filtered.map((r) => `
      <tr data-id="${r.id}">
        <td style="font-weight:700;color:var(--navy-900)">${UI.esc(r.id)}</td>
        <td>${UI.esc(r.reporter)}</td>
        <td>${UI.esc(r.building)} · ชั้น ${UI.esc(r.floor)} · ห้อง ${UI.esc(r.room)}</td>
        <td>${UI.esc(r.problemType)}</td>
        <td>${UI.urgencyChip(r.urgency)}</td>
        <td>${UI.statusBadge(r.status)}</td>
        <td style="font-size:12px;color:var(--gray-500)">${UI.esc(r.submittedAt)}</td>
      </tr>`).join('');

    root.innerHTML = `
      ${UI.pageHeader('งานของฉัน', 'งานที่ได้รับมอบหมาย (' + UI.esc(user.name) + ')')}

      <div class="stat-grid cols-3 mb-4">
        ${UI.statCard('🆕', 'งานใหม่', stats.ready, 'รอเริ่มดำเนินการ', '#DBEAFE')}
        ${UI.statCard('🛠️', 'กำลังซ่อม', stats.working, 'กำลังดำเนินการ', '#FFEDD5')}
        ${UI.statCard('✅', 'เสร็จแล้ว', stats.done, 'ปิดงานแล้ว', '#DCFCE7')}
      </div>

      <div class="filter-pills">${pills}</div>

      ${filtered.length === 0 ? cards : `
        <div class="job-list mt-3">${cards}</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>เลขที่</th><th>ผู้แจ้ง</th><th>สถานที่</th><th>ประเภท</th>
                <th>ความเร่งด่วน</th><th>สถานะ</th><th>วันที่</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`}`;

    root.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', () => App.navigate('tech/result/' + el.dataset.id));
    });
  }

  return { render };
})();