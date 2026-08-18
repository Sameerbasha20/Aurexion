export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  code?: string;
}

export function handleApiError(error: any): ApiError {
  const apiError: ApiError = {
    message: "An unexpected error occurred.",
  };

  if (error.response) {
    // Server responded with status code outside 2xx range
    const data = error.response.data;
    apiError.statusCode = error.response.status;
    apiError.message = data?.message || data?.error || `Error: ${error.response.statusText}`;
    apiError.errors = data?.errors || undefined;
    apiError.code = data?.code || undefined;
  } else if (error.request) {
    // Request was made but no response received
    apiError.message = "No response from server. Please check your network connection.";
    apiError.code = "NETWORK_ERROR";
  } else {
    // Something happened setting up the request
    apiError.message = error.message || "Request setup error.";
  }

  return apiError;
}

export default handleApiError;
