export class ApiError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
  code?: string;

  constructor(message: string, statusCode?: number, errors?: Record<string, string[]>, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function handleApiError(error: any): ApiError {
  let message = "An unexpected error occurred.";
  let statusCode: number | undefined;
  let errors: Record<string, string[]> | undefined;
  let code: string | undefined;

  if (error?.response) {
    // Server responded with status code outside 2xx range
    const data = error.response.data;
    statusCode = error.response.status;
    message = data?.message || data?.error || `Error: ${error.response.statusText || 'Request failed'}`;
    errors = data?.errors || undefined;
    code = data?.code || undefined;
  } else if (error?.request) {
    // Request was made but no response received
    message = "No response from server. Please check your network connection.";
    code = "NETWORK_ERROR";
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  return new ApiError(message, statusCode, errors, code);
}

export default handleApiError;
