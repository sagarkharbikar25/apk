import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: App | null = null;

  constructor(private configService: ConfigService) {
    const serviceAccountRaw = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
    if (serviceAccountRaw) {
      try {
        const serviceAccount =
          typeof serviceAccountRaw === 'string'
            ? JSON.parse(serviceAccountRaw)
            : serviceAccountRaw;

        // Check if real service account credentials
        if (
          serviceAccount.project_id &&
          serviceAccount.private_key &&
          serviceAccount.client_email
        ) {
          const apps = getApps();
          if (!apps.length) {
            this.firebaseApp = initializeApp({
              credential: cert(serviceAccount),
            });
            this.logger.log('Firebase Admin initialized successfully');
          } else {
            this.firebaseApp = getApp();
          }
        } else {
          this.logger.warn('Firebase service account credentials missing required fields; push notifications will be simulated');
        }
      } catch (err: any) {
        this.logger.warn(`Failed to parse FIREBASE_SERVICE_ACCOUNT: ${err.message}. Push notifications will be simulated.`);
      }
    }
  }

  /**
   * Send FCM push notification to a device token
   */
  async sendToToken(token: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!token) return false;

    if (!this.firebaseApp) {
      this.logger.log(`[SIMULATED PUSH] To: ${token.slice(0, 12)}... | Title: "${payload.title}" | Body: "${payload.body}"`);
      return true;
    }

    try {
      await getMessaging(this.firebaseApp).send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      return true;
    } catch (err: any) {
      this.logger.error(`Error sending FCM push: ${err.message}`);
      return false;
    }
  }
}
