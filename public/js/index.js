/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { setupEventListeners } from './clickHack.js';
import { initializePage } from './product.js';
import { checkAuth, setAuthToken } from './auth.js';
import axios from 'axios';

// DOM ELEMENTS
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.user-logged-in');

// Axios interceptor to add token to all requests
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/logout')
    ) {
      // Silent redirect for auth errors
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Initial token check
const token = localStorage.getItem('jwt');
if (token) {
  console.log('Initial token found:', token.slice(0, 20) + '...');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Handle login form submission
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// Handle logout button click
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

// Initialize product page and other event listeners
setupEventListeners();
