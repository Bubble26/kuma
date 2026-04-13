import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { RADIUS } from '../../theme/spacing';

interface ProgressBarProps {
  current: number;
  total: number;
  variant?: 'dark' | 'light';
}

export default function ProgressBar({ current, total, variant = 'dark' }: ProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const progress = Math.min(current / total, 1);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const trackColor = variant === 'dark'
    ? 'rgba(255, 248, 240, 0.12)'
    : 'rgba(27, 42, 74, 0.08)';

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
  },
});
