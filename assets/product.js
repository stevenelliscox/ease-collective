/* Product page: variant picker driven by window.EASE_PRODUCT */
(function () {
  var P = window.EASE_PRODUCT;
  if (!P) return;

  var selects = Array.prototype.slice.call(document.querySelectorAll('.opt select[data-attr]'));
  var priceEl = document.querySelector('.pinfo .price');
  var addBtn = document.querySelector('.add-btn');
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
      addBtn.disabled = true;
      note.textContent = 'This combination is unavailable.';
      return;
    }
    if (v.salePrice != null) {
      priceEl.innerHTML = '<span class="was">' + money(v.price) + '</span><span class="now">' + money(v.salePrice) + '</span>';
    } else {
      priceEl.textContent = money(v.price);
    }
    var out = v.stock !== null && v.stock <= 0;
    addBtn.disabled = out;
    addBtn.textContent = out ? 'Sold out' : 'Add to bag';
    note.textContent = (!out && v.stock !== null && v.stock <= 3) ? 'Only ' + v.stock + ' left — ready to ship' : '';
    if (qtyEl && v.stock !== null && v.stock > 0) qtyEl.max = v.stock;
  }

  selects.forEach(function (s) { s.addEventListener('change', refresh); });

  addBtn.addEventListener('click', function () {
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
