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
  const p = products.find((x) => x.id === productId);
  if (!p) {
    alert("Producto no encontrado");
    return;
  }

  const found = cart.find((i) => i.id === productId);
  if (found) found.qty += qty;
  else
    cart.push({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      qty,
    });

  saveCart(cart);
  updateCartCountFromStorage();
  toastAdded(p.title);
}

function updateCartCountFromStorage() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = loadCart();
  const count = cart.reduce((s, it) => s + it.qty, 0);
  el.textContent = count;
}

function toastAdded(title) {
  const t = document.createElement("div");
  t.className =
    "position-fixed bottom-0 end-0 m-3 p-2 bg-success text-white rounded shadow";
  t.style.zIndex = 9999;
  t.textContent = `${title} añadido al carrito`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}
