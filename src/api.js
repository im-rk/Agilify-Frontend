import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agilify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401s (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('agilify_token');
      localStorage.removeItem('agilify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
