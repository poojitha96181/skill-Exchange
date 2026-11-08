import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

const api = axios.create({ baseURL: API_URL ? `${API_URL}/api` : undefined });

api.interceptors.request.use((config) => {
  if (!API_URL) {
    return Promise.reject(
      new Error('Backend is not configured. Set VITE_API_URL to the deployed backend URL.')
    );
  }

  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fileUrl = (p) => (p && API_URL ? `${API_URL}${p}` : '');
export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';

export default api;
