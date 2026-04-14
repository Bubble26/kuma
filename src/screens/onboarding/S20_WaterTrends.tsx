import React, { useEffect, useRef } from 'react';
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
import Svg, { Line, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';
import ProgressBar from '../../components/shared/ProgressBar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S20_WaterTrends'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── Contaminant card data ──────────────────────────────────────────────
interface ContaminantCard {
  name: string;
  level: string;
  status: 'high' | 'safe';
  description: string;
  conditionLink?: string; // only shows if user has this condition
  linkedConditions: string[]; // condition IDs that trigger the link text
}

const CONTAMINANTS: ContaminantCard[] = [
  {
    name: 'PFAS (Forever Chemicals)',
    level: '4.2 ppt',
    status: 'high',
    description: 'Linked to metabolic shifts in children.',
    conditionLink: 'eczema flare-ups',
    linkedConditions: ['eczema', 'skin_sensitivities'],
  },
  {
    name: 'Chlorine',
    level: '0.8 ppm',
    status: 'safe',
    description: 'Currently below EPA health guideline limits.',
    conditionLink: 'respiratory sensitivity',
    linkedConditions: ['asthma'],
  },
];

const MONTHS = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];

// SVG path lengths (approximate)
const TREND_PATH = 'M 0 130 Q 40 125 80 110 T 160 90 T 200 50 T 240 35 T 280 60 T 340 120';
const TREND_LENGTH = 500;

