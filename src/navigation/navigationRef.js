// AI-assisted: see docs/AI_LOG.md #44
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Navigates to the incoming-request screen from anywhere in the tree.
 * @returns {void}
 */
export function navigateToIncomingRequest() {
  try {
    if (!navigationRef.isReady()) {
      return;
    }
    navigationRef.navigate('Main', {
      screen: 'TripFlow',
      params: { screen: 'IncomingRequest' },
    });
  } catch {
    // ignore navigation races during auth bootstrap
  }
}
