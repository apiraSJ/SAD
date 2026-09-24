/**
 * App — Router, Auth Guard, App Shell, Navigation
 */

const App = (function () {
  const ROUTES = [
    { pattern: '/login',                page: 'login',          public: true,  title: 'เข้าสู่ระบบ' },
    { pattern: '/cadet/home',           page: 'cadet-home',     roles: ['cadet'], title: 'หน้าหลัก' },
    { pattern: '/cadet/form',           page: 'cadet-form',     roles: ['cadet'], title: 'แจ้งซ่อม' },
    { pattern: '/cadet/tracking',       page: 'cadet-tracking', roles: ['cadet'], title: 'ติดตามสถานะ' },
    { pattern: '/cadet/tracking/:id',   page: 'cadet-tracking', roles: ['cadet'], title: 'รายละเอียดสถานะ' },
    { pattern: '/admin/list',           page: 'admin-list',     roles: ['admin'], title: 'รายการแจ้งซ่อม' },
    { pattern: '/admin/list/:status',   page: 'admin-list',     roles: ['admin'], title: 'รายการแจ้งซ่อม' },
    { pattern: '/admin/detail/:id',     page: 'admin-detail',   roles: ['admin'], title: 'รายละเอียดคำขอ' },
    { pattern: '/admin/report',         page: 'admin-report',   roles: ['admin'], title: 'ภาพรวม / รายงาน' },
    { pattern: '/admin/users',          page: 'admin-users',    roles: ['admin'], title: 'ผู้ใช้และสิทธิ์' },
    { pattern: '/tech/jobs',            page: 'tech-jobs',      roles: ['tech'],  title: 'งานของฉัน' },
    { pattern: '/tech/jobs/:status',    page: 'tech-jobs',      roles: ['tech'],  title: 'งานของฉัน' },
    { pattern: '/tech/result/:id',      page: 'tech-result',    roles: ['tech'],  title: 'รายละเอียดงาน' },
    { pattern: '/exec/dashboard',       page: 'exec-dashboard', roles: ['exec'],  title: 'ภาพรวม' }
  ];

  const app = document.getElementById('app');

  function parseHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    const [pathPart, queryPart] = raw.split('?');
    const query = {};
    if (queryPart) {
      queryPart.split('&').forEach((kv) => {
        const i = kv.indexOf('=');
        const k = decodeURIComponent(i >= 0 ? kv.slice(0, i) : kv);
        const v = i >= 0 ? decodeURIComponent(kv.slice(i + 1)) : '';
        query[k] = v;
      });
    }
    return { path: pathPart || '/login', query };
  }

  function matchRoute(path) {
    const segs = path.split('/').filter(Boolean);
    for (let i = 0; i < ROUTES.length; i++) {
      const r = ROUTES[i];
      const pat = r.pattern.split('/').filter(Boolean);
      if (pat.length !== segs.length) continue;
      const params = {};
      let ok = true;
      for (let j = 0; j < pat.length; j++) {
        if (pat[j].startsWith(':')) params[pat[j].slice(1)] = decodeURIComponent(segs[j]);
        else if (pat[j] !== segs[j]) { ok = false; break; }
      }
      if (ok) return { route: r, params };
    }
    return null;
  }

  function navigate(path) {
    location.hash = '#/' + path;
  }

  function roleLabel(role) {
    return (MOCK_DATA.roleMeta[role] || {}).label || role;
  }

  function render() {
    const { path, query } = parseHash();
    const match = matchRoute(path);

    if (!match) {
      renderUnauthorized('ไม่พบหน้า');
      return;
    }

    const { route, params } = match;
    const user = SM.user();

    if (!route.public && !user) {
      navigate('login');
      return;
    }
    if (route.page === 'login' && user) {
      navigate(MOCK_DATA.roleMeta[user.role].home.slice(1));
      return;
    }
    if (!route.public && user && route.roles && !route.roles.includes(user.role)) {
      renderUnauthorized('คุณไม่มีสิทธิ์เข้าถึงหน้านี้', user);
      return;
    }

    if (route.page === 'login') {
      renderLoginShell();
    } else {
      renderShell(user, path, query, route.title);
    }

    const page = Pages[route.page];
    if (!page || typeof page.render !== 'function') {
      renderUnauthorized('หน้านี้ยังไม่พร้อมใช้งาน');
      return;
    }

    document.getElementById('page').innerHTML = '';
    page.render(document.getElementById('page'), Object.assign({}, params, { query }), user);
    if (page.bind) page.bind(document.getElementById('page'), Object.assign({}, params, { query }), user);
    document.title = route.title + ' · ระบบแจ้งซ่อมอาคารนอน';
  }

  function renderLoginShell() {
    app.innerHTML = `<main id="page" class="page"></main>`;
  }

  function renderShell(user, path, query, title) {
    const role = user.role;
    const nav = MOCK_DATA.nav[role] || [];

    const sidebarNav = nav.map((n) => {
      const active = navActive(n, path, query);
      const href = '#/' + n.route + (n.query && n.query.status ? '?status=' + encodeURIComponent(n.query.status) : '');
      return `<a class="nav-item ${active ? 'active' : ''}" href="${href}" data-nav>
                <span class="nav-icon">${n.icon}</span>${n.label}</a>`;
    }).join('');

    const bottomNav = nav.slice(0, 4).map((n) => {
      const active = navActive(n, path, query);
      const href = '#/' + n.route + (n.query && n.query.status ? '?status=' + encodeURIComponent(n.query.status) : '');
      return `<a class="bn-item ${active ? 'active' : ''}" href="${href}" data-nav>
                <span class="bn-icon">${n.icon}</span>${n.label}</a>`;
    }).join('');

    const initials = user.name.replace(/^[^.]*\./, '').trim().charAt(0) || user.name.charAt(0);

    app.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-logo">🔧</div>
          <div>
            <div class="brand-name">ระบบแจ้งซ่อม<br>อาคารนอน</div>
            <div class="brand-sub">นักเรียนนายเรืออากาศ</div>
          </div>
        </div>
        <div class="side-nav">
          <div class="nav-group">
            <div class="nav-group-label">เมนู ${roleLabel(role)}</div>
            ${sidebarNav}
          </div>
        </div>
        <div class="side-footer">
          <div class="flex-between">
            <div class="user-chip">
              <div class="avatar">${UI.esc(initials)}</div>
              <div>
                <div class="uc-name">${UI.esc(user.name)}</div>
                <div class="uc-role">${UI.esc(roleLabel(role))}</div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-logout">ออกจากระบบ</button>
          </div>
        </div>
      </aside>
      <div class="main-wrap">
        <header class="topbar">
          <button class="icon-btn hidden-desktop" id="btn-hamburger" aria-label="เมนู">☰</button>
          <div class="topbar-title">${UI.esc(title)}</div>
          <div class="topbar-user">
            <div class="tu-name">${UI.esc(user.name)}<br><span class="muted">${UI.esc(roleLabel(role))}</span></div>
            <div class="avatar" style="width:32px;height:32px;font-size:12px">${UI.esc(initials)}</div>
          </div>
        </header>
        <main id="page" class="page"></main>
      </div>
      <nav class="bottom-nav">${bottomNav}</nav>`;

    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('btn-logout').addEventListener('click', () => {
      SM.logout();
      navigate('login');
    });
    document.getElementById('btn-hamburger').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
    document.querySelectorAll('.sidebar [data-nav]').forEach((el) => {
      el.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));
    });
  }

  function navActive(n, path, query) {
    const pathActive = path === n.route;
    if (!pathActive) return false;
    if (n.query && n.query.status) return query.status === n.query.status;
    return true;
  }

  function renderUnauthorized(msg, user) {
    renderLoginShell();
    const home = user ? MOCK_DATA.roleMeta[user.role].home : null;
    const page = document.getElementById('page');
    page.innerHTML = `
      <div class="empty-state" style="margin-top:60px">
        <div class="es-icon">⛔</div>
        <h3>${UI.esc(msg)}</h3>
        <p class="muted mt-2">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ระบบจะนำคุณกลับสู่หน้าหลักของบทบาท</p>
        <div class="mt-4">
          ${home ? `<a class="btn btn-primary" href="#${home}">ไปหน้าหลักของฉัน</a>` : ''}
          <a class="btn btn-outline" href="#/login">กลับหน้าเข้าสู่ระบบ</a>
        </div>
      </div>`;
  }

  function refresh() {
    render();
  }

  function init() {
    SM.registerStorageListener(() => refresh());
    window.addEventListener('hashchange', render);
    render();
  }

  return { init, navigate, refresh, parseHash, matchRoute, roleLabel };
})();

document.addEventListener('DOMContentLoaded', () => App.init());