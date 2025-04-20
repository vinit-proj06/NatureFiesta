document.addEventListener('DOMContentLoaded', () => {
  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  const qtyInput = document.getElementById('qty');

  const decreaseClone = decreaseBtn.cloneNode(true);
  const increaseClone = increaseBtn.cloneNode(true);
  decreaseBtn.parentNode.replaceChild(decreaseClone, decreaseBtn);
  increaseBtn.parentNode.replaceChild(increaseClone, increaseBtn);

  decreaseClone.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
    }
  });

  increaseClone.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value);
    qtyInput.value = currentQty + 1;
  });

  const sizeButtons = document.querySelectorAll('.size-btn');
  sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      sizeButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  const smallImages = document.querySelectorAll('.small-image');
  smallImages.forEach((img) => {
    img.addEventListener('click', () => {
      const imageSrc = img.getAttribute('data-src');
      const mainImage = document.querySelector('.main-image');
      const smallImageBoxes = document.querySelectorAll('.small-image-box');

      if (!mainImage) {
        console.error('Main image not found');
        return;
      }

      mainImage.src = imageSrc;

      smallImageBoxes.forEach((box) => box.classList.remove('active'));
      img.parentElement.classList.add('active');
    });
  });
});
