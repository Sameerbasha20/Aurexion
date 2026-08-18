import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import handleApiError from "./apiErrorHandler";

export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("aurexion_auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error) => {
      const formattedError = handleApiError(error);
      return Promise.reject(formattedError);
    }
  );

  return axiosInstance;
}

export default setupInterceptors;
