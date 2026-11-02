// AI-assisted: see docs/AI_LOG.md #30
import React from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { spacing } from '../theme/tokens';

/**
 * ScrollView that keeps scrolling usable while the keyboard is open.
 * @param {{ children: React.ReactNode, style?: object, contentContainerStyle?: object }} props
 */
export default function FormScrollView({
  children,
  style,
  contentContainerStyle,
  ...rest
}) {
  const { keyboardHeight } = useKeyboardHeight();

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        styles.content,
        contentContainerStyle,
        { paddingBottom: spacing.xxl * 2 + keyboardHeight },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
      nestedScrollEnabled
      bounces
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 0,
  },
});
