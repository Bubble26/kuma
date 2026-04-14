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
import ScoreRing from '../../components/shared/ScoreRing';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S21_CommunityRatings'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Rating bar data ────────────────────────────────────────────────────
interface RatingBar {
  conditionId: string;
  label: string;
  percent: number;
  color: string;
  count: number;
}

const ALL_BARS: RatingBar[] = [
  { conditionId: 'eczema', label: 'Eczema parents', percent: 92, color: COLORS.safe, count: 234 },
  { conditionId: 'adhd', label: 'ADHD parents', percent: 78, color: COLORS.caution, count: 187 },
  { conditionId: 'food_allergies', label: 'Food allergy parents', percent: 95, color: COLORS.safe, count: 312 },
  { conditionId: 'asthma', label: 'Asthma parents', percent: 88, color: COLORS.safe, count: 156 },
  { conditionId: 'celiac', label: 'Celiac parents', percent: 91, color: COLORS.safe, count: 98 },
  { conditionId: 'skin_sensitivities', label: 'Sensitive skin parents', percent: 85, color: COLORS.safe, count: 203 },
  { conditionId: 'autism_sensory', label: 'Sensory parents', percent: 83, color: COLORS.caution, count: 127 },
];

const GENERAL_BARS: RatingBar[] = [
  { conditionId: 'general1', label: 'All parents', percent: 89, color: COLORS.safe, count: 1247 },
  { conditionId: 'general2', label: 'Parents of toddlers', percent: 91, color: COLORS.safe, count: 534 },
  { conditionId: 'general3', label: 'Parents of preschoolers', percent: 87, color: COLORS.safe, count: 412 },
];

const BAR_STAGGER = 200;
const BAR_DURATION = 800;

export default function S21_CommunityRatings({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  // Pick bars dynamically based on conditions
  const bars = useMemo(() => {
    if (state.conditions.length === 0) return GENERAL_BARS;
    const matched = ALL_BARS.filter((b) => state.conditions.includes(b.conditionId));
    // Pad to 3 if fewer matched
    if (matched.length < 3) {
      const extra = ALL_BARS.filter((b) => !state.conditions.includes(b.conditionId));
      return [...matched, ...extra.slice(0, 3 - matched.length)];
    }
    return matched.slice(0, 3);
  }, [state.conditions]);

  const [showScore, setShowScore] = useState(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(12)).current;

  // Community section
  const communityOpacity = useRef(new Animated.Value(0)).current;
  const communityTranslate = useRef(new Animated.Value(16)).current;

  // Bar fills (animated width 0→1)
  const barWidths = useRef(bars.map(() => new Animated.Value(0))).current;
  // Rating counts fade in per bar
  const countOpacities = useRef(bars.map(() => new Animated.Value(0))).current;

  // Footer
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    timers.push(setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300));

    // 2. Product card
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(cardTranslate, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
      setTimeout(() => setShowScore(true), 200);
    }, 500));

    return () => timers.forEach(clearTimeout);
  }, []);

  // After score completes
  const handleScoreComplete = () => {
    const timers: NodeJS.Timeout[] = [];

    // 3. Community section slides up
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(communityOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(communityTranslate, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
      ]).start();
    }, 300));

    // 4. Bars fill staggered
    bars.forEach((_, i) => {
      const delay = 600 + i * BAR_STAGGER;
      timers.push(setTimeout(() => {
        Animated.timing(barWidths[i], {
          toValue: 1, duration: BAR_DURATION,
          easing: Easing.out(Easing.cubic), useNativeDriver: false,
        }).start();

        // Count fades in after bar fills
        setTimeout(() => {
          Animated.timing(countOpacities[i], { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }, BAR_DURATION);
      }, delay));
    });

    // 5. Footer text + button
    const footerTime = 600 + bars.length * BAR_STAGGER + BAR_DURATION + 300;
    timers.push(setTimeout(() => {
      Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, footerTime));

    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, footerTime + 200));
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S22_LowStimShows');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={21} total={31} variant="dark" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            A community of parents like you.
          </Animated.Text>
          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            Real ratings from parents managing the same conditions as {childName}.
          </Animated.Text>

          {/* Product card */}
          <Animated.View
            style={[styles.productCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}
          >
            <View style={styles.productImage}>
              <Text style={styles.productEmoji}>🧴</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productLabel}>Current Scan</Text>
              <Text style={styles.productName}>Pure Care Body Wash</Text>
              <View style={styles.scoreInline}>
                {showScore ? (
                  <ScoreRing
                    score={87}
                    color={COLORS.safe}
                    size={52}
                    strokeWidth={4}
                    duration={800}
                    hapticStyle="light"
                    onComplete={handleScoreComplete}
                  />
                ) : (
                  <View style={{ width: 52, height: 52 }} />
                )}
                <Text style={styles.scoreSlash}>/100</Text>
              </View>
            </View>
          </Animated.View>

          {/* Community Ratings */}
          <Animated.View
            style={[
              styles.communitySection,
              { opacity: communityOpacity, transform: [{ translateY: communityTranslate }] },
            ]}
          >
            <View style={styles.communityHeader}>
              <Text style={styles.communityTitle}>Community Ratings</Text>
              <Text style={styles.communityIcon}>👥</Text>
            </View>

            {bars.map((bar, i) => (
              <View key={bar.conditionId} style={styles.barGroup}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>
                    {bar.label}:{' '}
                    <Text style={[styles.barPercent, { color: bar.color }]}>
                      {bar.percent}% say safe
                    </Text>
                  </Text>
                  <Animated.Text style={[styles.barCount, { opacity: countOpacities[i] }]}>
                    ({bar.count} ratings)
                  </Animated.Text>
                </View>
                <View style={styles.barTrack}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: bar.color,
                        width: barWidths[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${bar.percent}%`],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}

            <Animated.Text style={[styles.filteredText, { opacity: footerOpacity }]}>
              Every rating filtered by your child's conditions.
            </Animated.Text>
          </Animated.View>
        </ScrollView>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>Almost there.</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.55)', marginBottom: 28,
  },

  // Product card
  productCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.card,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },
  productImage: {
    width: 72, height: 72, borderRadius: RADIUS.sm,
    backgroundColor: '#FFF1E5', alignItems: 'center', justifyContent: 'center',
  },
  productEmoji: { fontSize: 36 },
  productInfo: { flex: 1 },
  productLabel: {
    fontFamily: FONT_FAMILY.body, fontSize: 10,
    color: COLORS.textSecondary, textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 2,
  },
  productName: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary, marginBottom: 6,
  },
  scoreInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreSlash: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  // Community section
  communitySection: { gap: 20 },
  communityHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  communityTitle: {
    fontFamily: FONT_FAMILY.bodySemiBold, fontSize: FONT_SIZE.lg, color: COLORS.cream,
  },
  communityIcon: { fontSize: 20 },

  // Bar
  barGroup: { gap: 6 },
  barLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  barLabel: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm, color: COLORS.cream,
  },
  barPercent: { fontFamily: FONT_FAMILY.buttonLabel },
  barCount: {
    fontFamily: FONT_FAMILY.body, fontSize: 10, color: 'rgba(255,255,255,0.4)',
  },
  barTrack: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: RADIUS.full },

  filteredText: {
    fontFamily: FONT_FAMILY.body, fontSize: 12,
    color: 'rgba(255,248,240,0.5)', fontStyle: 'italic',
    textAlign: 'center', marginTop: 4,
  },

  // CTA
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 52, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: COLORS.white,
  },
});
