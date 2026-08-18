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
    (response: AxiosResponse) => {
      const res = response.data;
      if (res && typeof res === "object" && "status" in res && "data" in res) {
        const payload = res.data;
        if (payload !== null && payload !== undefined) {
          if (Array.isArray(payload)) {
            if ("count" in res) (payload as any).count = res.count;
            if ("next" in res) (payload as any).next = res.next;
            if ("previous" in res) (payload as any).previous = res.previous;
            (payload as any).results = payload;
          }
          return payload;
        }
      }
      return res;
    },
    (error) => {
      const formattedError = handleApiError(error);
      return Promise.reject(formattedError);
    }
  );

  return axiosInstance;
}

export default setupInterceptors;
