import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';
import ProgressBar from '../../components/shared/ProgressBar';
import { getConditionColor } from '../../components/shared/ConditionBadge';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S27_ProfileReveal'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STAT_STAGGER = 150;
const STAT_DURATION = 600;

const CONDITION_LABELS: Record<string, string> = {
  eczema: 'Eczema', adhd: 'ADHD', food_allergies: 'Food Allergies',
  asthma: 'Asthma', celiac: 'Celiac', skin_sensitivities: 'Skin Sensitive',
  autism_sensory: 'Sensory',
};

// ─── Count-up hook ──────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, delay: number, onDone?: () => void) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress >= 1) {
          clearInterval(interval);
          onDone?.();
        }
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return value;
}

export default function S27_ProfileReveal({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  // Compute stats from context
  const conditionCount = state.conditions.length;
  const symptomCount = state.symptoms.length;
  const allergenCount = state.allergies.length;
  const watchlistCount = Math.max(state.conditions.length * 5, 10) + state.allergies.length * 3;
  const hasWater = !!state.zipCode;
  const hasAge = !!state.childDOB;
  const age = hasAge ? new Date().getFullYear() - parseInt(state.childDOB.split('-')[0]) : 0;

  const stats = useMemo(() => [
    { label: 'Conditions', value: conditionCount, display: String(conditionCount) },
    { label: 'Symptoms', value: symptomCount, display: String(symptomCount) },
    { label: 'Allergens', value: allergenCount, display: String(allergenCount) },
    { label: 'Watchlist', value: watchlistCount, display: String(watchlistCount) },
    { label: 'Water', value: 0, display: hasWater ? 'ON' : '—' },
    { label: 'Shows', value: 0, display: hasAge ? `Ages ${age}-${age + 3}` : 'All ages' },
  ], []);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;

  // Condition pills
  const pillAnims = useRef(
    state.conditions.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-16),
    }))
  ).current;

  // Stats
  const statAnims = useRef(stats.map(() => new Animated.Value(0))).current;
  const [statsDone, setStatsDone] = useState(false);

  // Risk comparison
  const riskOpacity = useRef(new Animated.Value(0)).current;
  const [riskScore, setRiskScore] = useState(0);
  const targetOpacity = useRef(new Animated.Value(0)).current;
  const arrowWidth = useRef(new Animated.Value(0)).current;

  // Footer
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.timing(headingOpacity, {
      toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    // 2. Profile card springs up (500ms)
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardTranslate, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]).start();
    }, 300));

    // 3. Condition pills stagger after card
    state.conditions.forEach((_, i) => {
      timers.push(setTimeout(() => {
        Animated.parallel([
          Animated.timing(pillAnims[i].opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(pillAnims[i].translateX, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
        ]).start();
      }, 900 + i * 100));
    });

    // 4. Stats count up staggered
    const statsStartTime = 1200;
    stats.forEach((stat, i) => {
      const delay = statsStartTime + i * STAT_STAGGER;
      timers.push(setTimeout(() => {
        Animated.timing(statAnims[i], { toValue: 1, duration: 300, useNativeDriver: true }).start();
        // Haptic when stat "lands"
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (i === stats.length - 1) setStatsDone(true);
        }, STAT_DURATION);
      }, delay));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // After stats complete → risk comparison
  useEffect(() => {
    if (!statsDone) return;
    const timers: NodeJS.Timeout[] = [];

    // Risk section fades in
    Animated.timing(riskOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Count 0→73 coral
    const startTime = Date.now();
    const interval = setInterval(() => {
      const p = Math.min((Date.now() - startTime) / 800, 1);
      setRiskScore(Math.round(p * 73));
      if (p >= 1) {
        clearInterval(interval);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // After 400ms: target 91 + arrow
        timers.push(setTimeout(() => {
          Animated.timing(targetOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
          Animated.timing(arrowWidth, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400));

        // Footer + button
        timers.push(setTimeout(() => {
          Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
          Animated.parallel([
            Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]).start();
        }, 800));
      }
    }, 16);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [statsDone]);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S28_RatingPrompt');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={27} total={31} variant="dark" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Animated.Text style={[styles.heading, { opacity: headingOpacity }]}>
            Meet {childName}'s Guardian.
          </Animated.Text>

          {/* Profile Card */}
          <Animated.View
            style={[styles.profileCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}
          >
            {/* Name + conditions */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarEmoji}>🐻</Text>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{childName}</Text>
                <View style={styles.pillsRow}>
                  {state.conditions.slice(0, 3).map((cond, i) => (
                    <Animated.View
                      key={cond}
                      style={[
                        styles.condPill,
                        { backgroundColor: getConditionColor(cond), opacity: pillAnims[i]?.opacity ?? 1, transform: [{ translateX: pillAnims[i]?.translateX ?? 0 }] },
                      ]}
                    >
                      <Text style={styles.condPillText}>{CONDITION_LABELS[cond] || cond}</Text>
                    </Animated.View>
                  ))}
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {stats.map((stat, i) => (
                <Animated.View key={stat.label} style={[styles.statBox, { opacity: statAnims[i] }]}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.display}</Text>
                </Animated.View>
              ))}
            </View>

            {/* Risk Comparison */}
            <Animated.View style={[styles.riskSection, { opacity: riskOpacity }]}>
              <Text style={styles.riskLabel}>Health Shield Score</Text>
              <View style={styles.riskRow}>
                <View>
                  <Text style={styles.riskCurrent}>{riskScore}/100</Text>
                </View>
                <Animated.View style={[styles.riskArrow, {
                  width: arrowWidth.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }),
                }]}>
                  <Text style={styles.arrowText}>→</Text>
                </Animated.View>
                <Animated.View style={{ opacity: targetOpacity }}>
                  <Text style={styles.riskTarget}>91/100</Text>
                  <Text style={styles.riskTargetSub}>Average after{'\n'}30 days</Text>
                </Animated.View>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Footer text */}
          <Animated.Text style={[styles.footerText, { opacity: footerOpacity }]}>
            {childName} has {watchlistCount} ingredients on the watchlist. Start scanning to find and replace them.
          </Animated.Text>
        </ScrollView>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>Let's go.</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CARD_BG },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center', marginBottom: 20,
  },

  // Profile card
  profileCard: {
    backgroundColor: CARD_BG, borderRadius: RADIUS.card, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.3, shadowRadius: 64, elevation: 10,
  },

  // Header
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24,
  },
  avatarWrap: { position: 'relative' },
  avatarEmoji: {
    fontSize: 36, width: 56, height: 56, textAlign: 'center', textAlignVertical: 'center',
    backgroundColor: '#FFE4C5', borderRadius: 28, overflow: 'hidden', lineHeight: 56,
    borderWidth: 2, borderColor: 'rgba(212,137,14,0.3)',
  },
  onlineDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.safe, borderWidth: 2, borderColor: CARD_BG,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: FONT_FAMILY.heading, fontSize: 20, color: COLORS.amber, marginBottom: 6,
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  condPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  condPillText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10, color: COLORS.white,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20,
  },
  statBox: {
    width: (SCREEN_WIDTH - 48 - 40 - 8) / 2, // half card width minus padding/gap
    backgroundColor: 'rgba(30,46,84,0.5)', borderRadius: RADIUS.sm,
    padding: 14, borderWidth: 1, borderColor: 'rgba(100,120,160,0.15)',
  },
  statLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: 'rgba(148,163,184,1)', textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: COLORS.cream,
  },

  // Risk
  riskSection: {
    borderTopWidth: 1, borderTopColor: 'rgba(30,46,84,0.8)', paddingTop: 20,
  },
  riskLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: 'rgba(148,163,184,1)', textTransform: 'uppercase', letterSpacing: 1.5,
    marginBottom: 8,
  },
  riskRow: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  riskCurrent: {
    fontFamily: FONT_FAMILY.heading, fontSize: 32, color: COLORS.coral, lineHeight: 36,
  },
  riskArrow: {
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  arrowText: {
    fontFamily: FONT_FAMILY.heading, fontSize: 24, color: COLORS.safe,
  },
  riskTarget: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 16, color: COLORS.safe, textAlign: 'right',
  },
  riskTargetSub: {
    fontFamily: FONT_FAMILY.body, fontSize: 10, color: 'rgba(100,116,139,1)',
    textAlign: 'right', lineHeight: 14, marginTop: 2,
  },

  // Footer
  footerText: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm, lineHeight: 22,
    color: 'rgba(255,248,240,0.55)', textAlign: 'center',
    paddingHorizontal: 16, marginTop: 24, marginBottom: 8,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
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
