import { getData } from "./api.js";

(function () {
  const userBtn = document.getElementById("userBtn");
  const userDropdown = document.getElementById("userDropdown");

  function openDropdown() {
    userDropdown.setAttribute("aria-hidden", "false");
    userBtn.setAttribute("aria-expanded", "true");
  }
  function closeDropdown() {
    userDropdown.setAttribute("aria-hidden", "true");
    userBtn.setAttribute("aria-expanded", "false");
  }

  userBtn.addEventListener("click", (e) => {
    const open = userDropdown.getAttribute("aria-hidden") === "false";
    if (open) closeDropdown();
    else openDropdown();
    e.stopPropagation();
  });

  // cerrar al clicar fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#userDropdown") && !e.target.closest("#userBtn")) {
      closeDropdown();
    }
  });

  // cerrar con Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });
})();
(function () {
  const loginModal = document.getElementById("loginModal");
  if (!loginModal) return;
  const loginOpenButtons = document.querySelectorAll(
    ".user-action.btn-primary, .open-login, .login-link"
  );
  const modalOverlay = loginModal.querySelector(".modal-overlay");
  const modalClose = loginModal.querySelector(".modal-close");

  function openLogin() {
    loginModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // evitar scroll detrás
  }
  function closeLogin() {
    loginModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  loginOpenButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openLogin();
      e.stopPropagation();
    });
  });


  
  if (modalClose) modalClose.addEventListener("click", closeLogin);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLogin();
  });
})();
(function () {
  const btn = document.getElementById("whatsappBtn");
  if (!btn) return;

  let isDragging = false;
  let startX = 0,
    startY = 0;
  let origX = 0,
    origY = 0;
  let moved = false;
  const clickThreshold = 6; // px para distinguir click vs arrastre

  function getClient(e) {
    return e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  }

  function startDrag(e) {
    // iniciar arrastre
    e.preventDefault();
    const p = getClient(e);
    startX = p.x;
    startY = p.y;
    const rect = btn.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    moved = false;
    isDragging = true;
    btn.classList.add("grabbing");
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const p = getClient(e);
    const dx = p.x - startX;
    const dy = p.y - startY;
    if (Math.abs(dx) > clickThreshold || Math.abs(dy) > clickThreshold)
      moved = true;
    let newLeft = origX + dx;
    let newTop = origY + dy;

    // limitar dentro del viewport
    const btnW = btn.offsetWidth,
      btnH = btn.offsetHeight;
    const vw = window.innerWidth,
      vh = window.innerHeight;
    newLeft = Math.max(8, Math.min(newLeft, vw - btnW - 8));
    newTop = Math.max(8, Math.min(newTop, vh - btnH - 8));

    btn.style.left = newLeft + "px";
    btn.style.top = newTop + "px";
    btn.style.right = "auto";
    btn.style.bottom = "auto";
    btn.style.position = "fixed";
  }

  function endDrag() {
    isDragging = false;
    btn.classList.remove("grabbing");
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchend", endDrag);
    // no abrir WhatsApp aquí para evitar duplicados; el click manejará la apertura cuando moved === false
  }

  // click: si no hubo arrastre significativo, abrir chat
  btn.addEventListener("click", (e) => {
    if (moved) return; // fue un arrastre -> no abrir
    const phone = "573103006010"; // <- cambia a tu número (countrycode + número, sin +)
    const text = encodeURIComponent("Hola, quiero más información");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  });

  // iniciar arrastre en mouse/touch
  btn.addEventListener("mousedown", startDrag);
  btn.addEventListener("touchstart", startDrag, { passive: false });

  // doble clic para resetear posición en esquina inferior derecha
  btn.addEventListener("dblclick", () => {
    btn.style.left = "auto";
    btn.style.top = "auto";
    btn.style.right = "18px";
    btn.style.bottom = "18px";
    btn.style.position = "fixed";
  });

  // mantener botón dentro si cambian dimensiones de ventana
  window.addEventListener("resize", () => {
    const rect = btn.getBoundingClientRect();
    const vw = window.innerWidth,
      vh = window.innerHeight;
    const btnW = btn.offsetWidth,
      btnH = btn.offsetHeight;
    let left = rect.left,
      top = rect.top;
    if (left + btnW > vw - 8) left = vw - btnW - 8;
    if (top + btnH > vh - 8) top = vh - btnH - 8;
    left = Math.max(8, left);
    top = Math.max(8, top);
    btn.style.left = left + "px";
    btn.style.top = top + "px";
    btn.style.right = "auto";
    btn.style.bottom = "auto";
    btn.style.position = "fixed";
  });
})();
(function () {
  const cartBtn = document.getElementById("cartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  if (!cartBtn || !cartDrawer) return;

  const cartOverlay = cartDrawer.querySelector(".cart-overlay");
  const cartClose = cartDrawer.querySelector(".cart-close");
  const cartPanel = cartDrawer.querySelector(".cart-panel");
  const cartEmpty = cartDrawer.querySelector(".cart-empty");
  const cartItems = cartDrawer.querySelector(".cart-items");

  function openCart() {
    cartDrawer.setAttribute("aria-hidden", "false");
    cartPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // actualizar vista: si no hay items, mostrar mensaje vacío
    const hasItems = cartItems && cartItems.children.length > 0;
    if (!hasItems) {
      cartEmpty.hidden = false;
      cartItems.hidden = true;
    } else {
      cartEmpty.hidden = true;
      cartItems.hidden = false;
    }
  }
  function closeCart() {
    cartDrawer.setAttribute("aria-hidden", "true");
    cartPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  cartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const open = cartDrawer.getAttribute("aria-hidden") === "false";
    if (open) closeCart();
    else openCart();
  });

  // click en overlay o en botón cerrar
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);

  // cerrar con Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (cartDrawer.getAttribute("aria-hidden") === "false") closeCart();
    }
  });

  // evitar que clics dentro del panel cierren por burbujeo al overlay
  cartPanel.addEventListener("click", (e) => e.stopPropagation());
})();
document.addEventListener("DOMContentLoaded", async function () {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartItemsList = cartDrawer
    ? cartDrawer.querySelector(".cart-items")
    : null;
  const cartEmpty = cartDrawer ? cartDrawer.querySelector(".cart-empty") : null;
  const cartSubtotalEl = cartDrawer
    ? cartDrawer.querySelector(".cart-subtotal")
    : null;

  function parsePrice(text) {
    if (!text) return 0;
    // elimina símbolos y convierte "52.000" o "52,000.50" a número
    const cleaned = text.replace(/[^\d.,]/g, "");
    // si tiene coma y punto, asumimos formato "1.234,56" (reemplazar punto, coma->.)
    if (cleaned.indexOf(".") !== -1 && cleaned.indexOf(",") !== -1) {
      return Number(cleaned.replace(/\./g, "").replace(",", "."));
    }
    // si solo tiene puntos como separador de miles
    if (cleaned.indexOf(",") === -1 && cleaned.indexOf(".") !== -1) {
      return Number(cleaned.replace(/\./g, ""));
    }
    // reemplaza coma por punto para decimales
    return Number(cleaned.replace(",", ".")) || 0;
  }

  function formatCOP(value) {
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(value);
    } catch (e) {
      return "$" + Math.round(value);
    }
  }

  function updateSubtotal() {
    if (!cartItemsList || !cartSubtotalEl) return;
    let total = 0;
    cartItemsList.querySelectorAll(".cart-item").forEach((li) => {
      const price = Number(li.getAttribute("data-price")) || 0;
      const qty = Number(li.getAttribute("data-qty")) || 1;
      total += price * qty;
    });
    cartSubtotalEl.textContent = formatCOP(total);
    // mostrar/ocultar mensaje vacío
    const hasItems = cartItemsList.children.length > 0;
    if (cartEmpty) cartEmpty.hidden = hasItems;
    if (cartItemsList) cartItemsList.hidden = !hasItems;
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.setAttribute("aria-hidden", "false");
    const panel = cartDrawer.querySelector(".cart-panel");
    if (panel) panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateSubtotal();
  }

  function addToCart(product) {
    if (!cartItemsList) return;
    // si ya existe el mismo producto (por nombre), incrementar qty
    const existing = Array.from(
      cartItemsList.querySelectorAll(".cart-item")
    ).find((li) => li.getAttribute("data-id") === product.id);
    if (existing) {
      const newQty = Number(existing.getAttribute("data-qty")) + 1;
      existing.setAttribute("data-qty", newQty);
      existing.querySelector(".cart-qty").textContent = newQty;
    } else {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.setAttribute("data-id", product.id);
      li.setAttribute("data-price", product.price);
      li.setAttribute("data-qty", 1);
      li.style.display = "flex";
      li.style.gap = "10px";
      li.style.alignItems = "center";
      li.style.padding = "10px 0";
      li.innerHTML = `
        <img src="${product.image || ""}" alt="${
        product.name
      }" style="width:56px;height:56px;object-fit:cover;border-radius:6px;">
        <div style="flex:1;">
          <div style="font-weight:700">${product.name}</div>
          <div style="color:#7a7a7a;font-size:0.95rem">${formatCOP(
            product.price
          )}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <div>
            <button class="cart-decr" aria-label="disminuir" style="margin-right:6px">-</button>
            <span class="cart-qty">1</span>
            <button class="cart-incr" aria-label="aumentar" style="margin-left:6px">+</button>
          </div>
          <button class="cart-remove" aria-label="Eliminar" style="background:transparent;border:none;color:#c44;cursor:pointer">Eliminar</button>
        </div>
      `;
      cartItemsList.appendChild(li);

      // listeners de botones en el item
      li.querySelector(".cart-remove").addEventListener("click", () => {
        li.remove();
        updateSubtotal();
      });
      li.querySelector(".cart-incr").addEventListener("click", () => {
        const q = Number(li.getAttribute("data-qty")) + 1;
        li.setAttribute("data-qty", q);
        li.querySelector(".cart-qty").textContent = q;
        updateSubtotal();
      });
      li.querySelector(".cart-decr").addEventListener("click", () => {
        let q = Number(li.getAttribute("data-qty")) - 1;
        if (q <= 0) {
          li.remove();
        } else {
          li.setAttribute("data-qty", q);
          li.querySelector(".cart-qty").textContent = q;
        }
        updateSubtotal();
      });
    }
    updateSubtotal();
    openCart();
  }
  await getData();
  // attach listeners to "add-cart" buttons
  document.querySelectorAll(".add-cart").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      console.log("entre");
      e.preventDefault();
      const card = btn.closest(".product-card");
      if (!card) return;
      const name = (
        card.querySelector(".product-name")?.textContent || "Producto"
      ).trim();
      const priceText =
        card.querySelector(".price")?.textContent ||
        card.querySelector(".old-price")?.textContent ||
        "0";
      const price = parsePrice(priceText);
      const img = card.querySelector("img")
        ? card.querySelector("img").src
        : "";
      // id único por nombre+precio (puedes usar data-id en producto para mejor resultado)
      const id = (card.getAttribute("data-id") || name + "|" + price)
        .replace(/\s+/g, "-")
        .toLowerCase();
      addToCart({ id, name, price, image: img });
    });
  });

  // inicializar estado vacío si corresponde
  updateSubtotal();
});
document.addEventListener("DOMContentLoaded", function () {
  const checkoutWa = document.getElementById("checkoutWa");
  const subtotalEl = document.querySelector(".cart-subtotal");
  const cartItemsList = document.querySelector(".cart-items");

  if (!checkoutWa) return;

  function buildMessage() {
    const subtotalText = subtotalEl?.textContent?.trim() || "";
    const items = [];
    if (cartItemsList) {
      cartItemsList.querySelectorAll(".cart-item").forEach((li) => {
        const name = (
          li.querySelector("div > div:first-child")?.textContent ||
          li.querySelector(".product-name")?.textContent ||
          li.getAttribute("data-id") ||
          "Producto"
        ).trim();
        const qty =
          li.getAttribute("data-qty") ||
          li.querySelector(".cart-qty")?.textContent ||
          "1";
        items.push(`${name} x${qty}`);
      });
    }
    const itemsText = items.length ? ` Productos: ${items.join(", ")}.` : "";
    return `Hola, quiero finalizar mi compra.${
      subtotalText ? " Subtotal: " + subtotalText + "." : ""
    }${itemsText}`;
  }

  function updateHref() {
    const msg = encodeURIComponent(buildMessage());
    // cambia el número si necesitas otro asesor
    checkoutWa.href = `https://wa.me/573103006010?text=${msg}`;
  }

  // actualizar inicialmente y cuando cambie carrito/subtotal
  updateHref();
  if (subtotalEl) {
    new MutationObserver(updateHref).observe(subtotalEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }
  if (cartItemsList) {
    new MutationObserver(updateHref).observe(cartItemsList, {
      childList: true,
      subtree: true,
    });
  }

  // forzar actualización justo antes de abrir (por si acaso)
  checkoutWa.addEventListener("click", () => updateHref());
});
document.addEventListener("DOMContentLoaded", function () {
  const dropdownBtns = document.querySelectorAll(".nav-dropdown-btn");

  dropdownBtns.forEach((btn) => {
    const menu = btn.nextElementSibling;
    if (!menu) return;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // cerrar otros dropdowns abiertos
      dropdownBtns.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          const otherMenu = otherBtn.nextElementSibling;
          if (otherMenu) otherMenu.setAttribute("aria-hidden", "true");
        }
      });

      // toggle actual
      btn.setAttribute("aria-expanded", String(!isOpen));
      menu.setAttribute("aria-hidden", String(isOpen));
    });
  });

  // cerrar dropdown al clicar fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-dropdown")) {
      dropdownBtns.forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        const menu = btn.nextElementSibling;
        if (menu) menu.setAttribute("aria-hidden", "true");
      });
    }
  });
});
(function () {
  const registerBtn = document.getElementById("registerBtn");
  const registerModal = document.getElementById("registerModal");
  const registerForm = document.getElementById("registerForm");

  if (!registerBtn || !registerModal) return;

  function openRegister() {
    registerModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeRegister() {
    registerModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  registerBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openRegister();
  });

  const overlay = registerModal.querySelector(".modal-overlay");
  const closeBtn = registerModal.querySelector(".modal-close");

  if (overlay) overlay.addEventListener("click", closeRegister);
  if (closeBtn) closeBtn.addEventListener("click", closeRegister);

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      registerModal.getAttribute("aria-hidden") === "false"
    )
      closeRegister();
  });

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(registerForm));
      console.log("Registro enviado:", data);
      // Aquí puedes hacer fetch() al servidor si lo deseas, por ahora solo confirmación:
      alert("Gracias por registrarte. Pronto te contactaremos.");
      registerForm.reset();
      closeRegister();
    });
  }
})();
