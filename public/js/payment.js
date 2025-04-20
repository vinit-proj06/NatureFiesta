document.addEventListener('DOMContentLoaded', () => {
  // Buy Now Handler
  document.querySelectorAll('.buy-now-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = form.dataset.productId;
      const formData = new FormData(form);
      const quantity = document.getElementById('qty').value;

      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Processing...';

      try {
        // Fetch user address from input
        const userAddress =
          document.getElementById('user-address')?.value || '';

        const response = await fetch('/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            amount: formData.get('amount'),
            productName: formData.get('productName'),
            description: formData.get('description'),
            quantity: quantity,
            address: userAddress,
          }),
          credentials: 'include',
        });

        // Check if response is OK
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create order');
        }

        const orderData = await response.json();
        console.log('Order data:', orderData); // Debug: Log response

        // Validate order data
        if (!orderData.key_id || !orderData.order_id || !orderData.amount) {
          throw new Error('Invalid order data received');
        }

        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: 'INR',
          name: orderData.product_name || 'Nature Fiesta Purchase',
          description: orderData.description || 'Product Purchase',
          order_id: orderData.order_id,
          handler: async function (response) {
            try {
              await verifyPayment({ ...response, address: userAddress });
              window.location.href = `/orders/${orderData.order_id}`;
            } catch (error) {
              console.error('Payment verification error:', error);
              alert(
                'Payment successful but verification failed. Please contact support with order ID: ' +
                  orderData.order_id
              );
            }
          },
          prefill: {
            name: orderData.user?.name || 'Customer',
            email: orderData.user?.email || 'customer@example.com',
            contact: orderData.user?.phone || '9999999999',
          },
          theme: {
            color: '#3399cc',
          },
          modal: {
            ondismiss: function () {
              // Reset button when modal is closed
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            },
          },
        };

        const rzp = new Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response);
          alert(
            'Payment failed. Please try again. Error: ' +
              (response.error.description || 'Unknown error')
          );
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        });
      } catch (error) {
        console.error('Payment error:', error);
        alert('Error: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  });

  async function verifyPayment(paymentResponse) {
    try {
      const response = await fetch('/orders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentResponse),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }
});
