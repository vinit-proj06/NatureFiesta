// public/js/auth.js
import axios from 'axios';

export const checkAuth = () => {
  const publicRoutes = ['/login', '/signup', '/password-reset'];
  if (publicRoutes.includes(window.location.pathname)) return;

  const token = localStorage.getItem('jwt');
  if (!token) {
    const redirect = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    window.location.href = `/login?redirect=${redirect}`;
  }
};

export const setAuthToken = (token) => {
  localStorage.setItem('jwt', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const handleLogout = () => {
  localStorage.removeItem('jwt');
  delete axios.defaults.headers.common['Authorization'];
  axios.get('/api/users/logout', { withCredentials: true }).catch(() => {});
  window.location.href = '/login';
};
