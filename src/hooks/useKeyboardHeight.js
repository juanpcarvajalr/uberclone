// AI-assisted: see docs/AI_LOG.md #30
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Tracks the on-screen keyboard height.
 * @returns {{ keyboardHeight: number, isKeyboardVisible: boolean }}
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardVisible: keyboardHeight > 0,
  };
}
