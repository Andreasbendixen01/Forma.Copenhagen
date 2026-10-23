/* ==========================================================
   FORMA — SAVED PRODUCTS MODULE
   ========================================================== */

(function () {
  "use strict";

  if (!window.Forma) {
    console.error(
      "[Forma Saved Products] Forma Engine must load before forma.js"
    );

    return;
  }

  if (window.Forma.savedProducts) {
    return;
  }

  const STORAGE_KEY = window.Forma.storage.keys.savedProducts;

  function normalizeProductId(productId) {
    return String(productId);
  }

  function getAll() {
    const products = window.Forma.storage.get(STORAGE_KEY, []);

    return Array.isArray(products) ? products : [];
  }

  function save(products) {
    window.Forma.storage.set(STORAGE_KEY, products);

    window.Forma.events.emit("forma:saved-products-updated", {
      products,
      count: products.length
    });
  }

  function isSaved(productId) {
    const normalizedProductId = normalizeProductId(productId);

    return getAll().some(
      product => normalizeProductId(product.id) === normalizedProductId
    );
  }

  function add(productId, productHandle) {
    const normalizedProductId = normalizeProductId(productId);
    const products = getAll();

    if (isSaved(normalizedProductId)) {
      return false;
    }

    products.push({
      id: normalizedProductId,
      handle: productHandle
    });

    save(products);

    return true;
  }

  function remove(productId) {
    const normalizedProductId = normalizeProductId(productId);
    const products = getAll();

    const updatedProducts = products.filter(
      product => normalizeProductId(product.id) !== normalizedProductId
    );

    if (updatedProducts.length === products.length) {
      return false;
    }

    save(updatedProducts);

    return true;
  }

  function toggle(productId, productHandle) {
    const normalizedProductId = normalizeProductId(productId);

    if (isSaved(normalizedProductId)) {
      remove(normalizedProductId);
      return false;
    }

    add(normalizedProductId, productHandle);
    return true;
  }

  function count() {
    return getAll().length;
  }

  function clear() {
    save([]);
  }

  window.Forma.savedProducts = {
    getAll,
    isSaved,
    add,
    remove,
    toggle,
    count,
    clear
  };

})();


/* ==========================================================
   FORMA — PRODUCT CARD IMAGE CAROUSEL
   Supports dynamically loaded Shopify recommendations
   ========================================================== */

(function () {
  "use strict";

  if (window.__formaProductCardCarouselV2) return;
  window.__formaProductCardCarouselV2 = true;

  function getCarouselButton(target) {
    if (!target || typeof target.closest !== "function") return null;

    return target.closest(
      "[data-forma-carousel-next], [data-forma-carousel-prev]"
    );
  }

  function changeSlide(button) {
    const viewport = button.closest("[data-forma-product-carousel]");
    if (!viewport) return;

    const slides = Array.from(
      viewport.querySelectorAll("[data-forma-carousel-slide]")
    );

    if (slides.length < 2) return;

    let currentIndex = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });

    if (currentIndex < 0) currentIndex = 0;

    const direction = button.hasAttribute("data-forma-carousel-next") ? 1 : -1;
    const nextIndex = (currentIndex + direction + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      const active = index === nextIndex;

      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");

      if (active) {
        slide.removeAttribute("tabindex");
      } else {
        slide.setAttribute("tabindex", "-1");
      }
    });

    viewport.setAttribute("data-active-slide", String(nextIndex));
  }

  window.addEventListener("click", function (event) {
    const button = getCarouselButton(event.target);
    if (!button) return;

    const viewport = button.closest("[data-forma-product-carousel]");
    if (!viewport) return;

    event.preventDefault();
    event.stopPropagation();

    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }

    changeSlide(button);
  }, true);

  window.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const activeElement = document.activeElement;
    if (!activeElement || typeof activeElement.closest !== "function") return;

    const viewport = activeElement.closest("[data-forma-product-carousel]");
    if (!viewport) return;

    const button = viewport.querySelector(
      event.key === "ArrowRight"
        ? "[data-forma-carousel-next]"
        : "[data-forma-carousel-prev]"
    );

    if (!button) return;

    event.preventDefault();
    changeSlide(button);
  }, true);
})();
