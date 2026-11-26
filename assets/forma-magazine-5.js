/* FORMA MAGAZINE 5: category filter, lead story and "load more" */
(function () {
  function init(root) {
    if (!root || root.hasAttribute('data-fm5-ready')) return;
    root.setAttribute('data-fm5-ready', '');

    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-fm5-card]'));
    var links = root.querySelectorAll('[data-mag-topic], [data-mag-brand]');
    var heading = root.querySelector('[data-mag-heading]');
    var description = root.querySelector('[data-mag-description]');
    var logo = root.querySelector('[data-mag-logo]');
    var empty = root.querySelector('[data-mag-empty]');
    var brandList = root.querySelector('[data-mag-brands]');
    var head = root.querySelector('[data-fm5-head]');
    var divider = root.querySelector('[data-fm5-divider]');
    var more = root.querySelector('[data-fm5-more]');
    var moreButton = more ? more.querySelector('button') : null;
    var perPage = parseInt(root.getAttribute('data-per-page'), 10) || 15;
    var brandHandles = Array.prototype.map.call(root.querySelectorAll('[data-mag-brand]'), function (link) {
      return link.getAttribute('data-mag-brand');
    });
    var visible = cards.slice();
    var shown = perPage;

    function draw() {
      cards.forEach(function (card) {
        card.hidden = true;
        card.classList.remove('is-lead', 'is-side', 'is-side-2');
      });
      visible.forEach(function (card, i) {
        if (i >= shown) return;
        card.hidden = false;
        if (i === 0) card.classList.add('is-lead');
        else if (i < 3) card.classList.add('is-side');
        if (i === 2) card.classList.add('is-side-2');
      });
      if (divider) divider.hidden = Math.min(shown, visible.length) <= 3;
      if (more) more.hidden = visible.length <= shown;
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
      Array.prototype.forEach.call(links, function (item) {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });
      if (link) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
      if (brandList) brandList.hidden = !(kind === 'brand' || value === 'brands');

      visible = cards.filter(function (card) {
        var tags = card.getAttribute('data-tags') || ' ';
        if (value === 'all') return true;
        if (kind === 'topic' && value === 'brands') {
          return brandHandles.some(function (handle) { return tags.indexOf(' ' + handle + ' ') > -1; });
        }
        return tags.indexOf(' ' + value + ' ') > -1;
      });
      shown = perPage;

      if (link && heading) heading.textContent = link.getAttribute('data-title') || link.textContent;
      if (link && description) {
        var text = link.getAttribute('data-description') || '';
        description.textContent = text;
        description.hidden = text === '';
      }
      if (logo) {
        var logoUrl = kind === 'brand' && link ? link.getAttribute('data-logo') : null;
        logo.innerHTML = '';
        if (logoUrl) {
          var img = document.createElement('img');
          img.src = logoUrl;
          img.alt = '';
          logo.appendChild(img);
        }
        logo.hidden = !logoUrl;
      }

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

    Array.prototype.forEach.call(links, function (link) {
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

    if (moreButton) {
      moreButton.addEventListener('click', function () {
        var first = visible[shown];
        shown += perPage;
        draw();
        if (first) {
          var target = first.querySelector('a');
          if (target) target.focus({ preventScroll: true });
        }
      });
    }

    function fromUrl() {
      var params = new URLSearchParams(window.location.search);
      if (params.get('brand')) {
        apply('brand', params.get('brand'), false);
      } else {
        apply('topic', params.get('topic') || 'all', false);
      }
    }

    window.addEventListener('popstate', fromUrl);
    fromUrl();
  }

  function initAll(scope) {
    Array.prototype.forEach.call((scope || document).querySelectorAll('[data-fm5]'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(); });
  } else {
    initAll();
  }
  document.addEventListener('shopify:section:load', function (event) { initAll(event.target); });
})();
