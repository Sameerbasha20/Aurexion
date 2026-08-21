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
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Attach JWT Bearer Token if present (except on public endpoints)
      const token = localStorage.getItem("aurexion_token") || localStorage.getItem("access_token");
      const isPublicEndpoint = config.url && (
        config.url.includes("/auth/login") ||
        config.url.includes("/auth/forgot-password") ||
        config.url.includes("/auth/reset-password") ||
        config.url.includes("/auth/token/refresh")
      );

      if (token && !isPublicEndpoint && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

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

  // Response Interceptor
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
        const refreshToken = localStorage.getItem("aurexion_refresh_token");

        if (refreshToken) {
          try {
            const refreshData = await axiosInstance.post<any, any>("/auth/token/refresh/", {
              refresh: refreshToken,
            });

            const newAccessToken = refreshData?.access;
            if (newAccessToken) {
              localStorage.setItem("aurexion_token", newAccessToken);
              if (refreshData.refresh) {
                localStorage.setItem("aurexion_refresh_token", refreshData.refresh);
              }
              originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem("aurexion_user");
            localStorage.removeItem("aurexion_token");
            localStorage.removeItem("aurexion_refresh_token");
            if (window.location.pathname.startsWith("/portal") || window.location.pathname.startsWith("/client")) {
              window.location.href = "/login";
            }
            return Promise.reject(handleApiError(refreshError));
          }
        } else {
          localStorage.removeItem("aurexion_user");
          localStorage.removeItem("aurexion_token");
          if (window.location.pathname.startsWith("/portal") || window.location.pathname.startsWith("/client")) {
            window.location.href = "/login";
          }
        }
      }

      const formattedError = handleApiError(error);
      if (formattedError.statusCode === 401) {
        // Clear stored token if request failed with 401 on non-login endpoints
        const requestUrl = error?.config?.url || "";
        if (!requestUrl.includes("/auth/login/")) {
          localStorage.removeItem("aurexion_token");
          localStorage.removeItem("access_token");
        }
      }
      return Promise.reject(formattedError);
    }
  );

  return axiosInstance;
}

export default setupInterceptors;

