// Offline caching service
// Persists last-fetched data and provides network state listener

type NetworkStatusListener = (isOnline: boolean) => void;

class OfflineCacheService {
  private cache: Map<string, string> = new Map();
  private isOnline = true;
  private listeners: Set<NetworkStatusListener> = new Set();

  set(key: string, data: any): void {
    try {
      this.cache.set(key, JSON.stringify(data));
    } catch {
      // In-memory fallback
    }
  }

  get<T>(key: string): T | null {
    try {
      const raw = this.cache.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  setIsOnline(online: boolean): void {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.listeners.forEach((listener) => listener(online));
    }
  }

  subscribeToNetworkChanges(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const offlineCacheService = new OfflineCacheService();
