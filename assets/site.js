/* Site-wide UI: mobile nav, modals, notify confirmation */
(function () {
  // ---- mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  // ---- modals (sizing guide, etc.)
  function openModal(m) { m.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeModal(m) { m.hidden = true; document.body.style.overflow = ''; }

  document.addEventListener('click', function (e) {
    var trig = e.target.closest && e.target.closest('[data-modal]');
    if (trig) {
      var m = document.getElementById(trig.dataset.modal);
      if (m) { e.preventDefault(); openModal(m); }
      return;
    }
    if (e.target.closest && e.target.closest('[data-close]')) {
      var box = e.target.closest('.modal');
      if (box) closeModal(box);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(function (m) { if (!m.hidden) closeModal(m); });
    }
  });

  // ---- back-in-stock confirmation (FormSubmit redirects back with ?notified=1)
  if (location.search.indexOf('notified=1') !== -1) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = 'Thanks — we’ll email you when it’s back';
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () { t.classList.remove('show'); }, 4000);
  }
})();
