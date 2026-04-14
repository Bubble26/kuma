import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { FONT_FAMILY } from '../../theme/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  hapticStyle?: 'light' | 'medium';
  onComplete?: () => void;
}

export default function ScoreRing({
  score,
  color,
  size = 68,
  strokeWidth = 4,
  duration = 800,
  delay = 0,
  hapticStyle = 'light',
  onComplete,
}: ScoreRingProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const animProgress = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Animate progress 0 → 1
      Animated.timing(animProgress, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // strokeDashoffset can't use native driver
      }).start();

      // Count up the number
      const startTime = Date.now();
      const countInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setDisplayCount(Math.round(eased * score));

        if (progress >= 1) {
          clearInterval(countInterval);
          const style = hapticStyle === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light;
          Haptics.impactAsync(style);
          onComplete?.();
        }
      }, 16);

      return () => clearInterval(countInterval);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Interpolate strokeDashoffset
  const strokeDashoffset = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * (1 - score / 100)],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated fill */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      {/* Score number overlay */}
      <View style={styles.numberOverlay}>
        <Text style={[styles.number, { color, fontSize: size * 0.41 }]}>
          {displayCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: FONT_FAMILY.heading,
  },
});
