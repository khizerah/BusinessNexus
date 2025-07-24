import { apiRequest } from "./queryClient";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'investor' | 'entrepreneur';
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },
  
  register: async (data: RegisterData) => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },
  
  logout: async () => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },
  
  me: async () => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  }
};
