import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../services/api/apiClient';
import { useAppStore } from '../store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;
  private notificationSubscription: Notifications.EventSubscription | null = null;
  private responseSubscription: Notifications.EventSubscription | null = null;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) NotificationManager.instance = new NotificationManager();
    return NotificationManager.instance;
  }

  async initialize(): Promise<void> {
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
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return data;
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.post('/notifications/register', {
        token,
        platform: Platform.OS,
        deviceId: Constants.installationId,
      });
    } catch (error) { console.warn('Failed to register token:', error); }
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
    // Navigation handled by deep linking
  };

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  destroy(): void {
    this.notificationSubscription?.remove();
    this.responseSubscription?.remove();
  }
}
