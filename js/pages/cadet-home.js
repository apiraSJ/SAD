/**
 * Page: Cadet Home
 * สถิติของฉัน + ปุ่มแจ้งซ่อม + รายการแจ้งซ่อมล่าสุด
 */
Pages['cadet-home'] = (function () {
  const PAGE = 'cadet';

  function ownRequests(userName) {
    return SM.requests().filter((r) => r.reporter === userName || !r.reporterUser || r.reporterUser === userName);
  }

  function render(root, params, user) {
    const my = ownRequests(user.name);
    const pending = my.filter((r) => r.status === 'รอตรวจสอบ').length;
    const working = my.filter((r) => r.status === 'รับเรื่อง' || r.status === 'กำลังซ่อม').length;
    const done = my.filter((r) => r.status === 'ซ่อมเสร็จ').length;

    const recent = my.slice(0, 3).map((r) =>
      UI.requestCard(r, `<span>${UI.urgencyChip(r.urgency)}</span>`)
    ).join('');

    const recentRows = my.slice(0, 3).map((r) => `
      <tr data-id="${r.id}">
        <td style="font-weight:700;color:var(--navy-900)">${UI.esc(r.id)}</td>
        <td>${UI.esc(r.building)} · ชั้น ${UI.esc(r.floor)} · ห้อง ${UI.esc(r.room)}</td>
        <td>${UI.esc(r.problemType)}</td>
        <td>${UI.statusBadge(r.status)}</td>
        <td style="font-size:12px;color:var(--gray-500)">${UI.esc(r.submittedAt)}</td>
      </tr>`).join('');

    root.innerHTML = `
      ${UI.pageHeader('สวัสดีครับ, ' + UI.esc(user.name.replace(/^[^.]+\./, '')), 'ระบบแจ้งซ่อมอาคารนอน', `
        <a class="btn btn-primary" href="#/cadet/form">+ แจ้งซ่อมใหม่</a>
      `)}

      <div class="stat-grid cols-4 mb-4">
        ${UI.statCard('📋', 'รายการของฉัน', my.length, 'ทั้งหมด', 'var(--gray-100)')}
        ${UI.statCard('⏳', 'รอตรวจสอบ', pending, 'แจ้งแล้วรอตรวจ', '#FEF3C7')}
        ${UI.statCard('🛠️', 'กำลังดำเนินการ', working, 'รับเรื่อง/กำลังซ่อม', '#FFEDD5')}
        ${UI.statCard('✅', 'ซ่อมเสร็จแล้ว', done, 'ปิดงานแล้ว', '#DCFCE7')}
      </div>

      <div class="card card-pad mb-4">
        <div class="flex-between" style="margin-bottom:12px">
          <h2>แจ้งซ่อมล่าสุด</h2>
          <a class="btn btn-ghost btn-sm" href="#/cadet/tracking">ดูทั้งหมด →</a>
        </div>
        ${my.length
          ? `<div class="rc-list">${recent}</div>
             <div class="table-wrap">
               <table class="data-table">
                 <thead><tr><th>เลขที่</th><th>สถานที่</th><th>ประเภท</th><th>สถานะ</th><th>วันที่</th></tr></thead>
                 <tbody>${recentRows}</tbody>
               </table>
             </div>`
          : UI.emptyState('📭', 'ยังไม่มีรายการแจ้งซ่อมของฉัน')}
      </div>

      <div class="card card-pad" style="background:var(--blue-50);border-color:var(--blue-100)">
        <div class="flex-between flex-wrap">
          <div>
            <h3 style="color:var(--blue-800)">พบปัญหาภายในห้อง?</h3>
            <p class="muted mt-1" style="font-size:13px">แจ้งซ่อมออนไลน์ ระบบสร้างเลขที่อัตโนมัติ และติดตามสถานะได้ตลอด</p>
          </div>
          <a class="btn btn-primary" href="#/cadet/form">แจ้งซ่อมเลย →</a>
        </div>
      </div>`;

    root.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', () => App.navigate('cadet/tracking/' + el.dataset.id));
    });
  }

  return { render };
})();