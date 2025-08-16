import axios from 'axios';

// Create an Axios instance with a base URL for your backend
const apiClient = axios.create({
    baseURL: 'http://localhost:8000', // Make sure this matches your backend address
});

// 1. Request Interceptor to add the auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            // If the token exists, add it to the Authorization header
            // The backend will expect the "Bearer" prefix
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle any request errors
        return Promise.reject(error);
    }
);

// 2. Response Interceptor to handle 401 errors globally (highly recommended)
apiClient.interceptors.response.use(
    (response) => {
        // If the request was successful, just return the response
        return response;
    },
    (error) => {
        // Check if the error is a 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // The token is invalid or expired.
            // Remove the token from storage
            localStorage.removeItem('token');
            // Redirect the user to the login page
            // Using window.location.href is a simple way to force a full page refresh
            // and clear any component state.
            window.location.href = '/login';
        }
        // For all other errors, just pass them along
        return Promise.reject(error);
    }
);

export default apiClient;