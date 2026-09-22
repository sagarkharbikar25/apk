import { create } from 'zustand';
import { apiClient, setupApiClientAuth } from '../api/client';
import { User, AuthResponse, AuthTokens } from '../api/types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; role: 'student' | 'organizer' }) => Promise<{ success: boolean; requiresVerification: boolean }>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize apiClient interceptor callback
  setupApiClientAuth(
    () => ({
      accessToken: get()?.accessToken || null,
      refreshToken: get()?.refreshToken || null,
    }),
    (tokens: AuthTokens) => {
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    },
    () => {
      // Auth failed completely (refresh token expired)
      get()?.logout();
    }
  );

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post<AuthResponse>('/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        const { accessToken, refreshToken, user } = response.data;

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
        set({
          isLoading: false,
          error: Array.isArray(message) ? message[0] : message,
        });
        return false;
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/register', {
          ...data,
          email: data.email.trim().toLowerCase(),
        });

        set({ isLoading: false, error: null });
        return {
          success: true,
          requiresVerification: response.data?.requiresVerification !== false,
        };
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'Registration failed.';
        set({
          isLoading: false,
          error: Array.isArray(message) ? message[0] : message,
        });
        return { success: false, requiresVerification: false };
      }
    },

    verifyEmail: async (email: string, otp: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post<AuthResponse>('/auth/verify-email', {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        });

        const { accessToken, refreshToken, user } = response.data;

        set({
          accessToken: accessToken || null,
          refreshToken: refreshToken || null,
          user: user || null,
          isAuthenticated: !!accessToken,
          isLoading: false,
          error: null,
        });
        return true;
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'Invalid or expired OTP code.';
        set({
          isLoading: false,
          error: Array.isArray(message) ? message[0] : message,
        });
        return false;
      }
    },

    resendOtp: async (email: string) => {
      try {
        await apiClient.post('/auth/resend-otp', {
          email: email.trim().toLowerCase(),
        });
        return true;
      } catch (err: any) {
        const message =
          err.response?.data?.message || err.message || 'Failed to resend OTP.';
        set({ error: Array.isArray(message) ? message[0] : message });
        return false;
      }
    },

    logout: () => {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    },

    setUser: (user: User) => {
      set({ user });
    },

    setTokens: (tokens: AuthTokens) => {
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
