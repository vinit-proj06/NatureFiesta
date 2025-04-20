document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.order-action-delete').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const orderId = e.target.dataset.orderId;
      const productId = e.target.dataset.productId;
      if (!orderId || !productId) {
        alert('Error: Order ID or Product ID not found');
        return;
      }

      if (!confirm('Are you sure you want to delete this order item?')) {
        return;
      }

      const token = localStorage.getItem('jwt');
      if (!token) {
        alert('Error: Please log in again');
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch(`/orders/${orderId}/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error:', data.message);
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
            return;
          }
          throw new Error(
            data.message ||
              `Failed to delete order item (Status: ${response.status})`
          );
        }

        alert(data.message || 'Order item deleted successfully');
        window.location.reload();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  });
});
