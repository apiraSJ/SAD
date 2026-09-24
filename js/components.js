/**
 * UI Components — primitives ที่ทุกหน้าใช้ร่วมกัน
 */

const UI = {
  esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  statusBadge(status) {
    const cls = {
      'รอตรวจสอบ': 'badge-pending',
      'รับเรื่อง': 'badge-accept',
      'กำลังซ่อม': 'badge-working',
      'ซ่อมเสร็จ': 'badge-done'
    }[status] || 'badge-pending';
    return `<span class="badge ${cls}">${UI.esc(status)}</span>`;
  },

  urgencyChip(urgency) {
    const cls = urgency === 'ด่วน' ? 'chip-blue' : '';
    const icon = urgency === 'ด่วน' ? '⚡ ' : '';
    return `<span class="chip ${cls}">${icon}${UI.esc(urgency)}</span>`;
  },

  statCard(icon, label, value, hint, accent) {
    return `
      <div class="stat-card">
        <div class="stat-row">
          <div>
            <div class="stat-label">${UI.esc(label)}</div>
            <div class="stat-value">${UI.esc(value)}</div>
            ${hint ? `<div class="stat-hint">${UI.esc(hint)}</div>` : ''}
          </div>
          <div class="stat-accent" style="background:${accent || 'var(--blue-50)'}">${icon}</div>
        </div>
      </div>`;
  },

  timeline(history, maxStatus) {
    const statusOrder = ['รอตรวจสอบ', 'รับเรื่อง', 'กำลังซ่อม', 'ซ่อมเสร็จ'];
    const currentIdx = maxStatus == null ? statusOrder.length - 1 : statusOrder.indexOf(maxStatus);
    const current = history && history.length ? history[history.length - 1].status : maxStatus;

    return `<ul class="timeline">${statusOrder.map((st, i) => {
      const entry = (history || []).filter((h) => h.status === st).pop();
      let cls = 'pending';
      if (entry) cls = (st === current) ? 'current' : 'done';
      else if (i <= currentIdx) cls = 'done';
      const meta = entry ? `${entry.timestamp} · ${UI.esc(entry.actor)}` : '';
      const note = entry ? `<div class="tl-note">${UI.esc(entry.note || '')}</div>` : '';
      return `
        <li class="${cls}">
          <div class="tl-title">${UI.esc(st)}</div>
          ${meta ? `<div class="tl-meta">${meta}</div>` : ''}
          ${note}
        </li>`;
    }).join('')}</ul>`;
  },

  requestCard(r, extra) {
    return `
      <div class="rc-card" data-id="${r.id}">
        <div class="rc-card-top">
          <div>
            <div class="rc-id">${UI.esc(r.id)}</div>
            <div class="rc-loc">${UI.esc(r.building)} · ชั้น ${UI.esc(r.floor)} · ห้อง ${UI.esc(r.room)}</div>
          </div>
          ${UI.statusBadge(r.status)}
        </div>
        <div class="flex flex-between">
          <span class="rc-type">${UI.esc(r.problemType)}</span>
          <span class="rc-type">${UI.urgencyChip(r.urgency)}</span>
        </div>
        <div class="rc-bottom">
          <span class="rc-date">${UI.esc(r.submittedAt)}</span>
          ${extra || ''}
        </div>
      </div>`;
  },

  detailItem(label, value) {
    return `
      <div class="detail-item">
        <div class="dt-label">${UI.esc(label)}</div>
        <div class="dt-value">${value === null || value === undefined || value === '' ? '<span class="muted">—</span>' : value}</div>
      </div>`;
  },

  actionPanel(title, bodyHtml, highlight) {
    return `
      <div class="action-panel ${highlight ? 'highlight' : ''}">
        <div class="seg-title">${title}</div>
        ${bodyHtml}
      </div>`;
  },

  emptyState(icon, text) {
    return `<div class="empty-state"><div class="es-icon">${icon}</div><div>${UI.esc(text)}</div></div>`;
  },

  /* ---------- Toast ---------- */
  toast(message, type) {
    let root = document.querySelector('.toast-root');
    if (!root) {
      root = document.createElement('div');
      root.className = 'toast-root';
      document.body.appendChild(root);
    }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = message;
    root.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity .3s ease';
      setTimeout(() => t.remove(), 300);
    }, 2600);
  },

  success(msg) { this.toast(msg, 'success'); },
  error(msg) { this.toast(msg, 'error'); },

  /* ---------- Modal (confirm) ---------- */
  confirm({ title, body, confirmText, cancelText, danger, onConfirm }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-title">${UI.esc(title)}</div>
          <div class="modal-body">${body}</div>
          <div class="modal-actions">
            <button class="btn btn-outline" data-act="cancel">${UI.esc(cancelText || 'ยกเลิก')}</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${UI.esc(confirmText || 'ยืนยัน')}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('open'));

      const close = (result) => {
        overlay.classList.remove('open');
        setTimeout(() => overlay.remove(), 160);
        resolve(result);
      };

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
        if (e.target.closest('[data-act="cancel"]')) close(false);
        if (e.target.closest('[data-act="ok"]')) close(true);
        if (e.target.closest('[data-act="ok"]')) {
          if (onConfirm) onConfirm();
        }
      });

      overlay.querySelector('[data-act="cancel"]').focus();
    });
  },

  /* ---------- Breadcrumb / header ---------- */
  pageHeader(title, subtitle, actionsHtml) {
    return `
      <div class="page-header">
        <div>
          <h1>${UI.esc(title)}</h1>
          ${subtitle ? `<p class="muted mt-1">${UI.esc(subtitle)}</p>` : ''}
        </div>
        ${actionsHtml ? `<div class="toolbar">${actionsHtml}</div>` : ''}
      </div>`;
  }
};