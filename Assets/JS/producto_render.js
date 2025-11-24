console.log("producto_render.js cargado");

const CART_KEY = "crochet_cart_v1";

document.addEventListener("DOMContentLoaded", () => {
  renderProductDetail();
  updateCartBadge();
  if (typeof updateCartCountFromStorage === "function")
    updateCartCountFromStorage();
});

function formatCLPManual(value) {
  const n = Math.round(Number(value) || 0);
  return "CLP $" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function formatCLP(value) {
  return formatCLPManual(value);
}

function renderProductDetail() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const p =
    typeof products !== "undefined" ? products.find((x) => x.id === id) : null;
  const target = document.getElementById("product-detail");
  if (!target) return;

  if (!p) {
    target.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  p.price = Number(p.price) || 0;

  target.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="${
          p.image
        }" class="img-fluid rounded" style="max-height: 400px; object-fit: contain;" alt="${escapeHtml(
    p.title
  )}">
      </div>
      <div class="col-md-6">
        <h2>${escapeHtml(p.title)}</h2>
        <p id="product-price" class="text-primary fw-bold">${formatCLP(
          p.price
        )}</p>
        <p>${escapeHtml(p.description)}</p>

        <div class="d-flex align-items-center gap-2">
          <input id="qty" type="number" min="1" value="1" class="form-control w-25" />
          <button id="addBtn" class="btn btn-primary">Añadir al carrito</button>
        </div>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const qty = Math.max(
        1,
        Number(document.getElementById("qty").value) || 1
      );

      if (typeof addToCart === "function") {
        try {
          addToCart(p.id, qty);
        } catch (e) {
          console.warn("addToCart existía pero falló, usando fallback", e);
          fallbackAddToCart(p, qty);
        }
      } else {
        fallbackAddToCart(p, qty);
      }

      updateCartBadge();
    });
  }
}

function fallbackAddToCart(product, qty = 1) {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    const found = cart.find((i) => i.id === product.id);
    if (found) found.qty = Number(found.qty || 0) + qty;
    else
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty,
      });
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    const t = document.createElement("div");
    t.className =
      "position-fixed bottom-0 end-0 m-3 p-2 bg-success text-white rounded shadow";
    t.style.zIndex = 9999;
    t.textContent = `${product.title} añadido al carrito`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1400);
  } catch (err) {
    console.error("Error en fallbackAddToCart:", err);
  }
}

function updateCartBadge() {
  try {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const raw = localStorage.getItem(CART_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    const count = cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    el.textContent = count;
  } catch (e) {
    console.error("updateCartBadge error:", e);
  }
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
