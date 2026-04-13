import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';

interface ConditionBadgeProps {
  label: string;
  color?: string;
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md';
}

const CONDITION_COLORS: Record<string, string> = {
  eczema: '#E57373',
  food_allergies: '#F5B041',
  adhd: '#64B5F6',
  asthma: '#81C784',
  sensory: '#CE93D8',
  autism: '#4DD0E1',
  default: COLORS.amber,
};

export function getConditionColor(condition: string): string {
  return CONDITION_COLORS[condition.toLowerCase().replace(/\s+/g, '_')] ?? CONDITION_COLORS.default;
}

export default function ConditionBadge({
  label,
  color,
  variant = 'filled',
  size = 'md',
}: ConditionBadgeProps) {
  const badgeColor = color ?? getConditionColor(label);
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSm && styles.badgeSm,
        variant === 'filled'
          ? { backgroundColor: badgeColor + '1A' }
          : { borderWidth: 1, borderColor: badgeColor + '66' },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      <Text
        style={[
          styles.label,
          isSm && styles.labelSm,
          { color: badgeColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  badgeSm: {
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.sm,
  },
  labelSm: {
    fontSize: FONT_SIZE.xs,
  },
});
