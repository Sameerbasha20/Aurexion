export class ApiError extends Error {
  statusCode?: number;
  errors?: Record<string, string[] | string>;
  code?: string;
  userMessage: string;
  details?: any;

  constructor(
    message: string,
    statusCode?: number,
    errors?: Record<string, string[] | string>,
    code?: string,
    userMessage?: string,
    details?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
    this.userMessage = userMessage || message;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function handleApiError(error: any): ApiError {
  let message = "An unexpected error occurred. Please try again.";
  let userMessage = "An unexpected error occurred. Please try again.";
  let statusCode: number | undefined;
  let errors: Record<string, string[] | string> | undefined;
  let code: string | undefined;
  let details: any;

  if (error instanceof ApiError) {
    return error;
  }

  if (error?.response) {
    // Server responded with status code outside 2xx range
    statusCode = error.response.status;
    const data = error.response.data;
    details = data;

    // Standardize error message extraction
    if (typeof data === "string") {
      message = `Server Error (${statusCode})`;
      userMessage = "Something went wrong on the server. Please try again later.";
    } else if (data && typeof data === "object") {
      message = data.detail || data.message || data.error || `Error ${statusCode}`;
      if (data.errors && typeof data.errors === "object") {
        errors = data.errors;
      } else if (statusCode === 400 || statusCode === 422) {
        // DRF style field errors dictionary
        errors = data;
      }
      code = data.code || undefined;
    }

    // HTTP Status-specific safe user messages
    switch (statusCode) {
      case 400:
        userMessage = message || "Bad request. Please check your input and try again.";
        code = code || "BAD_REQUEST";
        break;
      case 401:
        userMessage = "Your session has expired or you are unauthorized. Please sign in again.";
        code = code || "UNAUTHORIZED";
        break;
      case 403:
        userMessage = "You do not have permission to perform this action.";
        code = code || "FORBIDDEN";
        break;
      case 404:
        userMessage = "The requested resource was not found.";
        code = code || "NOT_FOUND";
        break;
      case 409:
        userMessage = message || "A conflict occurred with your request. Please try again.";
        code = code || "CONFLICT";
        break;
      case 422:
        userMessage = "Validation failed. Please correct the highlighted errors.";
        code = code || "UNPROCESSABLE_ENTITY";
        break;
      case 429:
        userMessage = "Too many requests. Please wait a moment and try again.";
        code = code || "RATE_LIMITED";
        break;
      case 500:
        userMessage = "Something went wrong on the server. Please try again later.";
        code = code || "INTERNAL_SERVER_ERROR";
        break;
      case 502:
      case 503:
      case 504:
        userMessage = "Service is temporarily unavailable or timing out. Please try again shortly.";
        code = code || "GATEWAY_ERROR";
        break;
      default:
        userMessage = message || `Server returned error status ${statusCode}.`;
        break;
    }
  } else if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    message = "Request timed out. Please check your connection and try again.";
    userMessage = "The server is taking too long to respond. Please try again.";
    code = "TIMEOUT";
  } else if (error?.request) {
    // Request was made but no response received
    message = "No response from server. Please check your network connection.";
    userMessage = "Network error. Unable to reach the Aurexion servers. Please check your connection.";
    code = "NETWORK_ERROR";
  } else if (error instanceof Error) {
    message = error.message;
    userMessage = error.message;
  } else if (typeof error === "string") {
    message = error;
    userMessage = error;
  }

  // Ensure no sensitive passwords, secrets, or raw internal paths are leaked in userMessage
  if (userMessage.toLowerCase().includes("password") || userMessage.toLowerCase().includes("token") || userMessage.toLowerCase().includes("secret")) {
    userMessage = "Authentication or authorization request failed.";
  }

  return new ApiError(message, statusCode, errors, code, userMessage, details);
}

export default handleApiError;
