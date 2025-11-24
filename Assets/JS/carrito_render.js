console.log("carrito_render.js cargado");

const CART_KEY = "crochet_cart_v1";

function formatCLPManual(value) {
  const n = Math.round(Number(value) || 0);
  return "CLP $" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartBadge();
});

window.updateCartBadge = updateCartBadge;

window.addEventListener("storage", (ev) => {
  if (ev.key === CART_KEY || ev.key === null) {
    try {
      renderCart();
    } catch {}
    try {
      updateCartBadge();
    } catch {}
  }
});

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
  try {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const cart = loadCart();
    const count = cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    el.textContent = count;
    if (count === 0) el.style.display = "none";
    else el.style.display = "inline-block";
  } catch (e) {
    console.error("updateCartBadge error", e);
  }
}

function renderCart() {
  const cart = loadCart();
  const container = document.getElementById("cart-container");
  const footer = document.getElementById("cart-footer");

  if (!container) {
    console.warn("cart-container no encontrado");
    return;
  }

  if (!footer) {
    console.warn("cart-footer no encontrado");
  }

  if (!cart || cart.length === 0) {
    container.innerHTML = "<p>El carrito está vacío.</p>";
    if (footer) footer.innerHTML = "";
    updateCartBadge();
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="card mb-3" data-id="${item.id}">
      <div class="row g-0 align-items-center">
        <div class="col-3">
          <img src="${item.image}" class="img-fluid" alt="${escapeHtml(
        item.title
      )}" style="max-height:120px; object-fit:cover;">
        </div>
        <div class="col-6">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(item.title)}</h5>
            <p class="card-text">${formatCLPManual(item.price)}</p>
          </div>
        </div>
        <div class="col-3 text-end pe-4">
          <input type="number" data-id="${
            item.id
          }" class="cart-qty form-control mb-2" value="${item.qty}" min="1" />
          <button data-id="${
            item.id
          }" class="btn btn-sm btn-outline-danger remove-item">Eliminar</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".cart-qty").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      let qty = Math.max(1, Number(e.target.value) || 1);

      e.target.value = qty;

      const cartNow = loadCart();
      const it = cartNow.find((x) => x.id === id);
      if (it) {
        it.qty = qty;
        saveCart(cartNow);

        updateCartBadge();
        renderCart();
      }
    });

    input.addEventListener("input", (e) => {
      if (e.target.value === "") return;
      const v = Number(e.target.value);
      if (v < 1) e.target.value = 1;
    });
  });

  container.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      let cartNow = loadCart();
      cartNow = cartNow.filter((x) => x.id !== id);
      saveCart(cartNow);
      updateCartBadge();
      renderCart();
    });
  });

  const total = cart.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
    0
  );
  if (footer) {
    footer.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <strong>Total: ${formatCLPManual(total)}</strong>
        <button id="checkout" class="btn btn-success">Pagar</button>
      </div>
    `;
    const checkoutBtn = document.getElementById("checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        alert("Simulación de pago — Gracias por tu compra 😊");
        localStorage.removeItem(CART_KEY);
        renderCart();
        updateCartBadge();
      });
    }
  }

  updateCartBadge();
  console.log("Carrito renderizado. Items:", cart.length, "Total:", total);
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
