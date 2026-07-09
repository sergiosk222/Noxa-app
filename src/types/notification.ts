import type { Ionicons } from '@expo/vector-icons';

export type NotificationType = 'event' | 'social' | 'crew' | 'car' | 'comment' | 'achievement';

export type NotificationSection = 'Today' | 'Earlier';

export type NotificationFilter = 'all' | 'events' | 'social' | 'crews';

export type NoxaNotification = {
  id: string;
  section: NotificationSection;
  type: NotificationType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
  isImportant?: boolean;
  actionLabel?: 'View' | 'Open';
  deepLink?: string;
};
