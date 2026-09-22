import { useAuthStore } from '../src/store/authStore';
import { apiClient } from '../src/api/client';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from '../src/screens/auth/validation';

jest.mock('../src/api/client', () => {
  return {
    apiClient: {
      post: jest.fn(),
      defaults: { baseURL: 'http://10.0.2.2:3000' },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
    setupApiClientAuth: jest.fn(),
    setApiBaseUrl: jest.fn(),
  };
});

describe('Phase 2: Auth Flow & Session Management Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    jest.clearAllMocks();
  });

  describe('Validation Schemas', () => {
    it('validates correct login credentials', () => {
      const valid = loginSchema.safeParse({
        email: 'alex@stanford.edu',
        password: 'password123',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects invalid email in login', () => {
      const invalid = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates register payload with role enum', () => {
      const studentValid = registerSchema.safeParse({
        name: 'Jordan Lee',
        email: 'jordan@college.edu',
        password: 'securePassword12',
        role: 'student',
      });
      expect(studentValid.success).toBe(true);

      const invalidRole = registerSchema.safeParse({
        name: 'Jordan Lee',
        email: 'jordan@college.edu',
        password: 'securePassword12',
        role: 'unauthorized_role',
      });
      expect(invalidRole.success).toBe(false);
    });

    it('validates 6-digit numeric OTP', () => {
      expect(verifyEmailSchema.safeParse({ otp: '123456' }).success).toBe(true);
      expect(verifyEmailSchema.safeParse({ otp: '12345' }).success).toBe(false);
      expect(verifyEmailSchema.safeParse({ otp: 'abcdef' }).success).toBe(false);
      expect(verifyEmailSchema.safeParse({ otp: '1234567' }).success).toBe(false);
    });
  });

  describe('Zustand Auth Store', () => {
    it('handles successful login and updates store state', async () => {
      const mockUser = {
        id: 'u-1',
        email: 'alex@college.edu',
        name: 'Alex Johnson',
        role: 'student' as const,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          accessToken: 'jwt-access-token',
          refreshToken: 'jwt-refresh-token',
          user: mockUser,
        },
      });

      const success = await useAuthStore.getState().login('alex@college.edu', 'password123');

      expect(success).toBe(true);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe('jwt-access-token');
      expect(state.user?.name).toBe('Alex Johnson');
      expect(state.error).toBeNull();
    });

    it('handles login failure gracefully', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid email or password' },
        },
      });

      const success = await useAuthStore.getState().login('wrong@college.edu', 'wrongpass');

      expect(success).toBe(false);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.error).toBe('Invalid email or password');
    });

    it('handles email verification', async () => {
      const mockUser = {
        id: 'u-2',
        email: 'verified@college.edu',
        name: 'Verified User',
        role: 'student' as const,
        isVerified: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: {
          accessToken: 'verified-jwt',
          refreshToken: 'verified-refresh',
          user: mockUser,
        },
      });

      const success = await useAuthStore.getState().verifyEmail('verified@college.edu', '654321');

      expect(success).toBe(true);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('verified@college.edu');
    });

    it('resets state on logout', () => {
      useAuthStore.setState({
        accessToken: 'some-token',
        user: { id: '1', email: 'test@test.com', name: 'Test', role: 'student' },
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
    });
  });
});
