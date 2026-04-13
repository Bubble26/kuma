import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';

interface AmberButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outline' | 'text';
  style?: ViewStyle;
}

export default function AmberButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  style,
}: AmberButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const buttonStyles = [
    styles.base,
    variant === 'filled' && styles.filled,
    variant === 'outline' && styles.outline,
    variant === 'text' && styles.textVariant,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textColor =
    variant === 'filled' ? COLORS.navyExtraDark :
    variant === 'outline' ? COLORS.amber :
    COLORS.amber;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  filled: {
    backgroundColor: COLORS.amber,
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.amber,
  },
  textVariant: {
    backgroundColor: COLORS.transparent,
    height: 'auto' as any,
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: FONT_SIZE.base,
    lineHeight: LINE_HEIGHT.base,
    letterSpacing: 0.3,
  },
});
