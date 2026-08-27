export interface ApiError {
  statusCode: number;
  message: string;
  userMessage: string;
  isNetworkError: boolean;
  details?: Record<string, unknown> | string[] | unknown;
  errors?: Record<string, string[] | string>;
}

export interface AxiosLikeError {
  response?: {
    status?: number;
    data?: unknown;
  };
  code?: string;
  message?: string;
  request?: unknown;
}

export class CustomApiError extends Error implements ApiError {
  statusCode: number;
  userMessage: string;
  isNetworkError: boolean;
  details?: Record<string, unknown> | string[] | unknown;
  errors?: Record<string, string[] | string>;

  constructor(
    statusCode: number,
    message: string,
    userMessage: string,
    isNetworkError: boolean = false,
    details?: Record<string, unknown> | string[] | unknown,
    errors?: Record<string, string[] | string>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.isNetworkError = isNetworkError;
    this.details = details;
    this.errors = errors;
  }
}

export function handleApiError(error: AxiosLikeError | unknown): ApiError {
  const err = (error || {}) as AxiosLikeError;
  let statusCode = 500;
  let message = "An unexpected error occurred.";
  let userMessage = "Something went wrong. Please try again later.";
  let isNetworkError = false;
  let details: Record<string, unknown> | string[] | unknown;
  let errors: Record<string, string[] | string> | undefined;

  if (err.response) {
    statusCode = err.response.status || 500;
    const responseData = err.response.data as Record<string, unknown> | string | undefined;
    details = responseData;

    if (responseData && typeof responseData === "object") {
      errors = responseData as Record<string, string[] | string>;
    }

    // Handle common HTTP error statuses
    switch (statusCode) {
      case 400:
        message = "Bad Request";
        userMessage = "The request could not be understood or was missing required parameters.";
        if (responseData && typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          if (firstKey) {
            const val = (responseData as Record<string, unknown>)[firstKey];
            if (Array.isArray(val) && val.length > 0) {
              userMessage = `${firstKey}: ${val[0]}`;
            } else if (typeof val === "string") {
              userMessage = `${firstKey}: ${val}`;
            }
          }
        }
        break;
      case 401:
        message = "Unauthorized";
        userMessage = "Your session has expired or you are not authorized. Please log in.";
        break;
      case 403:
        message = "Forbidden";
        userMessage = "You do not have permission to perform this action.";
        break;
      case 404:
        message = "Not Found";
        userMessage = "The requested resource could not be found.";
        break;
      case 409:
        message = "Conflict";
        userMessage = "A conflict occurred with the current state of the resource.";
        break;
      case 422:
        message = "Unprocessable Entity";
        userMessage = "The data provided is invalid.";
        break;
      case 429:
        message = "Too Many Requests";
        userMessage = "You have made too many requests. Please wait a moment and try again.";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = "Server Error";
        userMessage = "A server error occurred. Our team has been notified.";
        break;
      default:
        message = `HTTP Error ${statusCode}`;
        userMessage = "An unexpected error occurred.";
    }

    if (responseData && typeof responseData === "object" && "detail" in responseData) {
      message = String((responseData as Record<string, unknown>).detail);
      userMessage = message;
    }
  } else if (err.code === "ECONNABORTED" || (err.message && err.message.includes("timeout"))) {
    statusCode = 408;
    message = "Request Timeout";
    userMessage = "The request timed out. Please check your internet connection.";
    isNetworkError = true;
  } else if (err.request || !navigator.onLine) {
    statusCode = 0;
    message = "Network Error";
    userMessage = "Unable to connect to the server. Please check your internet connection.";
    isNetworkError = true;
  }

  return new CustomApiError(statusCode, message, userMessage, isNetworkError, details, errors);
}

export default handleApiError;
