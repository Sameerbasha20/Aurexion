import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: UserResponse;
  access?: string;
  refresh?: string;
  tokens?: {
    access: string;
    refresh: string;
  };
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });

    // Store CSRF token from response in localStorage for cross-domain Vercel -> Render support
    if (data && data.csrftoken) {
      localStorage.setItem('csrftoken', data.csrftoken);
    }

    return data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      await axiosClient.post("/auth/logout/");
    } catch {
      // Safe cleanup even if backend endpoint is unavailable or network is offline
    } finally {
      localStorage.removeItem("aurexion_user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("csrftoken");
    }
    return { success: true };
  },

  getMe: async (): Promise<UserResponse> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.AUTH.ME);
    return data;
  },
};

export default authService;