document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  if (error) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.classList.add('error-message');
      document.querySelector('.review-form').after(errorDiv);
    }
    errorDiv.textContent = decodeURIComponent(error);
  }
});
