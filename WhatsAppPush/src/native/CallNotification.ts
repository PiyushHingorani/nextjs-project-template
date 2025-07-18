import { NativeModules } from 'react-native';

interface CallNotificationInterface {
  showCallNotification(title: string, body: string): void;
  dismissCallNotification(): void;
}

export const CallNotification: CallNotificationInterface = NativeModules.CallNotification;
