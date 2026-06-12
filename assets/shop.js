/* Shop grid: category filter (also honors legacy ?category= links) */
(function () {
  var buttons = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('.grid .card');

  function apply(cat) {
    buttons.forEach(function (b) { b.classList.toggle('on', b.dataset.cat === cat); });
    cards.forEach(function (c) {
      var cats = c.dataset.cats ? c.dataset.cats.split('|') : [];
      c.style.display = (cat === 'All' || cats.indexOf(cat) !== -1) ? '' : 'none';
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      apply(b.dataset.cat);
      var u = new URL(location.href);
      if (b.dataset.cat === 'All') u.searchParams.delete('category');
      else u.searchParams.set('category', b.dataset.cat);
      history.replaceState(null, '', u);
    });
  });

  var initial = new URL(location.href).searchParams.get('category') || 'All';
  apply(initial);
})();
