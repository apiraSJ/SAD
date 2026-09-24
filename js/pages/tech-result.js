/**
 * Page: Repair Result + Expense (Technician)
 * รับงาน/เริ่มซ่อม → บันทึกผล+อะไหล่+ค่าแรง+ค่าใช้จ่าย → ปิดงาน
 * จำลอง workflow เต็มรูปแบบของช่าง
 */
Pages['tech-result'] = (function () {
  let partsRows = [];

  function render(root, params, user) {
    const r = SM.get(params.id);
    if (!r) {
      root.innerHTML = `
        <a class="btn btn-outline btn-sm mb-3" href="#/tech/jobs">← ย้อนกลับ</a>
        ${UI.emptyState('❓', 'ไม่พบงานนี้')}`;
      return;
    }

    if (r.assignedTechnician !== user.name) {
      root.innerHTML = `
        <a class="btn btn-outline btn-sm mb-3" href="#/tech/jobs">← ย้อนกลับ</a>
        ${UI.emptyState('⛔', 'งานนี้ไม่ได้มอบหมายให้คุณ')}`;
      return;
    }

    partsRows = (r.expense && r.expense.parts && r.expense.parts.length)
      ? r.expense.parts.map((p) => ({ name: p.name, qty: p.qty, unitPrice: p.unitPrice }))
      : [];

    const view = buildView(root, r, user);
    root.innerHTML = view.html;
    if (view.bind) view.bind(root, r, user);
  }

  function buildView(root, r, user) {
    if (r.status === 'รับเรื่อง') {
      return {
        html: `
          <div class="flex-between mb-4">
            <a class="btn btn-outline btn-sm" href="#/tech/jobs">← กลับงานของฉัน</a>
            ${UI.statusBadge(r.status)}
          </div>
          <div class="detail-layout">
            <div class="seg">
              <div class="card card-pad">
                <div class="flex-between">
                  <h2>${UI.esc(r.id)}</h2>
                </div>
                <p class="muted mt-1" style="font-size:13px">แจ้งเมื่อ ${UI.esc(r.submittedAt)}</p>
                <hr class="divider">
                <div class="detail-grid d2">
                  ${UI.detailItem('ผู้แจ้ง', UI.esc(r.reporter))}
                  ${UI.detailItem('ประเภท', UI.esc(r.problemType))}
                  ${UI.detailItem('อาคาร', UI.esc(r.building))}
                  ${UI.detailItem('ชั้น / ห้อง', `ชั้น ${UI.esc(r.floor)} / ห้อง ${UI.esc(r.room)}`)}
                  ${UI.detailItem('ความเร่งด่วน', UI.urgencyChip(r.urgency))}
                </div>
                <hr class="divider">
                <div class="detail-item">
                  <div class="dt-label">รายละเอียดปัญหา</div>
                  <div class="dt-value mt-1">${UI.esc(r.description)}</div>
                </div>
              </div>
            </div>
            <div class="seg">
              <div class="action-panel highlight">
                <div class="seg-title">🛠️ รับงานนี้</div>
                <p class="muted" style="font-size:13px;margin-bottom:16px">เมื่อกด "เริ่มดำเนินการ" สถานะจะเปลี่ยนเป็น "กำลังซ่อม" และนักเรียนจะเห็นสถานะอัปเดตทันที</p>
                <button class="btn btn-primary btn-block btn-lg" id="btn-start">เริ่มดำเนินการ</button>
              </div>
            </div>
          </div>`,
        bind: (rootEl) => {
          rootEl.querySelector('#btn-start').addEventListener('click', () => {
            const res = SM.startRepair(r.id, user.name);
            if (res.ok) { UI.success('เริ่มดำเนินการ — สถานะ "กำลังซ่อม"'); App.refresh(); }
            else UI.error(res.reason);
          });
        }
      };
    }

    if (r.status === 'กำลังซ่อม') {
      const rowsHtml = partsRows.map(partRowHtml).join('') || partRowHtml({ name: '', qty: '', unitPrice: '' });
      const labor = r.expense.laborCost || 0;
      const other = r.expense.otherCost || 0;
      const result = r.repairResult || '';

      return {
        html: `
          <div class="flex-between mb-4">
            <a class="btn btn-outline btn-sm" href="#/tech/jobs">← กลับงานของฉัน</a>
            ${UI.statusBadge(r.status)}
          </div>

          <div class="detail-layout">
            <div class="seg">
              <div class="card card-pad mb-4">
                <div class="flex-between">
                  <h2>${UI.esc(r.id)}</h2>
                </div>
                <p class="muted mt-1" style="font-size:13px">แจ้งเมื่อ ${UI.esc(r.submittedAt)}</p>
                <hr class="divider">
                <div class="detail-grid d2">
                  ${UI.detailItem('ผู้แจ้ง', UI.esc(r.reporter))}
                  ${UI.detailItem('ประเภท', UI.esc(r.problemType))}
                  ${UI.detailItem('อาคาร', UI.esc(r.building))}
                  ${UI.detailItem('ชั้น / ห้อง', `ชั้น ${UI.esc(r.floor)} / ห้อง ${UI.esc(r.room)}`)}
                </div>
                <hr class="divider">
                <div class="detail-item">
                  <div class="dt-label">รายละเอียดปัญหา</div>
                  <div class="dt-value mt-1">${UI.esc(r.description)}</div>
                </div>
              </div>

              <div class="card card-pad">
                <div class="seg-title">🔧 ผลการซ่อม</div>
                <div class="field" id="f-result">
                  <label for="repair-result">รายละเอียดการซ่อม / ผลการซ่อม *</label>
                  <textarea class="textarea" id="repair-result" placeholder="เช่น เปลี่ยนหลอดไฟ LED ใหม่แล้ว ไฟติดปกติครับ">${UI.esc(result)}</textarea>
                  <div class="field-error">กรุณากรอกผลการซ่อมก่อนปิดงาน</div>
                </div>
              </div>

              <div class="card card-pad mt-4">
                <div class="flex-between" style="margin-bottom:16px">
                  <div class="seg-title" style="margin:0">💰 ค่าใช้จ่าย / อะไหล่</div>
                  <button type="button" class="btn btn-outline btn-sm" id="btn-add-part">+ เพิ่มรายการ</button>
                </div>

                <div class="field">
                  <label>รายการอะไหล่ / วัสดุ</label>
                  <div id="parts-rows">${rowsHtml}</div>
                </div>

                <div class="detail-grid d2">
                  <div class="field">
                    <label for="labor-cost">ค่าแรง (บาท)</label>
                    <input class="input" id="labor-cost" type="number" min="0" step="0.01" value="${labor}">
                  </div>
                  <div class="field">
                    <label for="other-cost">ค่าใช้จ่ายอื่น (บาท)</label>
                    <input class="input" id="other-cost" type="number" min="0" step="0.01" value="${other}">
                  </div>
                </div>

                <div class="expense-summary">
                  <div class="expense-row"><span>รวมอะไหล่</span><span id="sum-parts">${SM.formatMoney(partsCost())}</span></div>
                  <div class="expense-row"><span>ค่าแรง</span><span id="sum-labor">${SM.formatMoney(labor)}</span></div>
                  <div class="expense-row"><span>ค่าใช้จ่ายอื่น</span><span id="sum-other">${SM.formatMoney(other)}</span></div>
                  <div class="expense-row total"><span>ค่าใช้จ่ายรวม</span><span id="sum-total">${SM.formatMoney(partsCost() + labor + other)}</span></div>
                </div>
              </div>
            </div>

            <div class="seg">
              <div class="action-panel highlight">
                <div class="seg-title">ดำเนินการปิดงาน</div>
                <button class="btn btn-primary btn-block mb-2" id="btn-close">ปิดงาน (สถานะ = ซ่อมเสร็จ)</button>
                <p class="field-hint mt-2" style="font-size:12px">กดปิดงาน = บันทึกผลการซ่อมและค่าใช้จ่าย พร้อมเปลี่ยนสถานะเป็น "ซ่อมเสร็จ"</p>
              </div>

              <div class="card card-pad mt-4">
                <div class="seg-title">📌 สถานะดำเนินการ</div>
                ${UI.timeline(r.history, r.status)}
              </div>
            </div>
          </div>`,
        bind: (rootEl, req) => {
          bindExpense(rootEl, req);
          rootEl.querySelector('#btn-close').addEventListener('click', () => {
            const save = doSave(rootEl, req, user, false);
            if (!save) return;
            UI.confirm({
              title: 'ปิดงานนี้?',
              body: `ยืนยันปิดงาน <b>${req.id}</b>? สถานะจะเปลี่ยนเป็น "<b>ซ่อมเสร็จ</b>" และบันทึกค่าใช้จ่ายรวม <b>${SM.formatMoney(SM.expenseTotal(req.expense))}</b>`,
              confirmText: 'ยืนยันปิดงาน',
              danger: true,
              onConfirm: () => {
                const res = SM.closeRepair(req.id, user.name);
                if (res.ok) { UI.success(req.id + ' ถูกปิดงานแล้ว'); App.navigate('tech/jobs'); }
                else UI.error(res.reason);
              }
            });
          });
        }
      };
    }

    /* ซ่อมเสร็จ — read only */
    const partRows = (r.expense.parts || []).map((p) =>
      `<div class="expense-row"><span>${UI.esc(p.name)} × ${p.qty}</span><span>${SM.formatMoney(p.qty * p.unitPrice)}</span></div>`
    ).join('');

    return {
      html: `
        <div class="flex-between mb-4">
          <a class="btn btn-outline btn-sm" href="#/tech/jobs">← กลับงานของฉัน</a>
          ${UI.statusBadge(r.status)}
        </div>
        <div class="detail-layout">
          <div class="seg">
            <div class="card card-pad">
              <h2>${UI.esc(r.id)}</h2>
              <p class="muted mt-1" style="font-size:13px">เสร็จเมื่อ ${UI.esc(r.completedAt || '')}</p>
              <hr class="divider">
              <div class="detail-grid d2">
                ${UI.detailItem('ผู้แจ้ง', UI.esc(r.reporter))}
                ${UI.detailItem('ประเภท', UI.esc(r.problemType))}
                ${UI.detailItem('อาคาร', UI.esc(r.building))}
                ${UI.detailItem('ชั้น / ห้อง', `ชั้น ${UI.esc(r.floor)} / ห้อง ${UI.esc(r.room)}`)}
              </div>
              <hr class="divider">
              <div class="detail-item">
                <div class="dt-label">ผลการซ่อม</div>
                <div class="dt-value mt-1">${UI.esc(r.repairResult || '')}</div>
              </div>
              <hr class="divider">
              <div class="seg-title">💰 ค่าใช้จ่าย</div>
              <div class="expense-summary">
                ${partRows || '<div class="expense-row"><span>ไม่มีรายการอะไหล่</span><span>—</span></div>'}
                ${r.expense.laborCost ? `<div class="expense-row"><span>ค่าแรง</span><span>${SM.formatMoney(r.expense.laborCost)}</span></div>` : ''}
                ${r.expense.otherCost ? `<div class="expense-row"><span>ค่าใช้จ่ายอื่น</span><span>${SM.formatMoney(r.expense.otherCost)}</span></div>` : ''}
                <div class="expense-row total"><span>รวม</span><span>${SM.formatMoney(SM.expenseTotal(r.expense))}</span></div>
              </div>
            </div>
          </div>
          <div class="seg">
            <div class="card card-pad">
              <div class="seg-title">📌 สถานะดำเนินการ</div>
              ${UI.timeline(r.history, r.status)}
            </div>
          </div>
        </div>`,
      bind: null
    };
  }

  function partRowHtml(p) {
    return `
      <div class="part-row flex" style="gap:8px;margin-bottom:8px;align-items:center">
        <input class="input part-name" placeholder="ชื่ออะไหล่" value="${UI.esc(p.name || '')}" style="flex:2">
        <input class="input part-qty" type="number" min="0" placeholder="จำนวน" value="${p.qty ?? ''}" style="flex:.5;min-width:60px">
        <input class="input part-price" type="number" min="0" step="0.01" placeholder="ราคา/หน่วย" value="${p.unitPrice ?? ''}" style="flex:1;min-width:90px">
        <button type="button" class="btn btn-ghost btn-sm part-del" title="ลบ">✕</button>
      </div>`;
  }

  function partsCost() {
    return partsRows.reduce((s, p) => s + ((Number(p.qty) || 0) * (Number(p.unitPrice) || 0)), 0);
  }

  function bindExpense(root, r) {
    const rowsEl = root.querySelector('#parts-rows');
    const sumParts = () => root.querySelector('#sum-parts').textContent = SM.formatMoney(partsCost());
    const sumTotal = () => {
      const labor = Number(root.querySelector('#labor-cost').value) || 0;
      const other = Number(root.querySelector('#other-cost').value) || 0;
      root.querySelector('#sum-labor').textContent = SM.formatMoney(labor);
      root.querySelector('#sum-other').textContent = SM.formatMoney(other);
      root.querySelector('#sum-total').textContent = SM.formatMoney(partsCost() + labor + other);
    };

    const syncRows = () => {
      partsRows = Array.from(rowsEl.querySelectorAll('.part-row')).map((row) => ({
        name: row.querySelector('.part-name').value,
        qty: row.querySelector('.part-qty').value,
        unitPrice: row.querySelector('.part-price').value
      }));
    };

    rowsEl.addEventListener('input', (e) => { if (e.target.classList.contains('part-name') || e.target.classList.contains('part-qty') || e.target.classList.contains('part-price')) { syncRows(); sumParts(); sumTotal(); } });
    rowsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('part-del')) {
        e.target.closest('.part-row').remove();
        syncRows(); sumParts(); sumTotal();
      }
    });

    root.querySelector('#btn-add-part').addEventListener('click', () => {
      rowsEl.insertAdjacentHTML('beforeend', partRowHtml({ name: '', qty: '', unitPrice: '' }));
    });

    root.querySelector('#labor-cost').addEventListener('input', sumTotal);
    root.querySelector('#other-cost').addEventListener('input', sumTotal);
  }

  function doSave(root, r, user, silent) {
    const fResult = root.querySelector('#f-result');
    const result = root.querySelector('#repair-result').value.trim();
    if (!result) {
      fResult.classList.add('invalid');
      return false;
    }
    fResult.classList.remove('invalid');

    const rows = Array.from(root.querySelectorAll('.part-row')).map((row) => ({
      name: row.querySelector('.part-name').value,
      qty: row.querySelector('.part-qty').value,
      unitPrice: row.querySelector('.part-price').value
    })).filter((p) => p.name && String(p.name).trim());

    const laborCost = root.querySelector('#labor-cost').value;
    const otherCost = root.querySelector('#other-cost').value;

    const res = SM.saveResult(r.id, {
      repairResult: result,
      parts: rows,
      laborCost,
      otherCost
    });
    if (res.ok) {
      if (!silent) UI.success('บันทึกการซ่อมแล้ว');
      App.refresh();
      return true;
    }
    UI.error(res.reason);
    return false;
  }

  return { render };
})();