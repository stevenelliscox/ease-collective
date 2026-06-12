/* Cart: localStorage + Stripe Checkout via Cloudflare Worker */
(function () {
  var KEY = 'ease_cart_v1';
  var CFG = window.EASE_CONFIG || {};
  var CAT = window.EASE_CATALOG || {}; // sku -> {t,title; a,attrs; p,price; s,salePrice; i,image; u,url}

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
  }
  function count() { return read().reduce(function (n, it) { return n + it.qty; }, 0); }
  function money(n) { return '$' + n.toFixed(2); }
  function unitPrice(v) { return (v.s != null ? v.s : v.p); }

  window.EASE_addToCart = function (sku, qty) {
    var items = read();
    var hit = items.find(function (it) { return it.sku === sku; });
    if (hit) hit.qty += qty; else items.push({ sku: sku, qty: qty });
    write(items);
    toast('Added to bag');
    open();
  };

  function setQty(sku, qty) {
    var items = read().map(function (it) {
      return it.sku === sku ? { sku: sku, qty: qty } : it;
    }).filter(function (it) { return it.qty > 0; });
    write(items);
  }

  function open() { document.body.classList.add('cart-open'); }
  function close() { document.body.classList.remove('cart-open'); }

  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  function render() {
    var btn = document.querySelector('.cart-btn .count');
    if (btn) btn.textContent = count();
    var box = document.querySelector('.cart-items');
    if (!box) return;
    var items = read();
    if (!items.length) {
      box.innerHTML = '<div class="cart-empty">Your bag is empty.</div>';
    } else {
      box.innerHTML = items.map(function (it) {
        var v = CAT[it.sku];
        if (!v) return '';
        var attrs = (v.a || []).join(' / ');
        return '<div class="cart-row">' +
          '<a href="' + v.u + '"><img src="' + v.i + '" alt=""></a>' +
          '<div><div class="t">' + v.t + '</div>' +
          (attrs ? '<div class="v">' + attrs + '</div>' : '') +
          '<div class="q">' +
          '<button data-dq="' + it.sku + '">−</button><span>' + it.qty + '</span>' +
          '<button data-iq="' + it.sku + '">+</button>' +
          '<button class="rm" data-rm="' + it.sku + '">remove</button>' +
          '</div></div>' +
          '<div class="p">' + money(unitPrice(v) * it.qty) + '</div>' +
          '</div>';
      }).join('');
    }
    var sub = items.reduce(function (n, it) {
      var v = CAT[it.sku];
      return v ? n + unitPrice(v) * it.qty : n;
    }, 0);
    var subEl = document.querySelector('.cart-foot .sub b');
    if (subEl) subEl.textContent = money(sub);
    var co = document.querySelector('.checkout-btn');
    if (co) co.style.display = items.length ? '' : 'none';
  }

  function checkout() {
    var items = read();
    if (!items.length) return;
    if (!CFG.workerUrl) { toast('Checkout not configured yet'); return; }
    var btn = document.querySelector('.checkout-btn');
    btn.disabled = true; btn.textContent = 'One moment…';
    fetch(CFG.workerUrl + '/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.url) { location.href = d.url; }
      else { throw new Error(d && d.error || 'no url'); }
    }).catch(function (e) {
      btn.disabled = false; btn.textContent = 'Check out';
      toast('Checkout problem — please try again');
      if (window.console) console.error(e);
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-dq],[data-iq],[data-rm]') : null;
    if (t) {
      var items = read();
      var find = function (s) { return items.find(function (it) { return it.sku === s; }); };
      if (t.dataset.dq) { var a = find(t.dataset.dq); setQty(t.dataset.dq, a.qty - 1); }
      if (t.dataset.iq) { var b = find(t.dataset.iq); setQty(t.dataset.iq, b.qty + 1); }
      if (t.dataset.rm) setQty(t.dataset.rm, 0);
      return;
    }
    if (e.target.closest && e.target.closest('.cart-btn')) { open(); return; }
    if (e.target.closest && e.target.closest('.cart-close')) { close(); return; }
    if (e.target.classList && e.target.classList.contains('cart-veil')) { close(); return; }
    if (e.target.closest && e.target.closest('.checkout-btn')) { checkout(); return; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // clear cart after successful checkout
  if (location.pathname.indexOf('/thank-you') !== -1) {
    localStorage.removeItem(KEY);
  }
  render();
})();
