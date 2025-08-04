/* eslint-disable */
import axios from 'axios';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:7000/api/users/login',
      data: { email, password },
      withCredentials: true,
    });

    if (res.data.status === 'success' && res.data.token) {
      localStorage.setItem('jwt', res.data.token);
      window.location.assign('/');
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Login failed');
  }
};

export const logout = async () => {
  try {
    // Clear local storage first
    localStorage.removeItem('jwt');
    delete axios.defaults.headers.common['Authorization'];

    // Then call server logout
    await axios({
      method: 'GET',
      url: 'http://127.0.0.1:7000/api/users/logout',
      withCredentials: true,
    });

    // Redirect to login page
    window.location.href = '/login';
  } catch (err) {
    // Even if server logout fails, ensure client-side cleanup
    localStorage.removeItem('jwt');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }
};
