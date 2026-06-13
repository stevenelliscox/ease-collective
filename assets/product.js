/* Product page: variant picker driven by window.EASE_PRODUCT */
(function () {
  var P = window.EASE_PRODUCT;
  if (!P) return;

  var selects = Array.prototype.slice.call(document.querySelectorAll('.opt select[data-attr]'));
  var priceEl = document.querySelector('.pinfo .price');
  var addBtn = document.querySelector('.qty-row .add-btn'); // scoped: not the notify-form button
  var note = document.querySelector('.stock-note');
  var qtyEl = document.querySelector('#qty');

  function money(n) { return '$' + n.toFixed(2); }

  function current() {
    var want = {};
    selects.forEach(function (s) { want[s.dataset.attr] = s.value; });
    return P.variants.find(function (v) {
      return Object.keys(want).every(function (k) { return v.attributes[k] === want[k]; });
    });
  }

  function refresh() {
    var v = current();
    if (!v) {
      if (addBtn) addBtn.disabled = true;
      if (note) note.textContent = 'This combination is unavailable.';
      return;
    }
    if (priceEl) {
      if (v.salePrice != null) {
        priceEl.innerHTML = '<span class="was">' + money(v.price) + '</span><span class="now">' + money(v.salePrice) + '</span>';
      } else {
        priceEl.textContent = money(v.price);
      }
    }
    var out = v.stock !== null && v.stock <= 0;
    if (addBtn) {
      addBtn.disabled = out;
      addBtn.textContent = out ? 'Sold out' : 'Add to bag';
    }
    if (note) note.textContent = (!out && v.stock !== null && v.stock <= 3) ? 'Only ' + v.stock + ' left — ready to ship' : '';
    if (qtyEl && v.stock !== null && v.stock > 0) qtyEl.max = v.stock;
  }

  selects.forEach(function (s) { s.addEventListener('change', refresh); });

  // swatch buttons drive the (hidden) selects
  document.querySelectorAll('.opt .swatches').forEach(function (group) {
    var sel = group.parentNode.querySelector('select[data-attr]');
    var valEl = group.parentNode.querySelector('.opt-val');
    if (!sel) return;
    function sync() {
      group.querySelectorAll('.sw').forEach(function (b) {
        var on = b.dataset.val === sel.value;
        b.classList.toggle('on', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      if (valEl) valEl.textContent = sel.value;
    }
    group.querySelectorAll('.sw').forEach(function (b) {
      b.addEventListener('click', function () {
        sel.value = b.dataset.val;
        sel.dispatchEvent(new Event('change'));
        sync();
      });
    });
    sel.addEventListener('change', sync);
    sync();
  });

  // product detail tabs
  var tabBtns = document.querySelectorAll('.ptabs .tabhead button');
  var tabPanes = document.querySelectorAll('.ptabs .tabpane');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = +btn.dataset.tab;
      tabBtns.forEach(function (b) { b.classList.toggle('on', b === btn); });
      tabPanes.forEach(function (p, n) { p.classList.toggle('on', n === i); });
    });
  });

  if (addBtn) addBtn.addEventListener('click', function () {
    var v = current();
    if (!v) return;
    var qty = Math.max(1, parseInt(qtyEl && qtyEl.value || '1', 10) || 1);
    window.EASE_addToCart(v.sku, qty);
  });

  // gallery
  var main = document.querySelector('.gallery .main img');
  document.querySelectorAll('.gallery .strip img').forEach(function (th) {
    th.addEventListener('click', function () {
      main.src = th.dataset.full;
      document.querySelectorAll('.gallery .strip img').forEach(function (o) { o.classList.remove('on'); });
      th.classList.add('on');
    });
  });

  refresh();
})();
