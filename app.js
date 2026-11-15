(function () {
  const TITLES = { overview: 'Overview', projects: 'Projects', about: 'About' };
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = String(new Date().getFullYear());
  ['year', 'case-year'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.textContent = year;
  });

  const pageTitle = document.getElementById('page-title');
  const typed = new WeakSet();

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Typewriter-style reveal for headlines (skipped for reduced motion).
  function typeReveal(el) {
    if (!el || reduceMotion || typed.has(el)) return;
    typed.add(el);
    const html = el.innerHTML;
    const parts = html.split(/(<br\s*\/?>)/i);
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = parts.map(function (p) {
      if (/^<br/i.test(p)) return p;
      return p.split('').map(function (c) {
        return '<span class="ch" aria-hidden="true">' + c + '</span>';
      }).join('');
    }).join('');
    const chars = el.querySelectorAll('.ch');
    chars.forEach(function (c, i) {
      c.style.animationDelay = (i * 45) + 'ms';
    });
    el.classList.add('typing');
  }

  function setActiveNav(name) {
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      const on = el.getAttribute('data-nav') === name;
      el.classList.toggle('active', on);
      if (el.classList.contains('tab')) {
        if (on) el.setAttribute('aria-current', 'page');
        else el.removeAttribute('aria-current');
      }
    });
  }

  function showPanel(name) {
    const key = TITLES[name] ? name : 'overview';
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      const on = panel.getAttribute('data-panel') === key;
      panel.classList.toggle('active', on);
      panel.hidden = !on;
      if (on) typeReveal(panel.querySelector('[data-type]'));
    });
    if (pageTitle) pageTitle.textContent = TITLES[key];
    document.title = 'Timothy McCaslin // ' + TITLES[key];
    setActiveNav(key);
  }

  function statusTag(status) {
    const s = String(status || 'live').toUpperCase();
    return '<span class="tag tag-accent"><span class="tag-dot" aria-hidden="true">●</span> ' + escapeHtml(s) + '</span>';
  }

  function prettyUrl(url) {
    return String(url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  function cardHtml(p, i) {
    const name = escapeHtml(p.name || 'Untitled');
    const desc = escapeHtml(p.description || '');
    const url = escapeHtml(p.url || '#');
    const icon = escapeHtml(p.icon || '');
    const status = escapeHtml(String(p.status || 'live').toUpperCase());
    const no = String(i + 1).padStart(2, '0');
    return (
      '<article class="file card">' +
        '<div class="file-head">' +
          '<span class="meta">EXHIBIT ' + no + ' <span class="sep">//</span> PROJECT FILE</span>' +
          statusTag(p.status) +
        '</div>' +
        '<div class="file-body">' +
          '<div class="card-title">' +
            (icon ? '<img class="card-icon" src="' + icon + '" width="44" height="44" alt="">' : '') +
            '<h3 class="card-name">' + name + '</h3>' +
          '</div>' +
          '<dl class="kv">' +
            '<div><dt>PROJECT:</dt><dd class="hot">' + name.toUpperCase() + '</dd></div>' +
            '<div><dt>STATUS:</dt><dd>' + status + '</dd></div>' +
            (p.stack ? '<div><dt>STACK:</dt><dd>' + escapeHtml(String(p.stack).toUpperCase()) + '</dd></div>' : '') +
            '<div><dt>LINK:</dt><dd><a class="inline-link" href="' + url + '" rel="noopener" target="_blank">' + escapeHtml(prettyUrl(p.url)) + '</a></dd></div>' +
          '</dl>' +
          (desc ? '<p class="note">' + desc + '</p>' : '') +
          '<a class="directive" href="' + url + '" rel="noopener" target="_blank">' +
            '<span class="directive-label">DIRECTIVE:</span> ' +
            '<span class="directive-text">OPEN ' + name.toUpperCase() + '</span>' +
            '<span class="directive-arrow" aria-hidden="true">→</span>' +
            '<span class="sr-only"> (opens in a new tab)</span>' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProjects(list) {
    const html = list.length
      ? list.map(cardHtml).join('')
      : '<div class="file empty"><div class="file-body"><p class="meta">NO FILES ON RECORD. ADD ONE IN projects/projects.json.</p></div></div>';
    ['overview-grid', 'projects-grid'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });
    const live = list.filter(function (p) {
      return String(p.status || 'live').toLowerCase() === 'live';
    }).length;
    const sp = document.getElementById('stat-projects');
    const sl = document.getElementById('stat-live');
    if (sp) sp.textContent = String(list.length).padStart(2, '0');
    if (sl) sl.textContent = String(live).padStart(2, '0');
  }

  function routeFromHash() {
    showPanel((location.hash || '#overview').replace(/^#/, ''));
  }

  window.addEventListener('hashchange', function () {
    routeFromHash();
    window.scrollTo(0, 0);
  });

  fetch('/projects/projects.json', { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load projects');
      return r.json();
    })
    .then(function (data) { renderProjects(Array.isArray(data) ? data : []); })
    .catch(function () { renderProjects([]); })
    .finally(routeFromHash);
})();
