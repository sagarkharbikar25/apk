import { apiClient, setupApiClientAuth, setApiBaseUrl } from '../src/api/client';

jest.mock('axios', () => {
  const originalAxios = jest.requireActual('axios');
  const mockAxiosInstance = {
    defaults: {
      baseURL: 'http://10.0.2.2:3000',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };
  return {
    ...originalAxios,
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
  };
});

describe('API Client Unit Tests', () => {
  it('updates base URL when setApiBaseUrl is called', () => {
    setApiBaseUrl('http://192.168.1.10:3000');
    expect(apiClient.defaults.baseURL).toBe('http://192.168.1.10:3000');
    // Reset back
    setApiBaseUrl('http://10.0.2.2:3000');
    expect(apiClient.defaults.baseURL).toBe('http://10.0.2.2:3000');
  });

  it('configures auth token provider without throwing', () => {
    const mockProvider = jest.fn(() => ({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    }));
    const mockRefresh = jest.fn();
    const mockFail = jest.fn();

    expect(() => {
      setupApiClientAuth(mockProvider, mockRefresh, mockFail);
    }).not.toThrow();
  });
});
