/**
 * Page: Repair Tracking (Cadet)
 * - /cadet/tracking      → รายการของฉัน
 * - /cadet/tracking/:id  → Timeline + รายละเอียด + ผลซ่อม + ค่าใช้จ่าย
 */
Pages['cadet-tracking'] = (function () {

  function render(root, params, user) {
    if (params.id) {
      renderDetail(root, params.id, user);
    } else {
      renderList(root, user);
    }
  }

  function renderList(root, user) {
    const my = SM.requests().filter((r) => r.reporter === user.name || !r.reporterUser || r.reporterUser === user.username);

    const rows = my.map((r) => `
      <tr data-id="${r.id}">
        <td style="font-weight:700;color:var(--navy-900)">${UI.esc(r.id)}</td>
        <td>${UI.esc(r.building)} · ชั้น ${UI.esc(r.floor)} · ห้อง ${UI.esc(r.room)}</td>
        <td>${UI.esc(r.problemType)}</td>
        <td>${UI.urgencyChip(r.urgency)}</td>
        <td>${UI.statusBadge(r.status)}</td>
        <td style="font-size:12px;color:var(--gray-500)">${UI.esc(r.submittedAt)}</td>
      </tr>`).join('');

    const cards = my.length
      ? my.map((r) => UI.requestCard(r, `<span class="btn btn-outline btn-sm">ดูรายละเอียด →</span>`)).join('')
      : UI.emptyState('📭', 'ยังไม่มีรายการแจ้งซ่อม');

    root.innerHTML = `
      ${UI.pageHeader('ติดตามสถานะ', 'รายการแจ้งซ่อมของฉันทั้งหมด')}
      ${my.length === 0 ? cards : `
        <div class="rc-list">${cards}</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>เลขที่</th><th>สถานที่</th><th>ประเภท</th>
                <th>ความเร่งด่วน</th><th>สถานะ</th><th>วันที่</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`}`;

    root.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', () => App.navigate('cadet/tracking/' + el.dataset.id));
    });
  }

  function renderDetail(root, id, user) {
    const r = SM.get(id);
    if (!r) {
      root.innerHTML = UI.emptyState('❓', 'ไม่พบรายการแจ้งซ่อมนี้');
      return;
    }

    const tech = r.assignedTechnician
      ? UI.detailItem('ช่างผู้รับผิดชอบ', `<span class="chip chip-blue">👷 ${UI.esc(r.assignedTechnician)}</span>`)
      : `<div class="detail-item"><div class="dt-label">ช่างผู้รับผิดชอบ</div><div class="dt-value muted">— (ยังไม่ได้มอบหมาย)</div></div>`;

    const photo = r.photo
      ? `<div class="photo-preview" style="max-width:260px"><img src="${r.photo}" alt="รูปปัญหา"></div>`
      : '';

    const expenseRows = r.status !== 'ซ่อมเสร็จ' || !r.expense
      ? ''
      : `
        <div class="seg">
          <div class="seg-title">💰 ค่าใช้จ่าย</div>
          <div class="table-wrap" style="display:block">
            <table class="data-table">
              <thead><tr><th>รายการ</th><th class="text-right">จำนวน</th><th class="text-right">ราคา/หน่วย</th><th class="text-right">รวม</th></tr></thead>
              <tbody>
                ${(r.expense.parts || []).map((p) =>
                  `<tr><td>${UI.esc(p.name)}</td><td class="text-right">${p.qty}</td><td class="text-right">${SM.formatMoney(p.unitPrice)}</td><td class="text-right">${SM.formatMoney(p.qty * p.unitPrice)}</td></tr>`
                ).join('')}
                ${(r.expense.laborCost || 0) ? `<tr><td>ค่าแรง</td><td class="text-right" colspan="2">—</td><td class="text-right">${SM.formatMoney(r.expense.laborCost)}</td></tr>` : ''}
                ${(r.expense.otherCost || 0) ? `<tr><td>ค่าใช้จ่ายอื่น</td><td class="text-right" colspan="2">—</td><td class="text-right">${SM.formatMoney(r.expense.otherCost)}</td></tr>` : ''}
              </tbody>
            </table>
          </div>
          <div class="expense-summary mt-2">
            <div class="expense-row total"><span>ค่าใช้จ่ายรวม</span><span>${SM.formatMoney(SM.expenseTotal(r.expense))}</span></div>
          </div>
        </div>`;

    const result = r.repairResult
      ? `<div class="detail-item"><div class="dt-label">ผลการซ่อม</div><div class="dt-value">${UI.esc(r.repairResult)}</div></div>`
      : '';

    const completed = r.status === 'ซ่อมเสร็จ'
      ? `<div class="chip" style="background:#DCFCE7;color:#15803D">✅ เสร็จสิ้น ${UI.esc(r.completedAt || '')}</div>`
      : '';

    root.innerHTML = `
      <div class="flex-between mb-4">
        <a class="btn btn-outline btn-sm" href="#/cadet/tracking">← ย้อนกลับ</a>
        ${completed}
      </div>

      <div class="detail-layout">
        <div class="seg">
          <div class="card card-pad">
            <div class="flex-between">
              <div>
                <h2>${UI.esc(r.id)}</h2>
                <p class="muted mt-1" style="font-size:13px">แจ้งเมื่อ ${UI.esc(r.submittedAt)}</p>
              </div>
              ${UI.statusBadge(r.status)}
            </div>

            <hr class="divider">

            <div class="detail-grid d2">
              ${UI.detailItem('ประเภทปัญหา', UI.esc(r.problemType))}
              ${UI.detailItem('ความเร่งด่วน', UI.urgencyChip(r.urgency))}
              ${UI.detailItem('อาคาร', UI.esc(r.building))}
              ${UI.detailItem('ชั้น / ห้อง', `ชั้น ${UI.esc(r.floor)} / ห้อง ${UI.esc(r.room)}`)}
              ${tech}
              ${UI.detailItem('วันที่ซ่อมเสร็จ', r.completedAt ? UI.esc(r.completedAt) : null)}
            </div>

            <hr class="divider">

            <div class="detail-item">
              <div class="dt-label">รายละเอียดปัญหา</div>
              <div class="dt-value mt-1">${UI.esc(r.description)}</div>
            </div>
            ${photo ? `<div class="mt-3">${photo}</div>` : ''}

            ${result ? `<hr class="divider">${result}` : ''}
          </div>

          ${expenseRows}
        </div>

        <div class="seg">
          <div class="card card-pad">
            <div class="seg-title">📌 สถานะดำเนินการ</div>
            ${UI.timeline(r.history, r.status)}
          </div>
        </div>
      </div>`;
  }

  return { render };
})();