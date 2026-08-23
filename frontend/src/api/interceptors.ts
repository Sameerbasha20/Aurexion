import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import handleApiError from "./apiErrorHandler";

function attachPaginationMetadata(payload: any[], res: Record<string, any>): any[] {
  const result: any = payload;
  if ("count" in res) result.count = res.count;
  if ("next" in res) result.next = res.next;
  if ("previous" in res) result.previous = res.previous;
  result.results = payload;
  return result;
}

function unpackApiResponse(res: any): any {
  if (!res || typeof res !== "object" || !("status" in res) || !("data" in res)) {
    return res;
  }
  const payload = res.data;
  if (payload === null || payload === undefined) {
    return res;
  }
  if (Array.isArray(payload)) {
    return attachPaginationMetadata(payload, res);
  }
  return payload;
}

export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
  // Request Interceptor — secure cookie transport, no Authorization header from localStorage
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // HttpOnly cookies (access_token, refresh_token) are sent automatically via withCredentials.
      // Never expose JWTs via localStorage/sessionStorage.
      // Only attach CSRF token for unsafe methods.
      if (config.method && !["get", "head", "options"].includes(config.method.toLowerCase())) {
        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrftoken="))
          ?.split("=")[1];
        if (csrfToken) {
          config.headers["X-CSRFToken"] = csrfToken;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor — secure cookie refresh
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => unpackApiResponse(response.data),
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/login") &&
        !originalRequest.url?.includes("/auth/forgot-password") &&
        !originalRequest.url?.includes("/auth/reset-password") &&
        !originalRequest.url?.includes("/auth/token/refresh")
      ) {
        originalRequest._retry = true;
        try {
          // Refresh via HttpOnly cookies (no body, withCredentials sends refresh_token)
          await axiosInstance.post("/auth/token/refresh/");
          // Retry original request with new access_token cookie
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("aurexion_user");
          if (window.location.pathname.startsWith("/portal") || window.location.pathname.startsWith("/client") || window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/bdm") || window.location.pathname.startsWith("/cms")) {
            window.location.href = "/login";
          }
          return Promise.reject(handleApiError(refreshError));
        }
      }

      const formattedError = handleApiError(error);
      if (formattedError.statusCode === 401) {
        const requestUrl = error?.config?.url || "";
        if (!requestUrl.includes("/auth/login/") && !requestUrl.includes("/auth/token/refresh")) {
          localStorage.removeItem("aurexion_user");
        }
      }
      return Promise.reject(formattedError);
    }
  );

  return axiosInstance;
}

export default setupInterceptors;

