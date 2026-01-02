import axios from "axios";
import { getCookie, deleteCookie } from 'cookies-next';
import { toast } from "sonner";
import { debugLogger } from "./debug-logger";

// 1. Create the Axios instance with a base configuration.
// The baseURL will be automatically prepended to all request URLs.
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // This ensures cookies are sent with requests
});

// 2. Use a request interceptor to dynamically add headers to every request.
// This function will run BEFORE each request is sent.
client.interceptors.request.use(
  (config) => {
    // We can only access cookies on the client-side.
    if (typeof window !== "undefined") {
      const token = getCookie('token');

      // If a token exists, add it to the Authorization header.
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

    }

    // Important: return the config object for the request to proceed
    return config;
  },
  (error) => {
    // This function handles errors that occur before the request is sent.
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// 3. (Optional but recommended) Use a response interceptor to handle responses globally.
// This allows you to process data or handle errors from one central location.
client.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx will trigger this function.
    // Here, we simply return the response data.
    return response.data;
  },
  (error) => {
    // Any status codes outside the range of 2xx will trigger this function.
    // You can handle errors here, such as redirecting to a login page on 401 errors.
    console.error("Response Error:", error);

    // Capture network error for debug logging
    if (typeof window !== "undefined") {
      debugLogger.addNetworkError({
        method: error.config?.method?.toUpperCase() || "UNKNOWN",
        url: error.config?.url || "unknown",
        status: error.response?.status || null,
        statusText: error.response?.statusText || "No Response",
        error: error.response?.data?.message || error.message || "Unknown error",
      });
    }

    // Handle authentication errors
    if (error.response) {
      const { status, data } = error.response;

      // Check for 401 Unauthorized or "No token provided" error
      if (status === 401 || data?.error === "No token provided" || data?.message === "No token provided") {
        // Only handle on client side
        if (typeof window !== "undefined") {
          // Clear the token cookie
          deleteCookie('token');

          // Show toast notification
          toast.error("Session expired. Please sign in again.");

          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = "/sign-in";
          }, 1000);
        }
      }
    }

    return Promise.reject(error);
  }
);

export { client };
export default client;

/*
  // HOW TO USE IT IN YOUR COMPONENTS/PAGES:

  import client from './path/to/your/client';

  // Example GET request
  const fetchUsers = async () => {
    try {
      const users = await client.get('/users'); // route is '/users'
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Example POST request
  const createUser = async (userData) => {
    try {
      const newUser = await client.post('/users', userData); // route is '/users', body is userData
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };
*/
