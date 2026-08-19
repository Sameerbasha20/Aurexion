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
    (response: AxiosResponse) => unpackApiResponse(response.data),
    (error) => {
      const formattedError = handleApiError(error);
      return Promise.reject(formattedError);
    }
  );

  return axiosInstance;
}

export default setupInterceptors;

