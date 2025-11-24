document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartCountFromStorage();

  if (typeof window.updateCartBadge === "function") window.updateCartBadge();
});


function formatPriceCLP(value) {
  const n = Number(value) || 0;
  return "CLP $" + n.toLocaleString("es-CL", { maximumFractionDigits: 0 });
}

function renderProducts() {
  const container = document.getElementById("products-container");
  if (!container) return;
  container.innerHTML = "";

  if (typeof products === "undefined" || !Array.isArray(products)) return;

  products.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="product-img-box">
          <img src="${
            p.image
          }" class="card-img-top product-img" alt="${escapeHtml(
      p.title
    )}" loading="lazy">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(p.title)}</h5>
          <p class="card-text text-muted mb-2">${formatPriceCLP(p.price)}</p>
          <p class="card-text small text-truncate">${escapeHtml(
            p.description
          )}</p>
          <div class="mt-auto d-flex gap-2">
            <a href="Producto.html?id=${encodeURIComponent(
              p.id
            )}" class="btn btn-outline-primary btn-sm">Ver</a>
            <button class="btn btn-primary btn-sm add-to-cart" data-id="${
              p.id
            }">Añadir</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);

    const img = col.querySelector("img.product-img");
    if (img) {
      if (img.complete && img.naturalWidth) {
        adjustImageFit(img);
      } else {
        img.addEventListener("load", () => adjustImageFit(img));
        img.addEventListener("error", () => {
          img.src = "Assets/img/placeholder.png";
          img.style.objectFit = "contain";
        });
      }
    }
  });

  
  container.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id, 1);
    });
  });
}


function adjustImageFit(imgEl) {
  try {
    const w = imgEl.naturalWidth || 1;
    const h = imgEl.naturalHeight || 1;
    const ratio = w / h;

    if (ratio < 0.85) {
      imgEl.style.objectFit = "contain";
      imgEl.style.backgroundColor = "transparent";
      imgEl.style.padding = "0";
      imgEl.style.maxHeight = "100%";
      imgEl.style.maxWidth = "100%";
    } else {
      imgEl.style.objectFit = "cover";
      imgEl.style.backgroundColor = "transparent";
      imgEl.style.padding = "0";
    }
  } catch (e) {
    imgEl.style.objectFit = "cover";
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


const CART_KEY = "crochet_cart_v1";

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

function addToCart(productId, qty = 1) {
  const cart = loadCart();
  const p =
    typeof products !== "undefined"
      ? products.find((x) => x.id === productId)
      : null;
  if (!p) {
    alert("Producto no encontrado");
    return;
  }

  qty = Number(qty) || 1;

  const found = cart.find((i) => i.id === productId);
  if (found) found.qty = Number(found.qty || 0) + qty;
  else
    cart.push({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      qty,
    });

  saveCart(cart);

  
  if (typeof window.updateCartBadge === "function") window.updateCartBadge();
  
  updateCartCountFromStorage();

  toastAdded(p.title);
}

function updateCartCountFromStorage() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = loadCart();
  const count = cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  el.textContent = count;
  el.style.display = count > 0 ? "inline-block" : "none";
}

function toastAdded(title) {
  const t = document.createElement("div");
  t.className =
    "position-fixed bottom-0 end-0 m-3 p-2 bg-success text-white rounded shadow toast-notice";
  t.style.zIndex = 9999;
  t.textContent = `${title} añadido al carrito`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}
