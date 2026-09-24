/**
 * Page: Request Detail / Assign Technician (Admin)
 * แสดงรายละเอียด + รับเรื่อง + มอบหมายช่าง ตามสถานะปัจจุบัน
 */
Pages['admin-detail'] = (function () {

  function render(root, params, user) {
    const r = SM.get(params.id);
    if (!r) {
      root.innerHTML = `
        <a class="btn btn-outline btn-sm mb-3" href="#/admin/list">← ย้อนกลับ</a>
        ${UI.emptyState('❓', 'ไม่พบรายการแจ้งซ่อมนี้')}`;
      return;
    }

    const tech = r.assignedTechnician
      ? `<span class="chip chip-blue">👷 ${UI.esc(r.assignedTechnician)}</span>`
      : '<span class="muted">— (ยังไม่ได้มอบหมาย)</span>';

    const photo = r.photo
      ? `<div class="photo-preview" style="max-width:260px"><img src="${r.photo}" alt="รูปปัญหา"></div>`
      : '';

    const actionPanel = renderActions(r, user);

    root.innerHTML = `
      <div class="flex-between mb-4">
        <a class="btn btn-outline btn-sm" href="#/admin/list">← กลับรายการ</a>
        ${UI.statusBadge(r.status)}
      </div>

      <div class="detail-layout">
        <div class="seg">
          <div class="card card-pad">
            <div class="flex-between">
              <div>
                <h2>${UI.esc(r.id)}</h2>
                <p class="muted mt-1" style="font-size:13px">แจ้งเมื่อ ${UI.esc(r.submittedAt)}</p>
              </div>
            </div>

            <hr class="divider">

            <div class="detail-grid d2">
              ${UI.detailItem('ผู้แจ้ง', UI.esc(r.reporter))}
              ${UI.detailItem('ประเภทปัญหา', UI.esc(r.problemType))}
              ${UI.detailItem('ความเร่งด่วน', UI.urgencyChip(r.urgency))}
              ${UI.detailItem('ช่างผู้รับผิดชอบ', tech)}
              ${UI.detailItem('อาคาร', UI.esc(r.building))}
              ${UI.detailItem('ชั้น / ห้อง', `ชั้น ${UI.esc(r.floor)} / ห้อง ${UI.esc(r.room)}`)}
              ${UI.detailItem('วันที่รับเรื่อง', r.assignedAt ? UI.esc(r.assignedAt) : null)}
            </div>

            <hr class="divider">

            <div class="detail-item">
              <div class="dt-label">รายละเอียดปัญหา</div>
              <div class="dt-value mt-1">${UI.esc(r.description)}</div>
            </div>
            ${photo ? `<div class="mt-3">${photo}</div>` : ''}
          </div>

          <div class="card card-pad mt-4">
            <div class="seg-title">📌 สถานะดำเนินการ</div>
            ${UI.timeline(r.history, r.status)}
          </div>
        </div>

        <div class="seg">
          ${actionPanel}
        </div>
      </div>`;
  }

  function renderActions(r, user) {
    const opts = MOCK_DATA.technicians.map((t) => `<option value="${t.name}">${UI.esc(t.name)} (${UI.esc(t.specialty)})</option>`).join('');

    if (r.status === 'รอตรวจสอบ') {
      return UI.actionPanel('ดำเนินการรับเรื่อง', `
        <p class="muted" style="font-size:13px;margin-bottom:16px">ตรวจสอบรายละเอียดคำขอแล้วกดรับเรื่อง เพื่อดำเนินการต่อ</p>
        <button class="btn btn-primary btn-block" id="btn-accept">รับเรื่อง</button>
      `, true);
    }

    if (r.status === 'รับเรื่อง') {
      const assigned = r.assignedTechnician;
      return UI.actionPanel('มอบหมายช่าง', `
        ${assigned ? `
          <div class="detail-item mb-3">
            <div class="dt-label">ช่างที่มอบหมายแล้ว</div>
            <div class="dt-value">${UI.esc(assigned)}</div>
          </div>` : `
          <div class="field">
            <label for="tech-select">เลือกช่าง *</label>
            <select class="select" id="tech-select"><option value="">— เลือกช่าง —</option>${opts}</select>
            <div class="field-error">กรุณาเลือกช่างก่อนยืนยัน</div>
          </div>
          <button class="btn btn-primary btn-block" id="btn-assign">ยืนยันการมอบหมาย</button>`}
        <p class="field-hint mt-2" style="font-size:12px">เมื่อมอบหมายแล้ว ช่างจะเห็นงานในระบบทันที</p>
      `, !assigned);
    }

    if (r.status === 'กำลังซ่อม') {
      return UI.actionPanel('สถานะงาน', `
        <div class="detail-item mb-2">
          <div class="dt-label">ช่างผู้รับผิดชอบ</div>
          <div class="dt-value">${UI.esc(r.assignedTechnician || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="dt-label">เริ่มซ่อมเมื่อ</div>
          <div class="dt-value">${UI.esc(r.startAt || '—')}</div>
        </div>
        <p style="font-size:12px;color:var(--gray-500);margin-top:12px">ช่างกำลังดำเนินการซ่อมอยู่ ระบบจะอัปเดตสถานะเมื่อช่างบันทึกผลและปิดงาน</p>
      `);
    }

    if (r.status === 'ซ่อมเสร็จ') {
      const rows = (r.expense.parts || []).map((p) =>
        `<div class="expense-row"><span>${UI.esc(p.name)} × ${p.qty}</span><span>${SM.formatMoney(p.qty * p.unitPrice)}</span></div>`
      ).join('');
      return UI.actionPanel('สรุปงานที่เสร็จแล้ว', `
        <div class="detail-item mb-2">
          <div class="dt-label">ผลการซ่อม</div>
          <div class="dt-value">${UI.esc(r.repairResult || '—')}</div>
        </div>
        <div class="detail-item mb-2">
          <div class="dt-label">เสร็จเมื่อ</div>
          <div class="dt-value">${UI.esc(r.completedAt || '—')}</div>
        </div>
        ${(r.expense.parts && r.expense.parts.length) || r.expense.laborCost ? `
          <div class="expense-summary mt-3">
            ${rows}
            ${r.expense.laborCost ? `<div class="expense-row"><span>ค่าแรง</span><span>${SM.formatMoney(r.expense.laborCost)}</span></div>` : ''}
            ${r.expense.otherCost ? `<div class="expense-row"><span>ค่าใช้จ่ายอื่น</span><span>${SM.formatMoney(r.expense.otherCost)}</span></div>` : ''}
            <div class="expense-row total"><span>รวม</span><span>${SM.formatMoney(SM.expenseTotal(r.expense))}</span></div>
          </div>` : '<p class="muted mt-2" style="font-size:12px">ไม่มีค่าใช้จ่าย</p>'}
      `);
    }

    return '';
  }

  function bind(root, params, user) {
    const r = SM.get(params.id);
    if (!r) return;

    const btnAccept = root.querySelector('#btn-accept');
    if (btnAccept) {
      btnAccept.addEventListener('click', () => {
        const res = SM.acceptRequest(r.id, user.name);
        if (res.ok) {
          UI.success('รับเรื่องแล้ว');
          App.refresh();
        } else {
          UI.error(res.reason);
        }
      });
    }

    const btnAssign = root.querySelector('#btn-assign');
    if (btnAssign) {
      btnAssign.addEventListener('click', () => {
        const sel = root.querySelector('#tech-select');
        const field = sel.closest('.field');
        const val = sel.value;
        if (!val) {
          field.classList.add('invalid');
          return;
        }
        field.classList.remove('invalid');
        const res = SM.assignTechnician(r.id, val, user.name);
        if (res.ok) {
          UI.success('มอบหมายงานให้ ' + val + ' แล้ว');
          App.refresh();
        } else {
          UI.error(res.reason);
        }
      });
    }
  }

  return { render, bind };
})();