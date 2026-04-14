import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S26_FakeLoading'>;

const ITEM_INTERVAL = 800;
const CONDITION_LABELS: Record<string, string> = {
  eczema: 'eczema', adhd: 'ADHD', food_allergies: 'food allergies',
  asthma: 'asthma', celiac: 'celiac', skin_sensitivities: 'skin sensitivities',
  autism_sensory: 'autism/sensory',
};

export default function S26_FakeLoading({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  // Build dynamic checklist
  const items = useMemo(() => {
    const list: string[] = [];

    // 1. Conditions
    const conditionNames = state.conditions.map((c) => CONDITION_LABELS[c] || c).join(', ');
    list.push(`${childName}'s conditions loaded — ${conditionNames || 'general profile'}`);

    // 2. Watchlist count (mock: 5 per condition, min 10)
    const count = Math.max(state.conditions.length * 5, 10);
    list.push(`${count} trigger ingredients added to watchlist`);

    // 3. Allergens (skip if empty)
    if (state.allergies.length > 0) {
      list.push(`Allergen database synced — ${state.allergies.join(', ')}`);
    }

    // 4. Zip (skip if empty)
    if (state.zipCode) {
      list.push(`Tap water alerts activated for ${state.zipCode}`);
    }

    // 5. Age (skip if no DOB)
    if (state.childDOB) {
      const birthYear = parseInt(state.childDOB.split('-')[0]);
      const age = new Date().getFullYear() - birthYear;
      list.push(`Show safety ratings calibrated for age ${age}`);
    }

    // 6. Always last
    list.push('Parent community access enabled');

    return list;
  }, [state]);

  const [completedCount, setCompletedCount] = useState(0);

  // ─── Animation values ───────────────────────────────────────────────
  const progressWidth = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;

  // Per-item: opacity + check scale
  const itemAnims = useRef(
    items.map(() => ({
      opacity: new Animated.Value(0),
      checkScale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Progress bar: 0→82% over 4 seconds
    Animated.timing(progressWidth, {
      toValue: 0.82,
      duration: 4000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Checklist items stagger (800ms apart)
    items.forEach((_, i) => {
      const delay = 800 + i * ITEM_INTERVAL;

      timers.push(setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Fade in
        Animated.timing(itemAnims[i].opacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }).start();

        // Check spring
        Animated.spring(itemAnims[i].checkScale, {
          toValue: 1, friction: 4, tension: 120, useNativeDriver: true,
        }).start();

        setCompletedCount(i + 1);
      }, delay));
    });

    // After final item: progress jumps to 100%
    const finalItemTime = 800 + items.length * ITEM_INTERVAL;

    timers.push(setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, finalItemTime + 200));

    // Auto-navigate after 500ms pause
    timers.push(setTimeout(() => {
      navigation.replace('S27_ProfileReveal');
    }, finalItemTime + 1000));

    return () => timers.forEach(clearTimeout);
  }, []);

  const progressPercent = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Bear + glow */}
          <View style={styles.bearSection}>
            <Animated.View style={[styles.bearGlow, { opacity: glowOpacity }]} />
            <BearMascot expression="protective" size={100} showBaby={true} />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            Building {childName}'s Guardian Profile...
          </Text>
          <Text style={styles.subheading}>Personalizing safety settings</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressPercent },
              ]}
            />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              {Math.round(completedCount / items.length * 82)}% Complete
            </Text>
          </View>

          {/* Checklist */}
          <View style={styles.checklist}>
            {items.map((item, i) => {
              const isCompleted = i < completedCount;
              const isCurrent = i === completedCount;

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.checkItem,
                    isCurrent && styles.checkItemActive,
                    i >= completedCount && !isCurrent && styles.checkItemPending,
                    { opacity: i <= completedCount ? itemAnims[Math.min(i, itemAnims.length - 1)]?.opacity ?? 1 : 0.35 },
                  ]}
                >
                  {isCompleted ? (
                    <Animated.View
                      style={[
                        styles.checkCircle,
                        { transform: [{ scale: itemAnims[i]?.checkScale ?? 1 }] },
                      ]}
                    >
                      <Text style={styles.checkMark}>✓</Text>
                    </Animated.View>
                  ) : isCurrent ? (
                    <Text style={styles.spinner}>⏳</Text>
                  ) : (
                    <View style={styles.pendingCircle} />
                  )}
                  <Text
                    style={[
                      styles.checkText,
                      isCurrent && styles.checkTextBold,
                      !isCompleted && !isCurrent && styles.checkTextDim,
                    ]}
                  >
                    {item}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Step counter */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Progress: 26/31</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  safeArea: { flex: 1 },

  content: {
    flex: 1, paddingHorizontal: 24, paddingTop: 32,
    alignItems: 'center',
  },

  // Bear
  bearSection: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, position: 'relative',
  },
  bearGlow: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: COLORS.amber,
  },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 18,
    color: COLORS.cream, textAlign: 'center',
    letterSpacing: -0.3, marginBottom: 6,
  },
  subheading: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: '#b7c6ee', marginBottom: 24,
  },

  // Progress
  progressTrack: {
    height: 10, width: '100%', backgroundColor: '#0d162b',
    borderRadius: RADIUS.full, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.amber, borderRadius: RADIUS.full,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  progressLabelRow: { width: '100%', alignItems: 'flex-end', marginBottom: 24 },
  progressLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 12,
    color: '#ffb95e', textTransform: 'uppercase', letterSpacing: 2,
  },

  // Checklist
  checklist: { width: '100%', gap: 8 },
  checkItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  checkItemActive: {
    backgroundColor: 'rgba(212,137,14,0.08)',
    borderWidth: 1, borderColor: 'rgba(212,137,14,0.2)',
  },
  checkItemPending: {
    opacity: 0.35,
  },
  checkCircle: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#ffb95e',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkMark: { fontSize: 12, color: '#482B00', fontWeight: '700' },
  spinner: { fontSize: 18, marginTop: -1 },
  pendingCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(255,248,240,0.2)',
    marginTop: 1,
  },
  checkText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: COLORS.cream, flex: 1, lineHeight: 20,
  },
  checkTextBold: { fontFamily: FONT_FAMILY.buttonLabel },
  checkTextDim: { color: 'rgba(255,248,240,0.5)' },

  // Step badge
  stepBadge: {
    alignSelf: 'center', marginBottom: 24,
    backgroundColor: 'rgba(13,22,43,0.8)', borderRadius: RADIUS.full,
    paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,248,240,0.05)',
  },
  stepText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: '#ffb95e', textTransform: 'uppercase', letterSpacing: 3,
  },
});
