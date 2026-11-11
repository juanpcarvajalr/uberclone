// AI-assisted: see docs/AI_LOG.md #68
import { PermissionsAndroid, Platform } from 'react-native';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Returns the default Firebase Messaging instance.
 * @returns {import('@react-native-firebase/messaging').Messaging}
 */
function messaging() {
  return getMessaging();
}

/**
 * Requests POST_NOTIFICATIONS on Android 13+ before reading the FCM token.
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    const authStatus = await requestPermission(messaging());
    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.warn(
      'requestNotificationPermission failed:',
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}

/**
 * Returns the native FCM device token after permission is granted.
 * @returns {Promise<string|null>}
 */
export async function getFcmToken() {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      return null;
    }
    await registerDeviceForRemoteMessages(messaging());
    const token = await getToken(messaging());
    return token ? String(token) : null;
  } catch (error) {
    console.warn(
      'getFcmToken failed:',
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

/**
 * Persists the FCM token on the driver document.
 * @param {string} uid
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function saveDriverFcmToken(uid, token) {
  if (!uid || !token) {
    return;
  }
  await updateDoc(doc(db, 'drivers', uid), {
    fcmToken: token,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Subscribes to FCM token refresh.
 * @param {(token: string) => void} handler
 * @returns {() => void}
 */
export function subscribeToTokenRefresh(handler) {
  return onTokenRefresh(messaging(), (token) => {
    handler(String(token));
  });
}

/**
 * Subscribes to foreground data/notification messages.
 * @param {(remoteMessage: object) => void} handler
 * @returns {() => void}
 */
export function subscribeToForegroundMessages(handler) {
  return onMessage(messaging(), async (remoteMessage) => {
    handler(remoteMessage);
  });
}
