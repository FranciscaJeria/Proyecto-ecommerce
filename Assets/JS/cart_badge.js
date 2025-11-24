console.log("cart_badge.js cargado");

(function () {
  const CART_KEY = "crochet_cart_v1";

  function getCartCount() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      return cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    } catch (e) {
      console.error("getCartCount error", e);
      return 0;
    }
  }

  function updateCartBadge() {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const count = getCartCount();
    el.textContent = count;
    if (count === 0) el.style.display = "none";
    else el.style.display = "inline-block";
  }

  window.updateCartBadge = updateCartBadge;

  document.addEventListener("DOMContentLoaded", updateCartBadge);

  window.addEventListener("storage", (ev) => {
    if (ev.key === CART_KEY || ev.key === null) updateCartBadge();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") updateCartBadge();
  });
})();
