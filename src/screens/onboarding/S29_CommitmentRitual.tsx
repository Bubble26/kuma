import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S29_CommitmentRitual'>;

const HOLD_DURATION = 3000;
const HAPTIC_INTERVAL = 600;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Burst particle config
const NUM_PARTICLES = 8;
const PARTICLES = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  angle: (i / NUM_PARTICLES) * 2 * Math.PI,
}));

export default function S29_CommitmentRitual({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  const [isHolding, setIsHolding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hapticTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hapticCountRef = useRef(0);
  const holdStartRef = useRef(0);

  // ─── Animation values ───────────────────────────────────────────────
  const bearOpacity = useRef(new Animated.Value(0.3)).current;
  const cubOpacity = useRef(new Animated.Value(0.05)).current;
  const glowScale = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const warmTint = useRef(new Animated.Value(0)).current;

  // Text
  const instructionOpacity = useRef(new Animated.Value(0.6)).current;
  const holdHintOpacity = useRef(new Animated.Value(0)).current;
  const completeTextOpacity = useRef(new Animated.Value(0)).current;

  // Burst particles
  const burstAnims = useRef(
    PARTICLES.map(() => ({
      progress: new Animated.Value(0),
    }))
  ).current;

  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (hapticTimerRef.current) clearInterval(hapticTimerRef.current);
    };
  }, []);

  // ─── Hold start ─────────────────────────────────────────────────────
  const handlePressIn = useCallback(() => {
    if (isComplete) return;
    setIsHolding(true);
    holdStartRef.current = Date.now();
    hapticCountRef.current = 0;

    // Progressive animations over 3 seconds
    Animated.parallel([
      Animated.timing(bearOpacity, { toValue: 1, duration: HOLD_DURATION, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1, duration: HOLD_DURATION, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.5, duration: HOLD_DURATION, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(warmTint, { toValue: 0.08, duration: HOLD_DURATION, easing: Easing.linear, useNativeDriver: true }),
    ]).start();

    // Cub becomes visible at 2s mark
    setTimeout(() => {
      if (holdStartRef.current > 0) {
        Animated.timing(cubOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }
    }, 2000);

    // Haptic pulses every 600ms (3 light, 2 medium)
    const doHaptic = () => {
      hapticCountRef.current++;
      const style = hapticCountRef.current <= 3
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium;
      Haptics.impactAsync(style);
    };
    doHaptic(); // first immediately
    hapticTimerRef.current = setInterval(doHaptic, HAPTIC_INTERVAL);

    // Completion timer
    holdTimerRef.current = setTimeout(() => {
      handleComplete();
    }, HOLD_DURATION);
  }, [isComplete]);

  // ─── Hold release (before complete) ─────────────────────────────────
  const handlePressOut = useCallback(() => {
    if (isComplete) return;
    setIsHolding(false);
    holdStartRef.current = 0;

    // Cancel timers
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (hapticTimerRef.current) { clearInterval(hapticTimerRef.current); hapticTimerRef.current = null; }

    // Reverse animations
    Animated.parallel([
      Animated.timing(bearOpacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      Animated.timing(cubOpacity, { toValue: 0.05, duration: 300, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(warmTint, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Flash "Hold for 3 seconds..."
    Animated.sequence([
      Animated.timing(holdHintOpacity, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(holdHintOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [isComplete]);

  // ─── Completion ─────────────────────────────────────────────────────
  const handleComplete = () => {
    setIsComplete(true);
    setIsHolding(false);
    if (hapticTimerRef.current) { clearInterval(hapticTimerRef.current); hapticTimerRef.current = null; }

    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Burst particles
    burstAnims.forEach((p) => {
      Animated.timing(p.progress, {
        toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start();
    });

    // Cross-fade text: instruction → "You're in."
    Animated.timing(instructionOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(completeTextOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300);

    // Button after 800ms
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 800);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S30_ReferralGate');
    });
  };

  // Glow transform
  const glowTransform = {
    transform: [
      { scale: glowScale.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.5] }) },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Warm tint overlay */}
      <Animated.View style={[styles.warmOverlay, { opacity: warmTint }]} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Glow behind bears */}
          <Animated.View style={[styles.glow, glowTransform, { opacity: glowOpacity }]} />

          {/* Burst particles (only on complete) */}
          {isComplete && PARTICLES.map((p, i) => {
            const translateX = burstAnims[i].progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(p.angle) * 80],
            });
            const translateY = burstAnims[i].progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(p.angle) * 80],
            });
            const opacity = burstAnims[i].progress.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [1, 1, 0],
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  { opacity, transform: [{ translateX }, { translateY }] },
                ]}
              />
            );
          })}

          {/* Bear touch area */}
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.touchTarget}
            disabled={isComplete}
          >
            {/* Mama bear */}
            <Animated.View style={[styles.bearWrap, { opacity: bearOpacity }]}>
              <View style={styles.mamaBear}>
                <Text style={styles.bearEmoji}>🐻</Text>
              </View>
            </Animated.View>

            {/* Baby cub */}
            <Animated.View style={[styles.cubWrap, { opacity: cubOpacity }]}>
              <Text style={styles.cubEmoji}>🧸</Text>
            </Animated.View>
          </Pressable>

          {/* Instruction text */}
          <Animated.Text style={[styles.instruction, { opacity: instructionOpacity }]}>
            Tap and hold to commit to{'\n'}protecting {childName}.
          </Animated.Text>

          {/* "Hold for 3 seconds..." hint */}
          <Animated.Text style={[styles.holdHint, { opacity: holdHintOpacity }]}>
            Hold for 3 seconds...
          </Animated.Text>

          {/* "You're in." complete text */}
          <Animated.Text style={[styles.completeText, { opacity: completeTextOpacity }]}>
            You're in.
          </Animated.Text>
        </View>

        {/* Button (only after complete) */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>I'm committed.</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1528' },
  warmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.amber,
    zIndex: 0,
  },
  safeArea: { flex: 1, zIndex: 1 },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // Glow
  glow: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: COLORS.amber, opacity: 0.3,
  },

  // Burst particles
  particle: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.amber,
  },

  // Touch target (200x200)
  touchTarget: {
    width: 200, height: 200,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  bearWrap: { alignItems: 'center', justifyContent: 'center' },
  mamaBear: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  bearEmoji: { fontSize: 80 },
  cubWrap: {
    position: 'absolute', bottom: 10, right: 20,
  },
  cubEmoji: { fontSize: 40 },

  // Text
  instruction: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.base, lineHeight: 24,
    color: COLORS.cream, textAlign: 'center',
  },
  holdHint: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: COLORS.cream, textAlign: 'center',
    position: 'absolute', bottom: '22%',
  },
  completeText: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22,
    color: COLORS.amber, textAlign: 'center',
    position: 'absolute', bottom: '28%',
  },

  // Button
  footer: {
    paddingHorizontal: 28, paddingBottom: 24,
  },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
  buttonArrow: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.xl, color: '#482B00',
  },
});
