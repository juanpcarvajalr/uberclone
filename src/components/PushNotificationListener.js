// AI-assisted: see docs/AI_LOG.md #68
import { useEffect, useRef } from 'react';
import { useDriverSession } from '../context/DriverSessionContext';
import {
  getFcmToken,
  saveDriverFcmToken,
  subscribeToForegroundMessages,
  subscribeToTokenRefresh,
} from '../services/pushNotifications';
import { navigateToIncomingRequest } from '../navigation/navigationRef';

/**
 * Registers native FCM token and handles foreground trip-request messages.
 */
export default function PushNotificationListener() {
  const { driver, isAuthenticated, hasCompletedRegistration } = useDriverSession();
  const savedTokenRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !hasCompletedRegistration || !driver?.uid) {
      return undefined;
    }

    let cancelled = false;
    let unsubscribeRefresh = () => {};

    const persistToken = async (token) => {
      if (!token || cancelled) {
        return;
      }
      if (token === savedTokenRef.current || token === driver.fcmToken) {
        savedTokenRef.current = token;
        return;
      }
      try {
        await saveDriverFcmToken(driver.uid, token);
        savedTokenRef.current = token;
      } catch (error) {
        console.warn(
          'saveDriverFcmToken failed:',
          error instanceof Error ? error.message : String(error)
        );
      }
    };

    (async () => {
      try {
        const token = await getFcmToken();
        await persistToken(token);
      } catch (error) {
        console.warn(
          'FCM registration failed:',
          error instanceof Error ? error.message : String(error)
        );
      }
    })();

    unsubscribeRefresh = subscribeToTokenRefresh((token) => {
      persistToken(token);
    });

    return () => {
      cancelled = true;
      unsubscribeRefresh();
    };
  }, [
    isAuthenticated,
    hasCompletedRegistration,
    driver?.uid,
    driver?.fcmToken,
  ]);

  useEffect(() => {
    const unsubscribe = subscribeToForegroundMessages((remoteMessage) => {
      const data = remoteMessage?.data ?? {};
      if (data?.type === 'incoming_trip') {
        navigateToIncomingRequest();
      }
    });
    return unsubscribe;
  }, []);

  return null;
}
