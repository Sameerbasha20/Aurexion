import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import handleApiError from "./apiErrorHandler";

function attachPaginationMetadata<T>(payload: T[], res: Record<string, unknown>): T[] & { count?: number; next?: string | null; previous?: string | null; results?: T[] } {
  const result = payload as T[] & { count?: number; next?: string | null; previous?: string | null; results?: T[] };
  if ("count" in res && typeof res.count === "number") result.count = res.count;
  if ("next" in res && (typeof res.next === "string" || res.next === null)) result.next = res.next as string | null;
  if ("previous" in res && (typeof res.previous === "string" || res.previous === null)) result.previous = res.previous as string | null;
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

const EXEMPT_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/token/refresh",
];

export function isExemptAuthUrl(url?: string): boolean {
  if (!url) return false;
  return EXEMPT_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
  // Request Interceptor — attach Bearer token from localStorage for cross-domain Vercel -> Render support
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token =
        localStorage.getItem("aurexion_token") ||
        localStorage.getItem("access_token");

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.withCredentials = true;

      // Only attach CSRF token for unsafe methods
      if (config.method && !["get", "head", "options"].includes(config.method.toLowerCase())) {
        let csrfToken: string | undefined;

        // 1. Try reading from localStorage (set by authService.login after backend returns csrftoken in JSON)
        const storedToken = localStorage.getItem('csrftoken');
        if (storedToken) {
          csrfToken = storedToken;
        } else {
          // 2. Fall back to reading from document.cookie (works for same-origin requests)
          csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];
        }

        if (csrfToken) {
          config.headers["X-CSRFToken"] = csrfToken;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor — secure token refresh with payload support
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => unpackApiResponse(response.data),
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isExemptAuthUrl(originalRequest.url)
      ) {
        originalRequest._retry = true;
        try {
          const refreshToken =
            localStorage.getItem("aurexion_refresh_token") ||
            localStorage.getItem("refresh_token");

          // Send refresh token in JSON payload (supported cross-domain)
          const res: any = await axiosInstance.post("/auth/token/refresh/", {
            refresh: refreshToken,
          });

          const newAccessToken = res?.access || res?.data?.access;
          const newRefreshToken = res?.refresh || res?.data?.refresh;

          if (newAccessToken) {
            localStorage.setItem("aurexion_token", newAccessToken);
            localStorage.setItem("access_token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("aurexion_refresh_token", newRefreshToken);
              localStorage.setItem("refresh_token", newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem("aurexion_user");
          localStorage.removeItem("aurexion_token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("aurexion_refresh_token");
          localStorage.removeItem("refresh_token");

          if (
            window.location.pathname.startsWith("/portal") ||
            window.location.pathname.startsWith("/client") ||
            window.location.pathname.startsWith("/admin") ||
            window.location.pathname.startsWith("/bdm") ||
            window.location.pathname.startsWith("/cms")
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(handleApiError(refreshError));
        }
      }

      const formattedError = handleApiError(error);
      if (formattedError.statusCode === 401) {
        const requestUrl = error?.config?.url || "";
        if (!isExemptAuthUrl(requestUrl)) {
          localStorage.removeItem("aurexion_user");
          localStorage.removeItem("aurexion_token");
          localStorage.removeItem("access_token");
          localStorage.removeItem("aurexion_refresh_token");
          localStorage.removeItem("refresh_token");
        }
      }
      return Promise.reject(formattedError);
    }
  );

  return axiosInstance;
}

export default setupInterceptors;

