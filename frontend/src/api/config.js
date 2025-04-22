import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // 10 seconds
});

// Add a request interceptor for handling authentication tokens and common request tasks
apiClient.interceptors.request.use(
  (config) => {
    // You can add authentication token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling common response tasks and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here, e.g., unauthorized, server errors, etc.
    if (error.response) {
      // Server responded with an error status code
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;