import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens } from './types';

// Default base URL: Android emulator loopback to host PC.
// Can be changed dynamically via setApiBaseUrl(newUrl)
const DEFAULT_BASE_URL = 'http://10.0.2.2:3000';

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

// Token getter / setter callbacks to prevent circular dependency with Zustand store
type TokenProvider = () => {
  accessToken: string | null;
  refreshToken: string | null;
};
type OnTokenRefreshed = (tokens: AuthTokens) => void;
type OnAuthFailed = () => void;

let tokenProvider: TokenProvider = () => ({ accessToken: null, refreshToken: null });
let onTokenRefreshedCallback: OnTokenRefreshed | null = null;
let onAuthFailedCallback: OnAuthFailed | null = null;

export const setupApiClientAuth = (
  provider: TokenProvider,
  onRefresh: OnTokenRefreshed,
  onFail: OnAuthFailed
) => {
  tokenProvider = provider;
  onTokenRefreshedCallback = onRefresh;
  onAuthFailedCallback = onFail;
};

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = tokenProvider();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and request has not been retried yet and not auth endpoints
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue pending requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = tokenProvider();

      if (!refreshToken) {
        isRefreshing = false;
        onAuthFailedCallback?.();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post<AuthTokens>(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newTokens = refreshResponse.data;
        onTokenRefreshedCallback?.(newTokens);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        processQueue(null, newTokens.accessToken);

        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        onAuthFailedCallback?.();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
