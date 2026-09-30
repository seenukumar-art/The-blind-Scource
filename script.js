(function () {
  var WA = '919876543210';
  var css = '.site-logo{height:48px;width:auto;background:#fff;border-radius:8px;padding:3px 8px;display:block}' +
    '.menu-toggle{display:none;background:none;border:1px solid rgba(255,255,255,.4);color:#fff;width:40px;height:40px;border-radius:8px;font-size:16px;cursor:pointer}' +
    '.mobile-only{display:none}' +
    '@media(max-width:1100px){.menu-toggle{display:inline-flex;align-items:center;justify-content:center}' +
    'header nav{display:none;position:absolute;top:100%;left:0;right:0;background:#121824;padding:20px 5%}' +
    'header nav.open{display:block}header nav ul{flex-direction:column;gap:16px}' +
    '.nav-right .btn-gold{display:none}.mobile-only{display:list-item}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // Mobile menu
  var nav = document.querySelector('header nav'), right = document.querySelector('.nav-right');
  if (nav && right) {
    var b = document.createElement('button');
    b.className = 'menu-toggle'; b.setAttribute('aria-label', 'Open menu');
    b.innerHTML = '<i class="fa-solid fa-bars"></i>';
    b.onclick = function () { nav.classList.toggle('open'); };
    right.appendChild(b);
    var li = document.createElement('li'); li.className = 'mobile-only';
    li.innerHTML = '<a href="./quote.html" style="color:#c5a880">Get a Free Quote</a>';
    nav.querySelector('ul').appendChild(li);
  }

  // Gallery filters
  var chips = document.querySelectorAll('.chip'), sel = document.querySelector('.filter-dropdown-area select');
  var cards = document.querySelectorAll('.gallery-section .blog-card');
  if (chips.length && cards.length) {
    var map = { 'living room': ['living room', 'apartment', 'villa'], 'bedroom': ['bedroom'], 'kitchen': ['dining'],
      'office': ['office'], 'outdoor': ['outdoor'], 'commercial': ['office'] };
    var cat = 'all images';
    var apply = function () {
      var prod = sel ? sel.value.toLowerCase() : 'all products';
      cards.forEach(function (c) {
        var t = c.querySelector('h3').textContent.toLowerCase(), p = c.querySelector('p').textContent.toLowerCase();
        var okC = cat === 'all images' || (map[cat] || []).some(function (k) { return t.indexOf(k) > -1; });
        var okP = prod === 'all products' || p.indexOf(prod.replace(/s$/, '')) > -1;
        c.style.display = okC && okP ? '' : 'none';
      });
    };
    chips.forEach(function (ch) { ch.onclick = function () {
      chips.forEach(function (x) { x.classList.remove('active'); }); ch.classList.add('active');
      cat = ch.textContent.trim().toLowerCase(); apply(); }; });
    if (sel) sel.onchange = apply;
  }

  // Forms: send the details to WhatsApp (no backend needed)
  document.querySelectorAll('form[data-whatsapp]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [f.dataset.whatsapp];
      f.querySelectorAll('input,select,textarea').forEach(function (el) {
        if (!el.value) return;
        var l = f.querySelector('label[for="' + el.id + '"]');
        lines.push((l ? l.textContent : el.name) + ': ' + el.value);
      });
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');
    });
  });
})();
