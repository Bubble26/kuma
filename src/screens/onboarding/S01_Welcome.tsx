import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S01_Welcome'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Ambient Particle config ────────────────────────────────────────────
const NUM_PARTICLES = 10;
const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  id: i,
  startX: Math.random() * SCREEN_WIDTH,
  size: 3 + Math.random() * 5, // 3-8px
  duration: 6000 + Math.random() * 6000, // 6-12s drift cycle
  delay: Math.random() * 4000,
  opacity: 0.15 + Math.random() * 0.25, // 0.15-0.4
}));

// ─── Feature items ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🔍', label: 'Scan\nproducts' },
  { icon: '💧', label: 'Check\nyour water' },
  { icon: '📺', label: 'Safe\nshows' },
];

export default function S01_Welcome({ navigation }: Props) {
  // ─── Animation values ───────────────────────────────────────────────
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(0.9)).current;
  const mamaBob = useRef(new Animated.Value(0)).current;
  const cubBob = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresTranslate = useRef(new Animated.Value(15)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslate = useRef(new Animated.Value(10)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Particle anims
  const particleAnims = useRef(
    PARTICLES.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Mascot fade in (800ms)
    Animated.parallel([
      Animated.timing(mascotOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(mascotScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Mama bob loop (3.5s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(mamaBob, {
          toValue: -5,
          duration: 1750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(mamaBob, {
          toValue: 0,
          duration: 1750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Cub bob loop (2.8s, slightly offset)
    timers.push(
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(cubBob, {
              toValue: -6,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(cubBob, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 300)
    );

    // 4. Glow pulse loop (4s)
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Wordmark fade in (400ms after mascot)
    timers.push(
      setTimeout(() => {
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }, 800)
    );

    // 6. Tagline fade in (200ms after wordmark)
    timers.push(
      setTimeout(() => {
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }, 1400)
    );

    // 7. Features fade + slide in
    timers.push(
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(featuresOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(featuresTranslate, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, 1800)
    );

    // 8. CTA fade + slide in
    timers.push(
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(ctaOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ctaTranslate, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, 2200)
    );

    // 9. Ambient particles — continuous upward drift loops
    particleAnims.forEach((anim, i) => {
      const particle = PARTICLES[i];
      timers.push(
        setTimeout(() => {
          Animated.loop(
            Animated.timing(anim, {
              toValue: 1,
              duration: particle.duration,
              easing: Easing.linear,
              useNativeDriver: true,
            })
          ).start();
        }, particle.delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Button press handlers ──────────────────────────────────────────
  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('S02_ScaryStat');
    });
  };

  // ─── Derived animated values ────────────────────────────────────────
  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });
  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Background blurred shapes ──────────────────────────────── */}
      <View style={styles.bgBlobTopRight} />
      <View style={styles.bgBlobBottomLeft} />

      {/* ── Ambient particles ──────────────────────────────────────── */}
      {PARTICLES.map((p, i) => {
        const screenHeight = Dimensions.get('window').height;
        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.startX,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                opacity: p.opacity,
                transform: [
                  {
                    translateY: particleAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenHeight * 0.8, -50],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── Header: Wordmark + Tagline ───────────────────────────── */}
        <View style={styles.header}>
          <Animated.Text style={[styles.wordmark, { opacity: wordmarkOpacity }]}>
            Kuma
          </Animated.Text>
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Kuma says what's safe for your child.
          </Animated.Text>
        </View>

        {/* ── Mascot Area ──────────────────────────────────────────── */}
        <View style={styles.mascotContainer}>
          {/* Glow behind mascot */}
          <Animated.View
            style={[
              styles.mascotGlow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* Mama bear */}
          <Animated.View
            style={{
              opacity: mascotOpacity,
              transform: [
                { scale: mascotScale },
                { translateY: mamaBob },
              ],
            }}
          >
            <BearMascot expression="waving" size={220} showBaby={false} />
          </Animated.View>

          {/* Baby cub — offset position + different bob */}
          <Animated.View
            style={[
              styles.cubOffset,
              {
                opacity: mascotOpacity,
                transform: [
                  { scale: mascotScale },
                  { translateY: cubBob },
                ],
              },
            ]}
          >
            <BearMascot expression="neutral" size={100} showBaby={false} />
          </Animated.View>
        </View>

        {/* ── Feature Icons Grid ───────────────────────────────────── */}
        <Animated.View
          style={[
            styles.featuresRow,
            {
              opacity: featuresOpacity,
              transform: [{ translateY: featuresTranslate }],
            },
          ]}
        >
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ── CTA Area ─────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.ctaArea,
            {
              opacity: ctaOpacity,
              transform: [{ translateY: ctaTranslate }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable onPress={handleGetStarted} style={styles.getStartedButton}>
              <Text style={styles.getStartedText}>Get Started</Text>
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={() => {
              // TODO: Navigate to Login screen
            }}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginHighlight}>Log in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream, // '#FFF8F0'
  },

  // Background blobs
  bgBlobTopRight: {
    position: 'absolute',
    top: '-10%',
    right: '-20%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FFE4C5', // surface-container-high
    opacity: 0.4,
  },
  bgBlobBottomLeft: {
    position: 'absolute',
    bottom: '20%',
    left: '-10%',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: COLORS.amber,
    opacity: 0.08,
  },

  // Particles
  particle: {
    position: 'absolute',
    backgroundColor: COLORS.amber,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 32,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 8,
  },
  wordmark: {
    fontFamily: FONT_FAMILY.wordmark,
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.amber,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: FONT_SIZE.lg,
    color: '#4F5E81', // secondary text
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 24,
  },

  // Mascot
  mascotContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  mascotGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.amber,
    opacity: 0.3,
  },
  cubOffset: {
    position: 'absolute',
    bottom: '8%',
    right: '15%',
  },

  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FCDEBA', // surface-container-highest
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  featureEmoji: {
    fontSize: 26,
  },
  featureLabel: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: 10,
    color: '#524435', // on-surface-variant
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 14,
  },

  // CTA
  ctaArea: {
    paddingBottom: 16,
    gap: 20,
    alignItems: 'center',
  },
  getStartedButton: {
    width: SCREEN_WIDTH - 64,
    height: 56,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    // Amber shadow
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
  getStartedText: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.lg,
    color: '#482B00', // on-primary-container (dark on amber)
    letterSpacing: 0.3,
  },
  loginLink: {
    paddingVertical: 4,
  },
  loginText: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
    color: '#4F5E81', // secondary
  },
  loginHighlight: {
    fontFamily: FONT_FAMILY.buttonLabel,
    color: COLORS.amber,
  },
});
