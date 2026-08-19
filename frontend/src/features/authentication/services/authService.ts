import axiosClient from "../../../api/axiosClient";
import API_ENDPOINTS from "../../../api/endpoints";

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: UserResponse;
}

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const data = await axiosClient.post<any, any>(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });
    return data;
  },

  logout: async () => {
    return { success: true };
  },

  getMe: async (): Promise<UserResponse> => {
    const data = await axiosClient.get<any, any>(API_ENDPOINTS.AUTH.ME);
    return data;
  },
};

export default authService;
