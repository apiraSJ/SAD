/**
 * Page: Repair Form (Cadet)
 * อาคาร/ชั้น/ห้อง/ประเภท/รายละเอียด/รูปภาพ/ความเร่งด่วน → สร้างคำขอ
 */
Pages['cadet-form'] = (function () {
  let photoData = null;

  function render(root, params, user) {
    photoData = null;

    const s = SM.settings();
    const buildings = s.buildings.map((b) => `<option value="${b}">${b}</option>`).join('');
    const floors = s.floors.map((f) => `<option value="${f}">ชั้น ${f}</option>`).join('');
    const types = s.problemTypes.map((t) => `<option value="${t}">${t}</option>`).join('');
    const buildOpts = `<option value="">— เลือกอาคาร —</option>${buildings}`;
    const floorOpts = `<option value="">— เลือกชั้น —</option>${floors}`;
    const typeOpts = `<option value="">— เลือกประเภท —</option>${types}`;

    root.innerHTML = `
      ${UI.pageHeader('แจ้งซ่อม', 'กรอกข้อมูลปัญหาความชำรุดภายในห้องพัก')}

      <form id="repair-form" class="card card-pad stack">
        <div class="detail-grid d2">
          <div class="field" id="f-building">
            <label for="building">อาคาร *</label>
            <select class="select" id="building" required>${buildOpts}</select>
            <div class="field-error">กรุณาเลือกอาคาร</div>
          </div>
          <div class="field" id="f-floor">
            <label for="floor">ชั้น *</label>
            <select class="select" id="floor" required>${floorOpts}</select>
            <div class="field-error">กรุณาเลือกชั้น</div>
          </div>
        </div>

        <div class="field" id="f-room">
          <label for="room">หมายเลขห้อง *</label>
          <input class="input" id="room" maxlength="10" placeholder="เช่น 301">
          <div class="field-error" id="room-error">กรุณากรอกหมายเลขห้อง</div>
        </div>

        <div class="field" id="f-type">
          <label for="problemType">ประเภทปัญหา *</label>
          <select class="select" id="problemType" required>${typeOpts}</select>
          <div class="field-error">กรุณาเลือกประเภทปัญหา</div>
        </div>

        <div class="field" id="f-desc">
          <label for="description">รายละเอียดปัญหา *</label>
          <textarea class="textarea" id="description" placeholder="อธิบายปัญหาที่พบ เช่น หลอดไฟโต๊ะอ่านหนังสือเสีย ไม่ติดเลยครับ"></textarea>
          <div class="field-error">กรุณากรอกรายละเอียดปัญหา</div>
        </div>

        <div class="field" id="f-urgency">
          <label for="urgency">ความเร่งด่วน</label>
          <select class="select" id="urgency">
            <option value="ปกติ">ปกติ</option>
            <option value="ด่วน">ด่วน</option>
          </select>
          <div class="field-hint">เลือก "ด่วน" สำหรับปัญหาที่ต้องดำเนินการทันที</div>
        </div>

        <div class="field">
          <label>รูปภาพประกอบ (ไม่บังคับ)</label>
          <div id="photo-zone">${photoEmptyHtml()}</div>
          <div id="photo-preview"></div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-block" id="btn-submit">ส่งแจ้งซ่อม</button>
      </form>`;

    bindPhoto(root);
    bindSubmit(root, user, params);
  }

  function photoEmptyHtml() {
    return `<div class="photo-empty" id="btn-pick-photo">📷 คลิกเพื่อแนบรูปภาพ (สูงสุด 1 รูป)</div>`;
  }

  function bindPhoto(root) {
    root.querySelector('#photo-zone')?.setAttribute('data-accept', 'click');
    const zone = root.querySelector('#photo-zone');
    zone.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (file.size > 1.5 * 1024 * 1024) {
          UI.error('รูปภาพใหญ่เกินไป (สูงสุด 1.5 MB) กรุณาเลือกรูปที่เล็กกว่า');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          photoData = reader.result;
          const preview = root.querySelector('#photo-preview');
          preview.innerHTML = `
            <div class="photo-preview">
              <img src="${photoData}" alt="preview">
              <div class="flex-between" style="padding:8px 12px;background:var(--gray-50)">
                <span class="muted" style="font-size:12px">${UI.esc(file.name)}</span>
                <button type="button" class="btn btn-outline btn-sm" id="btn-remove-photo">ลบรูป</button>
              </div>
            </div>`;
          root.querySelector('#photo-zone').innerHTML = '';
          root.querySelector('#btn-remove-photo').addEventListener('click', () => {
            photoData = null;
            root.querySelector('#photo-preview').innerHTML = '';
            root.querySelector('#photo-zone').innerHTML = photoEmptyHtml();
            bindPhoto(root);
          });
        };
        reader.readAsDataURL(file);
      });
      document.body.appendChild(input);
      input.click();
      input.remove();
    });
  }

  function bindSubmit(root, user, params) {
    root.querySelector('#repair-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const building = root.querySelector('#building').value;
      const floor = root.querySelector('#floor').value;
      const room = root.querySelector('#room').value.trim();
      const problemType = root.querySelector('#problemType').value;
      const description = root.querySelector('#description').value.trim();
      const urgency = root.querySelector('#urgency').value;

      const fBuilding = root.querySelector('#f-building');
      const fFloor = root.querySelector('#f-floor');
      const fType = root.querySelector('#f-type');
      const fRoom = root.querySelector('#f-room');
      const fDesc = root.querySelector('#f-desc');
      const roomErr = root.querySelector('#room-error');
      [fBuilding, fFloor, fType, fRoom, fDesc].forEach((f) => f.classList.remove('invalid'));

      let invalid = false;
      if (!building) { fBuilding.classList.add('invalid'); invalid = true; }
      if (!floor) { fFloor.classList.add('invalid'); invalid = true; }
      if (!problemType) { fType.classList.add('invalid'); invalid = true; }
      if (!room) { roomErr.textContent = 'กรุณากรอกหมายเลขห้อง'; fRoom.classList.add('invalid'); invalid = true; }
      else if (!/^\d+$/.test(room)) { roomErr.textContent = 'หมายเลขห้องต้องเป็นตัวเลขเท่านั้น'; fRoom.classList.add('invalid'); invalid = true; }
      if (!description) { fDesc.classList.add('invalid'); invalid = true; }
      if (invalid) return;

      const created = SM.createRepair({
        reporter: user.name,
        reporterUser: user.username,
        building, floor, room,
        problemType, urgency,
        description,
        photo: photoData
      });

      UI.success('แจ้งซ่อมสำเร็จ ได้เลขที่ ' + created.id);
      App.navigate('cadet/tracking/' + created.id);
    });
  }

  return { render };
})();