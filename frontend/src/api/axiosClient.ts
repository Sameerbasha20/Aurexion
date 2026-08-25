import axios from "axios";
import setupInterceptors from "./interceptors";

function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    const hostname = typeof window !== "undefined" && window.location?.hostname ? window.location.hostname : "localhost";
    return `http://${hostname}:8000/api/v1/`;
  }
  return "https://aurexion.onrender.com/api/v1/";
}

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withXSRFToken: true,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Setup interceptors
setupInterceptors(axiosClient);

export default axiosClient;