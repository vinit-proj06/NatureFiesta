document.addEventListener('DOMContentLoaded', () => {
  // Common initialization
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('No JWT token found');
    alert('Please log in as admin');
    window.location.href = '/login';
    return;
  }

  // Style status and role badges
  document.querySelectorAll('.status-badge').forEach((badge) => {
    const status = badge.textContent.toLowerCase();
    badge.classList.add(`status-${status}`);
  });

  document.querySelectorAll('.role-badge').forEach((badge) => {
    const role = badge.textContent.toLowerCase();
    badge.classList.add(`role-${role}`);
  });

  // Manage Billings
  function initManageBillings() {
    const billingSection = document.querySelector('#admin-billings');
    if (!billingSection) return;

    // Filter
    const filterBillings = () => {
      const date = document.querySelector('.date-filter')?.value;
      const status = document.querySelector('.status-filter')?.value;
      const url = new URL('/manageBillings', window.location.origin);
      if (date) url.searchParams.set('date', date);
      if (status && status !== 'All Payments')
        url.searchParams.set('status', status);
      window.location.href = url.toString();
    };

    document
      .querySelector('.date-filter')
      ?.addEventListener('change', filterBillings);
    document
      .querySelector('.status-filter')
      ?.addEventListener('change', filterBillings);

    // Refund (Send Notification)
    document.querySelectorAll('.refund-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const orderId = button.dataset.orderId;
        if (!confirm('Send refund notification for this order?')) return;

        try {
          const response = await fetch(`/manageBillings/${orderId}/refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || 'Failed to send notification');
          alert('Refund notification sent successfully');
          window.location.reload();
        } catch (err) {
          console.error('Notification error:', err);
          alert('Error: ' + err.message);
        }
      });
    });
  }

  // Manage Orders
  function initManageOrders() {
    const orderSection = document.querySelector('#admin-orders');
    if (!orderSection) return;

    // Filter
    const filterOrders = () => {
      const search = document.querySelector('.search-input')?.value;
      const status = document.querySelector('.filter-select')?.value;
      const url = new URL('/manageOrder', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (status && status !== 'All Statuses')
        url.searchParams.set('status', status);
      window.location.href = url.toString();
    };

    document
      .querySelector('.search-input')
      ?.addEventListener('input', filterOrders);
    document
      .querySelector('.filter-select')
      ?.addEventListener('change', filterOrders);

    // Update Status
    document.querySelectorAll('.status-select').forEach((select) => {
      select.addEventListener('change', async () => {
        const orderId = select.dataset.orderId;
        const status = select.value;
        if (!confirm(`Change order status to ${status}?`)) return;

        try {
          const response = await fetch(`/manageOrder/${orderId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          });

          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || 'Failed to update status');
          alert('Order status updated successfully');
          window.location.reload();
        } catch (err) {
          console.error('Status update error:', err);
          alert('Error: ' + err.message);
        }
      });
    });

    // Delete
    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const orderId = button.dataset.orderId;
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
          const response = await fetch(`/manageOrder/${orderId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || 'Failed to delete order');
          alert('Order deleted successfully');
          window.location.reload();
        } catch (err) {
          console.error('Delete error:', err);
          alert('Error: ' + err.message);
        }
      });
    });
  }

  // Manage Reviews
  function initManageReviews() {
    const reviewSection = document.querySelector('#admin-reviews');
    if (!reviewSection) return;

    // Filter
    const filterReviews = () => {
      const status = document.querySelector('.filter-select')?.value;
      const url = new URL('/manageReviews', window.location.origin);
      if (status && status !== 'All Reviews')
        url.searchParams.set('status', status);
      window.location.href = url.toString();
    };

    document
      .querySelector('.filter-select')
      ?.addEventListener('change', filterReviews);

    // Update Status
    const updateReviewStatus = async (reviewId, status) => {
      if (!confirm(`Set review status to ${status}?`)) return;

      try {
        const response = await fetch(`/manageReviews/${reviewId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'Failed to update status');
        alert('Review status updated successfully');
        window.location.reload();
      } catch (err) {
        console.error('Review status error:', err);
        alert('Error: ' + err.message);
      }
    };

    document.querySelectorAll('.approve-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const reviewId = button.dataset.reviewId;
        updateReviewStatus(reviewId, 'approved');
      });
    });

    document.querySelectorAll('.flag-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const reviewId = button.dataset.reviewId;
        updateReviewStatus(reviewId, 'flagged');
      });
    });

    // Delete
    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const reviewId = button.dataset.reviewId;
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
          const response = await fetch(`/manageReviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || 'Failed to delete review');
          alert('Review deleted successfully');
          window.location.reload();
        } catch (err) {
          console.error('Delete error:', err);
          alert('Error: ' + err.message);
        }
      });
    });
  }

  // Manage Users
  function initManageUsers() {
    const userSection = document.querySelector('#admin-users');
    if (!userSection) return;

    // Filter
    const filterUsers = () => {
      const search = document.querySelector('.search-input')?.value;
      const role = document.querySelector('.role-filter')?.value;
      const url = new URL('/manageUsers', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (role && role !== 'All Roles') url.searchParams.set('role', role);
      window.location.href = url.toString();
    };

    document
      .querySelector('.search-input')
      ?.addEventListener('input', filterUsers);
    document
      .querySelector('.role-filter')
      ?.addEventListener('change', filterUsers);

    // Update User
    const updateUser = async (select) => {
      const userId = select.dataset.userId;
      const role = document.querySelector(
        `select.role-select[data-user-id="${userId}"]`
      )?.value;
      const active =
        document.querySelector(`select.status-select[data-user-id="${userId}"]`)
          ?.value === 'true';
      if (
        !confirm(
          `Update user to role: ${role}, status: ${active ? 'Active' : 'Inactive'}?`
        )
      )
        return;

      try {
        const response = await fetch(`/manageUsers/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role, active }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'Failed to update user');
        alert('User updated successfully');
        window.location.reload();
      } catch (err) {
        console.error('User update error:', err);
        alert('Error: ' + err.message);
      }
    };

    document
      .querySelectorAll('.role-select, .status-select')
      .forEach((select) => {
        select.addEventListener('change', () => updateUser(select));
      });

    // Delete
    document.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const userId = button.dataset.userId;
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
          const response = await fetch(`/manageUsers/${userId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (!response.ok)
            throw new Error(data.message || 'Failed to delete user');
          alert('User deleted successfully');
          window.location.reload();
        } catch (err) {
          console.error('Delete error:', err);
          alert('Error: ' + err.message);
        }
      });
    });
  }

  // Initialize all admin panels
  initManageBillings();
  initManageOrders();
  initManageReviews();
  initManageUsers();
});
