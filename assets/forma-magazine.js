/* FORMA MAGAZINE: category filter and layouts for drafts 2 (rows with breakers) and 3 (masonry) */
(function () {
  function init(root) {
    if (!root || root.hasAttribute('data-fm-ready')) return;
    root.setAttribute('data-fm-ready', '');

    var layout = root.getAttribute('data-fm-layout') || 'rows';
    var grid = root.querySelector('[data-fm-grid]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-fm-card]'));
    var breakers = Array.prototype.slice.call(root.querySelectorAll('[data-fm-breaker]'));
    var links = root.querySelectorAll('[data-mag-topic], [data-mag-brand]');
    var heading = root.querySelector('[data-mag-heading]');
    var description = root.querySelector('[data-mag-description]');
    var logo = root.querySelector('[data-mag-logo]');
    var empty = root.querySelector('[data-mag-empty]');
    var brandList = root.querySelector('[data-mag-brands]');
    var head = root.querySelector('[data-fm-head]');
    var topbar = root.querySelector('[data-fm-topbar]');
    var brandHandles = Array.prototype.map.call(root.querySelectorAll('[data-mag-brand]'), function (link) {
      return link.getAttribute('data-mag-brand');
    });
    var visible = cards.slice();
    var lastCols = 0;

    function cols() {
      var value = parseInt(getComputedStyle(root).getPropertyValue('--fm-cols-now'), 10);
      return value > 0 ? value : 4;
    }

    function layoutRows(list) {
      var c = cols();
      var frag = document.createDocumentFragment();
      var i = 0;
      var r = 0;
      var bn = 0;
      while (i < list.length) {
        r += 1;
        var row = document.createElement('div');
        row.className = 'fm-row';
        if (breakers.length && r % 3 === 0) {
          var span = Math.min(2, c);
          var take = c - span;
          var breaker = breakers[bn % breakers.length].cloneNode(true);
          breaker.removeAttribute('data-fm-breaker');
          breaker.style.gridColumn = 'span ' + span;
          var items = list.slice(i, i + take);
          i += take;
          if (bn % 2 === 1) {
            items.forEach(function (card) { row.appendChild(card); });
            row.appendChild(breaker);
          } else {
            row.appendChild(breaker);
            items.forEach(function (card) { row.appendChild(card); });
          }
          bn += 1;
        } else {
          list.slice(i, i + c).forEach(function (card) { row.appendChild(card); });
          i += c;
        }
        frag.appendChild(row);
      }
      grid.innerHTML = '';
      grid.appendChild(frag);
      Array.prototype.forEach.call(grid.querySelectorAll('video'), function (video) {
        video.muted = true;
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () {});
      });
    }

    function layoutMasonry(list) {
      var c = cols();
      var columns = [];
      var heights = [];
      for (var k = 0; k < c; k += 1) {
        var col = document.createElement('div');
        col.className = 'fm-col';
        columns.push(col);
        heights.push(0);
      }
      list.forEach(function (card) {
        var ratio = parseFloat(card.getAttribute('data-ratio')) || 0.8;
        var shortest = heights.indexOf(Math.min.apply(Math, heights));
        columns[shortest].appendChild(card);
        heights[shortest] += 1 / ratio;
      });
      grid.innerHTML = '';
      columns.forEach(function (col) { grid.appendChild(col); });
    }

    function draw() {
      lastCols = cols();
      if (layout === 'masonry') {
        layoutMasonry(visible);
      } else {
        layoutRows(visible);
      }
      grid.classList.add('is-ready');
      if (empty) empty.hidden = visible.length > 0;
    }

    function find(attr, value) {
      if (!value) return null;
      var safe = window.CSS && CSS.escape ? CSS.escape(value) : value.replace(/[^a-z0-9_-]/gi, '');
      return root.querySelector('[' + attr + '="' + safe + '"]');
    }

    function apply(kind, value, push) {
      var link = kind === 'brand' ? find('data-mag-brand', value) : find('data-mag-topic', value);
      if (!link) {
        kind = 'topic';
        value = 'all';
        link = find('data-mag-topic', 'all');
      }
      links.forEach(function (item) {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
      if (brandList) brandList.hidden = !(kind === 'brand' || value === 'brands');

      visible = cards.filter(function (card) {
        var tags = card.getAttribute('data-tags') || ' ';
        if (value === 'all') return true;
        if (kind === 'topic' && value === 'brands') {
          return brandHandles.some(function (handle) { return tags.indexOf(' ' + handle + ' ') > -1; });
        }
        return tags.indexOf(' ' + value + ' ') > -1;
      });

      heading.textContent = link.getAttribute('data-title') || link.textContent;
      var text = link.getAttribute('data-description') || '';
      description.textContent = text;
      description.hidden = text === '';
      var logoUrl = kind === 'brand' ? link.getAttribute('data-logo') : null;
      logo.innerHTML = '';
      if (logoUrl) {
        var img = document.createElement('img');
        img.src = logoUrl;
        img.alt = '';
        logo.appendChild(img);
      }
      logo.hidden = !logoUrl;

      draw();

      if (push) {
        var url = new URL(window.location.href);
        url.searchParams.delete('topic');
        url.searchParams.delete('brand');
        if (value !== 'all') url.searchParams.set(kind === 'brand' ? 'brand' : 'topic', value);
        window.history.pushState({}, '', url);
        if (head && head.getBoundingClientRect().top < 0) {
          var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          head.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        }
      }
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var brand = link.getAttribute('data-mag-brand');
        if (brand) {
          apply('brand', brand, true);
        } else {
          apply('topic', link.getAttribute('data-mag-topic'), true);
        }
      });
    });

    function fromUrl() {
      var params = new URLSearchParams(window.location.search);
      if (params.get('brand')) {
        apply('brand', params.get('brand'), false);
      } else {
        apply('topic', params.get('topic') || 'all', false);
      }
    }

    function measureTopbar() {
      if (topbar) root.style.setProperty('--fm-topbar-h', topbar.offsetHeight + 'px');
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measureTopbar();
        if (cols() !== lastCols) draw();
      }, 120);
    });
    window.addEventListener('popstate', fromUrl);
    measureTopbar();
    fromUrl();
  }

  function initAll(scope) {
    Array.prototype.forEach.call((scope || document).querySelectorAll('[data-fm-layout]'), init);
  }

  window.FormaMagazine = { init: init };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', function (event) { initAll(event.target); });
})();
