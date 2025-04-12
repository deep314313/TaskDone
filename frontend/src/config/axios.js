import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5000';

// Add a request interceptor to add auth token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;