// AI-assisted: see docs/AI_LOG.md #68
import { registerRootComponent } from 'expo';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';

setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
  if (__DEV__) {
    console.log(
      'FCM background message:',
      remoteMessage?.messageId ?? remoteMessage?.data?.type ?? 'unknown'
    );
  }
});

registerRootComponent(App);
