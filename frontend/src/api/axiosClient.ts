import axios from "axios";
import setupInterceptors from "./interceptors";

const API_URL = import.meta.env.VITE_API_URL || "https://aurexion.onrender.com/api/v1/";

const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Setup interceptors
setupInterceptors(axiosClient);

export default axiosClient;
