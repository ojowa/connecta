import { NetworkManager } from '../sync/NetworkManager';

export enum MediaPriority {
  PROFILE_PHOTO = 'profile_photo',
  CHAT_IMAGE = 'chat_image',
  CHAT_VIDEO = 'chat_video',
  VOICE_NOTE = 'voice_note',
}

interface SyncRule {
  wifi: boolean;
  cellular4g: boolean;
  cellular3g: boolean;
  offline: boolean;
}

const MEDIA_SYNC_RULES: Record<MediaPriority, SyncRule> = {
  [MediaPriority.PROFILE_PHOTO]: { wifi: true, cellular4g: true, cellular3g: true, offline: false },
  [MediaPriority.CHAT_IMAGE]: { wifi: true, cellular4g: true, cellular3g: false, offline: false },
  [MediaPriority.CHAT_VIDEO]: { wifi: true, cellular4g: false, cellular3g: false, offline: false },
  [MediaPriority.VOICE_NOTE]: { wifi: true, cellular4g: true, cellular3g: true, offline: false },
};

export class MediaSyncStrategy {
  static canUploadNow(priority: MediaPriority): boolean {
    if (!NetworkManager.isConnected()) return false;

    const rule = MEDIA_SYNC_RULES[priority];
    const connectionType = NetworkManager.getConnectionType();

    switch (connectionType) {
      case 'wifi':
        return rule.wifi;
      case 'cellular':
        return this.is4G() ? rule.cellular4g : rule.cellular3g;
      case 'ethernet':
        return rule.wifi;
      default:
        return false;
    }
  }

  static shouldQueue(priority: MediaPriority): boolean {
    return !this.canUploadNow(priority);
  }

  static getUploadPriority(priority: MediaPriority): number {
    switch (priority) {
      case MediaPriority.PROFILE_PHOTO:
        return 0;
      case MediaPriority.CHAT_IMAGE:
        return 1;
      case MediaPriority.VOICE_NOTE:
        return 1;
      case MediaPriority.CHAT_VIDEO:
        return 2;
      default:
        return 3;
    }
  }

  private static is4G(): boolean {
    const type = NetworkManager.getConnectionType();
    return type === 'cellular';
  }
}
