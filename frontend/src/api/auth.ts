import apiClient, { setTokens, clearTokens } from './client';

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  display_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/api/v1/auth/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    // OAuth2 password flow uses form data
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post<TokenResponse>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token } = response.data;
    setTokens(access_token, refresh_token);

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  },

  logout(): void {
    clearTokens();
  },
};

export default authApi;
