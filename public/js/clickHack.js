export function setupEventListeners() {
  document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.querySelectorAll(
      '.main-content-product-card'
    );
    const categoryCards = document.querySelectorAll(
      '.main-content-categories-card'
    );
    const addCart = document.querySelectorAll(
      '.main-content-product-card_addcart'
    );

    const cart = document.querySelector('.main-bar-cart');

    productCards.forEach((card) => {
      card.addEventListener('click', function (e) {
        if (
          e.target.tagName.toLowerCase() !== 'button' &&
          !e.target.closest('button')
        ) {
          const productId = this.getAttribute('data-id');
          window.location.href = `/product/${productId}`;
        }
      });
    });

    categoryCards.forEach((card) => {
      card.addEventListener('click', function () {
        const categoryId = this.getAttribute('data-id');
        window.location.href = `/categories/${categoryId}`;
      });
    });

    addCart.forEach((add) => {
      add.addEventListener('click', function () {
        const productDetails = this.getAttribute('data-slug');
        const [slug, price, name, image, quantity] = JSON.parse(productDetails);

        const newItem = {
          slug,
          price,
          name,
          image,
          quantity: parseInt(quantity, 10),
        };

        // Step 1: Get existing cart (or create a new one)
        const cart = JSON.parse(localStorage.getItem('cartData')) || [];

        // Step 2: Check if item already exists (by slug)
        const existingIndex = cart.findIndex(
          (item) => item.slug === newItem.slug
        );

        if (existingIndex !== -1) {
          // Step 3a: If item exists, increase quantity
          cart[existingIndex].quantity += newItem.quantity;
        } else {
          // Step 3b: If item doesn't exist, add it
          cart.push(newItem);
        }

        // Step 4: Save back to localStorage
        localStorage.setItem('cartData', JSON.stringify(cart));
      });
    });

    cart.addEventListener('click', function () {
      window.location.href = '/cart';
    });

    cart.addEventListener('mouseenter', function () {
      this.style.cursor = 'pointer'; // Change cursor to pointer on hover
    });
  });
}
