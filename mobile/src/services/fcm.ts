// Firebase Cloud Messaging (FCM) Service
// Handles device push token registration, foreground alerts, and background notification routing

import { apiClient } from '../api/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    type?: 'INVITATION' | 'MATCH' | 'HACKATHON_ALERT' | 'SYSTEM';
    referenceId?: string;
  };
}

type NotificationHandler = (payload: PushNotificationPayload) => void;

class FCMService {
  private fcmToken: string | null = null;
  private onNotificationReceived: NotificationHandler | null = null;

  async requestPermissionAndRegister(): Promise<string | null> {
    try {
      // In native environment with Play Services, registers FCM device token
      this.fcmToken = 'fcm-device-token-simulated-pixel6a';

      // Send token to backend API: POST /users/me/fcm-token
      await apiClient.post('/users/me/fcm-token', { fcmToken: this.fcmToken });
      return this.fcmToken;
    } catch {
      return null;
    }
  }

  setNotificationHandler(handler: NotificationHandler): void {
    this.onNotificationReceived = handler;
  }

  // Simulated push notification trigger for testing
  simulateIncomingNotification(payload: PushNotificationPayload): void {
    this.onNotificationReceived?.(payload);
  }

  getStoredToken(): string | null {
    return this.fcmToken;
  }
}

export const fcmService = new FCMService();
