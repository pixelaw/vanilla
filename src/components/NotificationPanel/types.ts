export type UnifiedItem = {
  id: string;
  type: 'notification' | 'error';
  timestamp: number;
  coordinate?: [number, number];
  message: string;
  title?: string;
  appName?: string;
};

export type NotificationPanelProps = {
  className?: string;
};