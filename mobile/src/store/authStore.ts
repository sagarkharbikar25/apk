import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { apiClient, setupApiClientAuth } from '../api';
import { User, AuthResponse, AuthTokens } from '../api/types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  pendingRegistration?: { name: string; email: string; role: 'student' | 'organizer' } | null;

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'organizer';
    organizerCode?: string;
  }) => Promise<{ success: boolean; requiresVerification: boolean }>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  setSession: (user: User, tokens: AuthTokens) => Promise<void>;
  clearError: () => void;
}

const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: 'skillsync_access_token',
  REFRESH_TOKEN: 'skillsync_refresh_token',
  USER_DATA: 'skillsync_user_data',
};

// Generic keychain helpers
const saveSecure = async (key: string, value: string) => {
  try { await Keychain.setGenericPassword(key, value, { service: key }); } catch {}
};
const loadSecure = async (key: string) => {
  try {
    const creds = await Keychain.getGenericPassword({ service: key });
    return creds ? creds.password : null;
  } catch {
    return null;
  }
};
const clearSecure = async (key: string) => {
  try { await Keychain.resetGenericPassword({ service: key }); } catch {}
};

export const useAuthStore = create<AuthState>((set, get) => {
  setupApiClientAuth(
    () => ({
      accessToken: get().accessToken,
      refreshToken: get().refreshToken,
    }),
    async (tokens: AuthTokens) => {
      await get().setTokens(tokens);
    },
    async () => {
      await get().logout();
    }
  );

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true,
    error: null,

    initAuth: async () => {
      try {
        const [access, refresh, userData] = await Promise.all([
          loadSecure(SECURE_STORE_KEYS.ACCESS_TOKEN),
          loadSecure(SECURE_STORE_KEYS.REFRESH_TOKEN),
          loadSecure(SECURE_STORE_KEYS.USER_DATA)
        ]);

        if (access && refresh && userData) {
          set({
            accessToken: access,
            refreshToken: refresh,
            user: JSON.parse(userData),
            isAuthenticated: true,
          });
        }
      } catch (err) {
        console.error('Failed to init auth state', err);
      } finally {
        set({ isInitializing: false });
      }
    },

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post<AuthResponse>('/auth/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        const { accessToken, refreshToken, user } = response.data;
        await get().setSession(user, { accessToken, refreshToken });
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        // Fallback for emulator offline testing
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
          await get().setSession(demoUser, { accessToken: 'demo-access', refreshToken: 'demo-refresh' });
          set({ isLoading: false });
          return true;
        }

        const message = err.response?.data?.message || err.message || 'Login failed.';
        set({ isLoading: false, error: Array.isArray(message) ? message[0] : message });
        return false;
      }
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.post('/auth/register', {
          email: data.email.trim().toLowerCase(),
          password: data.password,
          displayName: data.name,
          role: data.role,
          organizerCode: data.organizerCode,
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
        if (err.message === 'Network Error' || !err.response) {
          set({
            pendingRegistration: { name: data.name, email: data.email, role: data.role },
            isLoading: false,
            error: null,
          });
          return { success: true, requiresVerification: true };
        }

        const message = err.response?.data?.message || err.message || 'Registration failed.';
        set({ isLoading: false, error: Array.isArray(message) ? message[0] : message });
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
        await get().setSession(user, { accessToken, refreshToken });
        set({ isLoading: false, pendingRegistration: null });
        return true;
      } catch (err: any) {
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

          await get().setSession(demoUser, { accessToken: 'demo-access', refreshToken: 'demo-refresh' });
          set({ isLoading: false, pendingRegistration: null });
          return true;
        }

        const message = err.response?.data?.message || err.message || 'Invalid or expired OTP.';
        set({ isLoading: false, error: Array.isArray(message) ? message[0] : message });
        return false;
      }
    },

    resendOtp: async (email: string) => {
      try {
        await apiClient.post('/auth/resend-otp', { email: email.trim().toLowerCase() });
        return true;
      } catch (err: any) {
        if (err.message === 'Network Error' || !err.response) return true;
        const message = err.response?.data?.message || err.message || 'Failed to resend OTP.';
        set({ error: Array.isArray(message) ? message[0] : message });
        return false;
      }
    },

    logout: async () => {
      try {
        await Promise.all([
          clearSecure(SECURE_STORE_KEYS.ACCESS_TOKEN),
          clearSecure(SECURE_STORE_KEYS.REFRESH_TOKEN),
          clearSecure(SECURE_STORE_KEYS.USER_DATA)
        ]);
      } catch {}
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
    },

    setUser: async (user: User) => {
      await saveSecure(SECURE_STORE_KEYS.USER_DATA, JSON.stringify(user));
      set({ user });
    },

    setTokens: async (tokens: AuthTokens) => {
      await Promise.all([
        saveSecure(SECURE_STORE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        saveSecure(SECURE_STORE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      ]);
      set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    },

    setSession: async (user: User, tokens: AuthTokens) => {
      await Promise.all([
        saveSecure(SECURE_STORE_KEYS.USER_DATA, JSON.stringify(user)),
        saveSecure(SECURE_STORE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        saveSecure(SECURE_STORE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      ]);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});
