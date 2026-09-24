/**
 * Page: Executive Dashboard
 * ภาพรวมงานซ่อม: สถิติ, สถานะ, ประเภท, อาคาร, ค่าใช้จ่าย (CSS Chart)
 */
Pages['exec-dashboard'] = (function () {

  function render(root, params, user) {
    const s = SM.stats();
    const requests = SM.requests();

    const statusRows = Object.keys(s.byStatus).map((st) => {
      const v = s.byStatus[st];
      const pct = s.total ? Math.round((v / s.total) * 100) : 0;
      const fillCls = {
        'รอตรวจสอบ': 'amber', 'รับเรื่อง': '', 'กำลังซ่อม': 'orange', 'ซ่อมเสร็จ': 'green'
      }[st] || '';
      return `
        <div class="bar-row">
          <div class="bar-label">${st}</div>
          <div class="bar-track"><div class="bar-fill ${fillCls}" style="width:${pct}%"></div></div>
          <div class="bar-value">${v}</div>
        </div>`;
    }).join('');

    const typeRows = Object.entries(s.byType).map(([t, v]) => {
      const pct = s.total ? Math.round((v / s.total) * 100) : 0;
      return `
        <div class="bar-row">
          <div class="bar-label">${t}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <div class="bar-value">${v}</div>
        </div>`;
    }).join('');

    const buildingRows = Object.entries(s.byBuilding).map(([b, v]) => {
      const pct = s.total ? Math.round((v / s.total) * 100) : 0;
      return `
        <div class="bar-row">
          <div class="bar-label">${b}</div>
          <div class="bar-track"><div class="bar-fill navy" style="width:${pct}%"></div></div>
          <div class="bar-value">${v}</div>
        </div>`;
    }).join('');

    const recentDone = requests.filter((r) => r.status === 'ซ่อมเสร็จ').slice(0, 8);

    const costTable = recentDone.map((r) => `
      <tr>
        <td style="font-weight:700;color:var(--navy-900)">${r.id}</td>
        <td>${UI.esc(r.problemType)}</td>
        <td>${UI.esc(r.building)} · ห้อง ${UI.esc(r.room)}</td>
        <td class="text-right">${SM.formatMoney(SM.expenseTotal(r.expense))}</td>
      </tr>`).join('');

    const totalLabel = 'ค่าใช้จ่ายรวม (งานที่เสร็จ)';

    root.innerHTML = `
      ${UI.pageHeader('ภาพรวมระบบแจ้งซ่อม', 'สถิติจากระบบล่าสุด (' + UI.esc(user.name) + ')')}

      <div class="stat-grid cols-6 mb-4">
        ${UI.statCard('📊', 'งานทั้งหมด', s.total, 'รายการ', 'var(--gray-100)')}
        ${UI.statCard('⏳', 'รอตรวจสอบ', s.pending, 'ยังไม่รับเรื่อง', '#FEF3C7')}
        ${UI.statCard('🔵', 'รับเรื่อง', s.accepted, 'มอบหมายช่างแล้ว', '#DBEAFE')}
        ${UI.statCard('🛠️', 'กำลังซ่อม', s.working, 'ช่างกำลังดำเนินการ', '#FFEDD5')}
        ${UI.statCard('✅', 'ซ่อมเสร็จ', s.done, 'ปิดงานแล้ว', '#DCFCE7')}
        ${UI.statCard('💰', 'ค่าใช้จ่าย', SM.formatMoney(s.totalCost), totalLabel, '#E0E7FF')}
      </div>

      <div class="detail-layout">
        <div class="seg">
          <div class="card card-pad mb-4">
            <div class="seg-title">📌 สรุปตามสถานะ</div>
            ${statusRows}
          </div>

          <div class="card card-pad mb-4">
            <div class="seg-title">🔧 จำนวนงานตามประเภทปัญหา</div>
            ${typeRows || UI.emptyState('—', 'ไม่มีข้อมูล')}
          </div>
        </div>

        <div class="seg">
          <div class="card card-pad mb-4">
            <div class="seg-title">🏢 จำนวนงานตามอาคาร</div>
            ${buildingRows || UI.emptyState('—', 'ไม่มีข้อมูล')}
          </div>

          <div class="card card-pad">
            <div class="seg-title">💳 ค่าใช้จ่ายงานที่เสร็จล่าสุด</div>
            <div class="table-wrap" style="display:block">
              <table class="data-table">
                <thead><tr><th>เลขที่</th><th>ประเภท</th><th>สถานที่</th><th class="text-right">รวม</th></tr></thead>
                <tbody>${costTable || '<tr><td colspan="4" class="muted">ไม่มีข้อมูล</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
  }

  return { render };
})();