export default function S20_WaterTrends({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';
  const hasZip = !!state.zipCode;
  const zipDisplay = hasZip ? state.zipCode : 'National Average';

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const graphOpacity = useRef(new Animated.Value(0)).current;
  const epaLineDraw = useRef(new Animated.Value(0)).current;
  const trendDraw = useRef(new Animated.Value(0)).current;
  const fillOpacity = useRef(new Animated.Value(0)).current;

  // Cards
  const cardAnims = useRef(
    CONTAMINANTS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(16),
    }))
  ).current;

  // No-zip prompt
  const promptOpacity = useRef(new Animated.Value(0)).current;

  // Footer
  const insightOpacity = useRef(new Animated.Value(0)).current;
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

    // 2. Graph container
    timers.push(setTimeout(() => {
      Animated.timing(graphOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300));

    // 3. EPA limit line (dashed, 500ms)
    timers.push(setTimeout(() => {
      Animated.timing(epaLineDraw, {
        toValue: 1, duration: 500, easing: Easing.inOut(Easing.quad), useNativeDriver: false,
      }).start();
    }, 600));

    // 4. Trend line draws (2s, 500ms delay after EPA)
    timers.push(setTimeout(() => {
      Animated.timing(trendDraw, {
        toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: false,
      }).start();

      // Haptic when crossing EPA limit (~45% through)
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 900);
    }, 1100));

    // 5. Coral fill area fades in
    timers.push(setTimeout(() => {
      Animated.timing(fillOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 2500));

    // 6. Contaminant cards stagger
    CONTAMINANTS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        if (CONTAMINANTS[i].status === 'high') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.parallel([
          Animated.timing(cardAnims[i].opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(cardAnims[i].translateY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
        ]).start();
      }, 3000 + i * 200));
    });

    // 7. No-zip prompt (if skipped)
    if (!hasZip) {
      timers.push(setTimeout(() => {
        Animated.timing(promptOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }, 3000));
    }

    // 8. Insight + button
    const footerTime = 3000 + CONTAMINANTS.length * 200 + 400;
    timers.push(setTimeout(() => {
      Animated.timing(insightOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, footerTime));

    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, footerTime + 200));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S21_CommunityRatings');
    });
  };

  // SVG line interpolations
  const trendDashoffset = trendDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [TREND_LENGTH, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={20} total={31} variant="dark" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}>
            <Text style={styles.zipLabel}>
              {hasZip ? `ZIP: ${state.zipCode}` : 'NATIONAL AVERAGE'}
            </Text>
            <Text style={styles.heading}>{childName}'s Tap Water Report</Text>
          </Animated.View>

          {/* Graph card */}
          <Animated.View style={[styles.graphCard, { opacity: graphOpacity }]}>
            <View style={styles.graphHeader}>
              <View>
                <Text style={styles.graphSubLabel}>12-Month Trend</Text>
                <Text style={styles.graphTitle}>Lead Levels (Pb)</Text>
              </View>
              <View style={styles.graphStat}>
                <Text style={styles.graphStatNumber}>1.8x</Text>
                <Text style={styles.graphStatLabel}>Above EPA</Text>
              </View>
            </View>

            {/* SVG Graph */}
            <View style={styles.graphSvgWrap}>
              <Svg width="100%" height={160} viewBox="0 0 340 160" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="trendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={COLORS.safe} />
                    <Stop offset="45%" stopColor={COLORS.safe} />
                    <Stop offset="55%" stopColor="#ba1a1a" />
                    <Stop offset="85%" stopColor="#ba1a1a" />
                    <Stop offset="100%" stopColor={COLORS.safe} />
                  </LinearGradient>
                </Defs>

                {/* EPA limit line */}
                <Line
                  x1="0" y1="90" x2="340" y2="90"
                  stroke={COLORS.safe} strokeWidth={2}
                  strokeDasharray="4 4" opacity={0.6}
                />

                {/* Exceeded area fill */}
                <Animated.View style={{ opacity: fillOpacity }}>
                  <Path
                    d="M 160 90 L 200 50 L 240 35 L 280 60 L 300 90 Z"
                    fill="#ba1a1a" fillOpacity={0.15}
                  />
                </Animated.View>

                {/* Trend line */}
                <AnimatedPath
                  d={TREND_PATH}
                  fill="none"
                  stroke="url(#trendGrad)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={`${TREND_LENGTH}`}
                  strokeDashoffset={trendDashoffset}
                />
              </Svg>
            </View>

            {/* Month labels */}
            <View style={styles.monthsRow}>
              {MONTHS.map((m) => (
                <Text key={m} style={styles.monthLabel}>{m}</Text>
              ))}
            </View>
          </Animated.View>

          {/* No-zip prompt */}
          {!hasZip && (
            <Animated.View style={[styles.noZipCard, { opacity: promptOpacity }]}>
              <Text style={styles.noZipIcon}>📍</Text>
              <Text style={styles.noZipText}>
                Enter your zip in settings for your local report
              </Text>
            </Animated.View>
          )}

          {/* Contaminant cards */}
          <Text style={styles.sectionLabel}>Detected Substances</Text>

          {CONTAMINANTS.map((c, i) => {
            const isHigh = c.status === 'high';
            const borderColor = isHigh ? '#ba1a1a' : COLORS.safe;
            const statusColor = isHigh ? '#ba1a1a' : COLORS.safe;
            const showConditionLink = c.linkedConditions.some((lc) => state.conditions.includes(lc));

            return (
              <Animated.View
                key={c.name}
                style={[
                  styles.contaminantCard,
                  { borderLeftColor: borderColor, opacity: cardAnims[i].opacity, transform: [{ translateY: cardAnims[i].translateY }] },
                ]}
              >
                <View style={[styles.contaminantIcon, { backgroundColor: statusColor + '15' }]}>
                  <Text style={{ fontSize: 18 }}>{isHigh ? '⚠' : '✓'}</Text>
                </View>
                <View style={styles.contaminantContent}>
                  <View style={styles.contaminantHeader}>
                    <Text style={styles.contaminantName}>{c.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {isHigh ? 'High' : 'Safe'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.contaminantDesc}>
                    Measured at <Text style={styles.levelBold}>{c.level}</Text>.{' '}
                    {c.description}
                    {showConditionLink && c.conditionLink && (
                      <Text style={styles.conditionLinkText}>
                        {' '}Linked to <Text style={styles.conditionLinkHighlight}>{c.conditionLink}</Text> in children.
                      </Text>
                    )}
                  </Text>
                </View>
              </Animated.View>
            );
          })}

          {/* Insight */}
          <Animated.Text style={[styles.insightText, { opacity: insightOpacity }]}>
            "Kuma monitors your water and alerts you to changes."
          </Animated.Text>
        </ScrollView>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>What else?</Text>
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },

  // Header
  header: { marginBottom: 20 },
  zipLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 12,
    color: COLORS.amber, textTransform: 'uppercase', letterSpacing: 3,
    marginBottom: 4,
  },
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 20, lineHeight: 28,
    color: COLORS.cream,
  },

  // Graph card
  graphCard: {
    backgroundColor: CARD_BG, borderRadius: 16, padding: 20,
    marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  graphHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 20,
  },
  graphSubLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: '#c5d4fd', textTransform: 'uppercase', letterSpacing: 2,
    marginBottom: 4,
  },
  graphTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: 20, color: COLORS.white,
  },
  graphStat: { alignItems: 'flex-end' },
  graphStatNumber: {
    fontFamily: FONT_FAMILY.heading, fontSize: 28, color: '#ba1a1a',
  },
  graphStatLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: '#ba1a1a', textTransform: 'uppercase',
  },
  graphSvgWrap: { height: 160, marginBottom: 8 },
  monthsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  monthLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9,
    color: '#4F5E81', textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // No-zip prompt
  noZipCard: {
    backgroundColor: 'rgba(212,137,14,0.1)', borderRadius: RADIUS.card,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212,137,14,0.2)',
  },
  noZipIcon: { fontSize: 20 },
  noZipText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 13,
    color: COLORS.amber, flex: 1,
  },

  // Contaminant cards
  sectionLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 12,
    color: '#c5d4fd', textTransform: 'uppercase', letterSpacing: 3,
    marginBottom: 12, marginLeft: 2,
  },
  contaminantCard: {
    backgroundColor: CARD_BG, borderRadius: RADIUS.card,
    padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderLeftWidth: 4, marginBottom: 12,
  },
  contaminantIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  contaminantContent: { flex: 1 },
  contaminantHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 6,
  },
  contaminantName: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg,
    color: COLORS.white, flex: 1, lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
    marginLeft: 8,
  },
  statusText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10, textTransform: 'uppercase',
  },
  contaminantDesc: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm, lineHeight: 22,
    color: '#c5d4fd',
  },
  levelBold: { color: COLORS.white, fontFamily: FONT_FAMILY.buttonLabel },
  conditionLinkText: { color: '#c5d4fd' },
  conditionLinkHighlight: { color: COLORS.amber },

  // Insight
  insightText: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.lg,
    color: 'rgba(255,248,240,0.5)', fontStyle: 'italic',
    textAlign: 'center', paddingHorizontal: 16,
    marginTop: 16, marginBottom: 8,
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
