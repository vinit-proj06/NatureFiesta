document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the login page - if so, skip token check
  if (window.location.pathname === '/login') return;

  const token = localStorage.getItem('jwt');

  // If no token and not on login page, redirect to login
  if (!token && window.location.pathname !== '/login') {
    console.log('No token found, redirecting to login');
    window.location.href = '/login';
    return;
  }

  // Profile Form Submission
  const profileForm = document.querySelector('#profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const photoInput = document.querySelector('#photo');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (photoInput.files[0]) {
        formData.append('photo', photoInput.files[0]);
      }

      try {
        const response = await fetch('/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'Failed to update profile');
        alert('Profile updated successfully');
        window.location.reload();
      } catch (err) {
        console.error('Profile update error:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  // Password Form Submission
  const passwordForm = document.querySelector('#password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.querySelector('#current-password').value;
      const password = document.querySelector('#new-password').value;
      const passwordConfirm = document.querySelector('#confirm-password').value;

      if (password !== passwordConfirm) {
        alert('New password and confirm password do not match');
        return;
      }

      try {
        const response = await fetch('/updateMyPassword', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordCurrent: currentPassword,
            password,
            passwordConfirm,
          }),
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'Failed to update password');
        alert('Password updated successfully');
        localStorage.setItem('jwt', data.token); // Update token
        window.location.reload();
      } catch (err) {
        console.error('Password update error:', err);
        alert('Error: ' + err.message);
      }
    });
  }

  // Mark Notification as Read
  document.querySelectorAll('.mark-read-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const notificationCard = button.closest('.notification-card');
      const notificationId = notificationCard.dataset.notificationId;

      try {
        const response = await fetch(`/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'Failed to mark as read');

        notificationCard.classList.remove('unread');
        notificationCard.classList.add('read');
        button.remove();
        alert('Notification marked as read');
      } catch (err) {
        console.error('Mark read error:', err);
        alert('Error: ' + err.message);
      }
    });
  });
});
