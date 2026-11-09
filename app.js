(function () {
  const TITLES = {
    overview: 'Overview',
    projects: 'Projects',
    about: 'About'
  };

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  const menuBtn = document.getElementById('menu-btn');
  const pageTitle = document.getElementById('page-title');

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (backdrop) {
      backdrop.classList.remove('show');
      backdrop.hidden = true;
    }
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('show');
    }
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (sidebar && sidebar.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  function setActiveNav(name) {
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-nav') === name);
    });
  }

  function showPanel(name) {
    const key = TITLES[name] ? name : 'overview';
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      const on = panel.getAttribute('data-panel') === key;
      panel.classList.toggle('active', on);
      panel.hidden = !on;
    });
    if (pageTitle) pageTitle.textContent = TITLES[key];
    setActiveNav(key);
    closeSidebar();
  }

  function statusPill(status) {
    const s = String(status || 'live').toLowerCase();
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return (
      '<span class="pill pill-live"><span class="pill-dot" aria-hidden="true"></span>' +
      escapeHtml(label) +
      '</span>'
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cardHtml(p) {
    const name = escapeHtml(p.name || 'Untitled');
    const desc = escapeHtml(p.description || '');
    const url = escapeHtml(p.url || '#');
    const icon = escapeHtml(p.icon || '');
    return (
      '<article class="card">' +
        '<div class="card-top">' +
          '<div class="card-icon">' +
            (icon ? '<img src="' + icon + '" width="48" height="48" alt="">' : '') +
          '</div>' +
          statusPill(p.status) +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + name + '</h3>' +
          '<p>' + desc + '</p>' +
        '</div>' +
        '<div class="card-actions">' +
          '<a class="btn btn-primary" href="' + url + '" rel="noopener" target="_blank">Open</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProjects(list) {
    const overview = document.getElementById('overview-grid');
    const projects = document.getElementById('projects-grid');
    const html = list.length
      ? list.map(cardHtml).join('')
      : '<div class="empty">No projects yet. Add one in projects/projects.json.</div>';
    if (overview) overview.innerHTML = html;
    if (projects) projects.innerHTML = html;

    const total = list.length;
    const live = list.filter(function (p) {
      return String(p.status || 'live').toLowerCase() === 'live';
    }).length;
    const sp = document.getElementById('stat-projects');
    const sl = document.getElementById('stat-live');
    if (sp) sp.textContent = String(total);
    if (sl) sl.textContent = String(live);
  }

  function routeFromHash() {
    const raw = (location.hash || '#overview').replace(/^#/, '');
    showPanel(raw);
  }

  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      const name = el.getAttribute('data-nav');
      if (!name) return;
      // let hash update; hashchange handles panel
    });
  });

  window.addEventListener('hashchange', routeFromHash);

  fetch('/projects/projects.json', { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load projects');
      return r.json();
    })
    .then(function (data) {
      renderProjects(Array.isArray(data) ? data : []);
    })
    .catch(function () {
      renderProjects([]);
    })
    .finally(routeFromHash);
})();
