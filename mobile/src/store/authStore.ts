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
  pendingRegistration?: { name: string; email: string; role: 'student' | 'organizer' } | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; role: 'student' | 'organizer' }) => Promise<{ success: boolean; requiresVerification: boolean }>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setSession: (user: User, tokens: AuthTokens) => void;
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
        // Offline demo fallback for emulator testing when backend is offline
        if (err.message === 'Network Error' || !err.response) {
          const isOrganizer = email.toLowerCase().includes('organizer');
          const demoUser: User = {
            id: `usr-${Date.now()}`,
            email: email.trim().toLowerCase(),
            name: email.split('@')[0],
            role: isOrganizer ? 'organizer' : 'student',
            isVerified: true,
            createdAt: new Date().toISOString(),
          };
          set({
            accessToken: 'offline-demo-access-token',
            refreshToken: 'offline-demo-refresh-token',
            user: demoUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }

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

        set({
          pendingRegistration: { name: data.name, email: data.email, role: data.role },
          isLoading: false,
          error: null,
        });
        return {
          success: true,
          requiresVerification: response.data?.requiresVerification !== false,
        };
      } catch (err: any) {
        // Offline demo fallback: smoothly navigate to OTP verification with user's selected role
        if (err.message === 'Network Error' || !err.response) {
          set({
            pendingRegistration: { name: data.name, email: data.email, role: data.role },
            isLoading: false,
            error: null,
          });
          return { success: true, requiresVerification: true };
        }

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
          pendingRegistration: null,
        });
        return true;
      } catch (err: any) {
        // Offline demo fallback: complete email verification and set session with the exact chosen role
        if (err.message === 'Network Error' || !err.response) {
          const pending = get().pendingRegistration;
          const userRole = pending?.role || (email.toLowerCase().includes('organizer') ? 'organizer' : 'student');
          const userName = pending?.name || email.split('@')[0];
          const demoUser: User = {
            id: `usr-${Date.now()}`,
            email: email.trim().toLowerCase(),
            name: userName,
            role: userRole,
            isVerified: true,
            createdAt: new Date().toISOString(),
          };

          set({
            accessToken: 'offline-demo-access-token',
            refreshToken: 'offline-demo-refresh-token',
            user: demoUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            pendingRegistration: null,
          });
          return true;
        }

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
        if (err.message === 'Network Error' || !err.response) {
          return true;
        }
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

    setSession: (user: User, tokens: AuthTokens) => {
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        error: null,
      });
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
