import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../services/api/apiClient';
import { ENDPOINTS } from '../constants/endpoints';
import { useAppStore } from '../store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type NotificationNavigationCallback = (screen: string, params?: Record<string, any>) => void;

export class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;
  private notificationSubscription: Notifications.EventSubscription | null = null;
  private responseSubscription: Notifications.EventSubscription | null = null;
  private navigationCallback: NotificationNavigationCallback | null = null;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) NotificationManager.instance = new NotificationManager();
    return NotificationManager.instance;
  }

  setNavigationCallback(callback: NotificationNavigationCallback): void {
    this.navigationCallback = callback;
  }

  async initialize(): Promise<void> {
    try {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      this.expoPushToken = await this.registerForPushNotificationsAsync();
      if (this.expoPushToken) await this.registerTokenWithBackend(this.expoPushToken);
      if (Platform.OS === 'android') await this.setupAndroidChannels();
      this.notificationSubscription = Notifications.addNotificationReceivedListener(this.handleNotificationReceived);
      this.responseSubscription = Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
    } catch (error: any) {
      // Silent failure — push notifications are non-critical
    }
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return data;
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS.REGISTER, {
        token,
        platform: Platform.OS,
        deviceId: Constants.installationId,
      });
    } catch {
      // Token registration failure is non-critical
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages', importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250], lightColor: '#FF6B6B',
    });
    await Notifications.setNotificationChannelAsync('calls', {
      name: 'Calls', importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000],
    });
    await Notifications.setNotificationChannelAsync('matches', {
      name: 'Matches', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  private handleNotificationReceived = (notification: Notifications.Notification): void => {
    const data = notification.request.content.data;
    if (data?.type === 'message' && data.conversationId) {
      useAppStore.getState().incrementUnread(data.conversationId as string);
    }
  };

  private handleNotificationResponse = (response: Notifications.NotificationResponse): void => {
    const data = response.notification.request.content.data;
    if (!this.navigationCallback || !data) return;

    switch (data.type) {
      case 'message':
        this.navigationCallback('Chat', { conversationId: data.conversationId });
        break;
      case 'match':
        this.navigationCallback('Matches');
        break;
      case 'call':
        this.navigationCallback('IncomingCall', {
          callerId: data.callerId,
          callerName: data.callerName,
          callType: data.callType || 'voice',
        });
        break;
      case 'like':
        this.navigationCallback('Likes');
        break;
      default:
        this.navigationCallback('Main');
        break;
    }
  };

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  destroy(): void {
    this.notificationSubscription?.remove();
    this.responseSubscription?.remove();
  }
}
