/**
 * Page: Login
 * เข้าสู่ระบบเดียวสำหรับทุก Role ไม่มี dropdown เลือก Role
 */
Pages['login'] = (function () {
  function render(root) {
    const home = MOCK_DATA.roleMeta;
    const accountsList = Object.values(MOCK_DATA.accounts).map((a) =>
      `<tr><td>${a.username}</td><td><code>1234</code></td><td>${home[a.role].label}</td></tr>`
    ).join('');

    root.innerHTML = `
      <div class="login-screen">
        <div class="login-card">
          <div class="card card-pad">
            <div class="login-brand">
              <div class="lb-logo">🔧</div>
              <div class="lb-title">ระบบแจ้งซ่อมอาคารนอน</div>
              <div class="lb-sub">นักเรียนนายเรืออากาศ</div>
            </div>
            <form id="login-form">
              <div class="field" id="f-username">
                <label for="username">ชื่อผู้ใช้ (Username)</label>
                <input class="input" id="username" autocomplete="username" placeholder="เช่น cadet01">
                <div class="field-error">กรุณากรอกชื่อผู้ใช้</div>
              </div>
              <div class="field" id="f-password">
                <label for="password">รหัสผ่าน (Password)</label>
                <input class="input" id="password" type="password" autocomplete="current-password" placeholder="••••">
                <div class="field-error">กรุณากรอกรหัสผ่าน</div>
              </div>
              <div class="field" id="f-error">
                <div class="field-error" id="login-error" style="display:block;padding:10px 12px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;color:#B91C1C;font-weight:600"></div>
              </div>
              <button type="submit" class="btn btn-primary btn-lg btn-block" id="btn-login">เข้าสู่ระบบ</button>
            </form>

            <div class="demo-accounts">
              <div class="da-title">บัญชีทดสอบ (Demo)</div>
              <table>
                <thead><tr><td style="font-weight:700">User</td><td style="font-weight:700">Pass</td><td style="font-weight:700">Role</td></tr></thead>
                ${accountsList}
              </table>
            </div>

            <div class="mt-3 text-right">
              <button type="button" class="btn btn-ghost btn-sm" id="btn-reset">รีเซ็ตข้อมูลสาธิต</button>
            </div>
          </div>
        </div>
      </div>`;

    const fUsername = root.querySelector('#f-username');
    const fPassword = root.querySelector('#f-password');
    const errBox = root.querySelector('#f-error');
    errBox.hidden = true;

    root.querySelector('#btn-reset').addEventListener('click', () => {
      SM.reset();
      UI.success('รีเซ็ตข้อมูลสาธิตแล้ว');
    });

    root.querySelector('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const u = root.querySelector('#username').value.trim();
      const p = root.querySelector('#password').value;

      fUsername.classList.remove('invalid');
      fPassword.classList.remove('invalid');
      errBox.hidden = true;
      if (!u) { fUsername.classList.add('invalid'); return; }
      if (!p) { fPassword.classList.add('invalid'); return; }

      const user = SM.login(u, p);
      if (!user) {
        errBox.hidden = false;
        errBox.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        return;
      }
      const home = MOCK_DATA.roleMeta[user.role].home;
      App.navigate(home.slice(1));
    });
  }

  return { render };
})();