export async function getData() {
  try {
    const response = await fetch("http://localhost:3000/api/productos");
    const data = await response.json();
    console.log(data);
    renderProducts(data);
  } catch (error) {
    console.error(error);
  }
}

function renderProducts(products) {
  const container = document.getElementById("products-list-principal");
  container.innerHTML = "";

  products.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    ${
      product.descuento
        ? `<span class="discount">-${product.descuento}%</span>`
        : ""
    }

    <img src="http://localhost:3000${product.imagen}" alt="${product.nombre}" />

    <div class="stars">
      ${renderStars(product.calificacion)}
    </div>

    <span class="product-name">${product.nombre}</span>

    <div class="prices">
      <span class="price">$${formatPrice(
        calculateDiscountPrice(product.precio, product.descuento)
      )}</span>
      ${
        product.descuento
          ? `<span class="old-price">$${formatPrice(product.precio)}</span>`
          : ""
      }
    </div>
    <br />
    <button class="add-cart" data-id="${product.id}">
      <i class="fa-solid fa-basket-shopping"></i>
    </button>
  `;

  return card;
}

function renderStars(rating) {
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    stars += `
      <i class="fa-${i <= rating ? "solid" : "regular"} fa-star"></i>
    `;
  }

  return stars;
}

function formatPrice(value) {
  return value.toLocaleString("es-CO");
}

function calculateDiscountPrice(price, discount) {
  if (!discount || discount <= 0) return price;

  return Math.round(price - (price * discount) / 100);
}

getData();
