import axios from 'axios';

const api = axios.create({
  //baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',  
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',  
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";  
    const isAuthCall =
      url.includes("/api/auth/login") || url.includes("/api/auth/register");

    if (error.response?.status === 401 && !isAuthCall && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
