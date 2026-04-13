import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';

interface SkipLinkProps {
  onPress: () => void;
  label?: string;
  variant?: 'dark' | 'light';
}

export default function SkipLink({ onPress, label = 'Skip', variant = 'dark' }: SkipLinkProps) {
  const textColor = variant === 'dark'
    ? 'rgba(255, 248, 240, 0.5)'
    : 'rgba(27, 42, 74, 0.4)';

  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.container}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  text: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
  },
});
