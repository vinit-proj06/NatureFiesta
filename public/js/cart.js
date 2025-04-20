/* eslint-disable */

let products = [];

function changeImage(element) {
  document.getElementById('main-product-image').src = element.src;

  const smallImages = document.querySelectorAll('.small-image-box');
  smallImages.forEach((img) => {
    img.classList.remove('active');
  });
  element.parentElement.classList.add('active');
}

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function fetchProductById(id) {
  try {
    const response = await fetch(`/api/product/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const product = await response.json();
    return product;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // First, fetch all products
  await fetchProducts();

  // Check if we're on the product detail page
  const qtyInput = document.getElementById('qty');
  const increaseBtn = document.getElementById('increase-qty');
  const decreaseBtn = document.getElementById('decrease-qty');

  if (qtyInput && increaseBtn && decreaseBtn) {
    increaseBtn.addEventListener('click', function () {
      let currentQty = parseInt(qtyInput.value);
      qtyInput.value = currentQty + 1;
    });

    decreaseBtn.addEventListener('click', function () {
      let currentQty = parseInt(qtyInput.value);
      if (currentQty > 1) {
        qtyInput.value = currentQty - 1;
      }
    });

    // Size button selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach((btn) => {
      btn.addEventListener('click', function () {
        sizeButtons.forEach((b) => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    // Add to cart button
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', function () {
        const productId = getProductIdFromURL();
        const quantity = parseInt(qtyInput.value);
        const size = document.querySelector('.size-btn.active').textContent;

        // Add to cart logic
        alert(
          `Added ${quantity} ${size} ${getProductById(productId).name} to cart!`
        );

        // Update cart count (for demo purposes)
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = parseInt(cartCount.textContent) + quantity;
        }
      });
    }

    // Load product details based on URL
    await loadProductDetails();

    // Load related products
    loadRelatedProducts();
  }
});

// Get product ID from URL
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return parseInt(urlParams.get('id')) || 1; // Default to 1 if no ID found
}

// Get product by ID
function getProductById(id) {
  return products.find((product) => product.id === id) || products[0];
}

// Load product details on the single product page
async function loadProductDetails() {
  const productId = getProductIdFromURL();
  let product;

  // Try to fetch the specific product by ID first
  const fetchedProduct = await fetchProductById(productId);
  if (fetchedProduct) {
    product = fetchedProduct;
  } else {
    // Fall back to the products array if API call fails
    product = getProductById(productId);
  }

  if (product) {
    // Update product name, price, description
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-price').textContent =
      `Rs. ${product.price}`;
    document.getElementById('product-description').textContent =
      product.description;

    // Update main image and thumbnails
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
      mainImage.src = product.images[0];
    }

    // Update small images
    const smallImages = document.querySelectorAll('.small-image');
    smallImages.forEach((img, index) => {
      if (product.images[index]) {
        img.src = product.images[index];
      }
    });

    // Update rating
    const ratingCount = document.querySelector('.rating-count');
    if (ratingCount) {
      ratingCount.textContent = `(${product.rating}/5)`;
    }
  }
}

// Load related products
function loadRelatedProducts() {
  const currentProductId = getProductIdFromURL();
  const relatedProductsContainer = document.querySelector(
    '.related-products .main-content-products'
  );

  if (relatedProductsContainer) {
    // Clear container
    relatedProductsContainer.innerHTML = '';

    // Filter products to exclude current product
    const relatedProducts = products.filter(
      (product) => product.id !== currentProductId
    );

    // Create product cards
    relatedProducts.forEach((product) => {
      const productCard = document.createElement('div');
      productCard.className = 'main-content-product-card';

      productCard.innerHTML = `
        <a href="sproduct.html?id=${product.id}">
          <img
            class="main-content-product-card_img"
            src="${product.images[0]}"
            alt="${product.name}"
          />
        </a>
        <p class="main-content-product-card_name">${product.name}</p>
        <p class="main-content-product-card_quantity">${product.quantity}</p>
        <div class="main-content-product-card_footer">
          <p class="main-content-product-card_price">${product.price} RS</p>
          <a href="#" class="main-content-product-card_addcart">
            <i class="fa-solid fa-plus"></i>
          </a>
        </div>
      `;

      relatedProductsContainer.appendChild(productCard);
    });
  }
}

// Get cart from localStorage or initialize
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add to cart when plus icon is clicked
document.addEventListener('click', function (e) {
  if (e.target.closest('.main-content-product-card_addcart')) {
    e.preventDefault();
    const productCard = e.target.closest('.main-content-product-card');
    const id = productCard.getAttribute('data-id');
    const name = productCard.querySelector(
      '.main-content-product-card_name'
    ).innerText;
    const price = parseFloat(
      productCard.querySelector('.main-content-product-card_price').innerText
    );
    const image = productCard.querySelector('img').getAttribute('src');

    // Check if product already in cart
    const existing = cart.find((p) => p.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${name} added to cart!`);
  }
});

// Render cart on cart page
function renderCart() {
  const tbody = document.getElementById('cart-body');
  const totalElement = document.getElementById('cart-total');
  if (!tbody) return; // Not on cart page

  tbody.innerHTML = '';
  let total = 0;

  cart.forEach((product, index) => {
    const subtotal = product.price * product.quantity;
    total += subtotal;

    tbody.innerHTML += `
        <tr data-id="${product.id}">
          <td><i class="far fa-times-circle remove-btn" data-id="${product.id}"></i></td>
          <td><img src="${product.image}" alt=""></td>
          <td>${product.name}</td>
          <td>Rs. ${product.price}</td>
          <td><input type="number" value="${product.quantity}" min="1" class="qty-input" data-id="${product.id}"></td>
          <td>Rs. ${subtotal}</td>
        </tr>
      `;
  });

  totalElement.innerText = `Rs. ${total}`;
}
renderCart();

// Remove product from cart
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-btn')) {
    const id = e.target.getAttribute('data-id');
    cart = cart.filter((p) => p.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  }
});

// Update quantity in cart
document.addEventListener('change', function (e) {
  if (e.target.classList.contains('qty-input')) {
    const id = e.target.getAttribute('data-id');
    const newQty = parseInt(e.target.value);
    const product = cart.find((p) => p.id === id);
    if (product && newQty > 0) {
      product.quantity = newQty;
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
  }
});
