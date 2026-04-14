import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiProps {
  count?: number;
  duration?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [COLORS.amber, COLORS.safe, COLORS.softGold, '#81C784', '#FFD98E'];

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
}

function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    size: 4 + Math.random() * 6, // 4-10px
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: 1400 + Math.random() * 900, // 1.4-2.3s
    delay: Math.random() * 400,
    drift: -50 + Math.random() * 100, // -50 to 50px horizontal drift
  }));
}

export default function Confetti({
  count = 28,
  duration = 2500,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const particles = useRef(generateParticles(count, colors)).current;
  const anims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = particles.map((p, i) =>
      Animated.timing(anims[i], {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-20, SCREEN_HEIGHT * 0.7],
        });
        const translateX = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, p.drift],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.15, 0.8, 1],
          outputRange: [0, 1, 1, 0],
        });
        const rotate = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${Math.random() * 360}deg`],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                width: p.size,
                height: p.size,
                borderRadius: p.size > 6 ? 2 : p.size / 2,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
