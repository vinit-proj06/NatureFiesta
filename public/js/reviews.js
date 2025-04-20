document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('No JWT token found');
    alert('Please log in');
    window.location.href = '/login';
    return;
  }

  document.querySelectorAll('.review-action-delete').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const reviewId = e.target.dataset.reviewId;
      if (!reviewId) {
        alert('Error: Review ID not found');
        return;
      }

      if (!confirm('Are you sure you want to delete this review?')) {
        return;
      }

      try {
        const response = await fetch(`/api/review/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete review');
        }

        alert('Review deleted successfully');
        window.location.reload();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error: ' + error.message);
      }
    });
  });
});
