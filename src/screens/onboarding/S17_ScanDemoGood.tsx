import React, { useEffect, useRef, useState } from 'react';
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
import Confetti from '../../components/shared/Confetti';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S17_ScanDemo_GoodSwap'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Checklist items ────────────────────────────────────────────────────
const CHECKLIST = [
  'No eczema triggers',
  'Fragrance-free',
  'EU-approved ingredients',
];
const CHECK_STAGGER = 200;

export default function S17_ScanDemoGood({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';
  const [showScore, setShowScore] = useState(false);

  // ─── Animation values ───────────────────────────────────────────────
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(12)).current;

  // Checklist: scale per icon + opacity per row
  const checkAnims = useRef(
    CHECKLIST.map(() => ({
      opacity: new Animated.Value(0),
      iconScale: new Animated.Value(0),
    }))
  ).current;

  // Comparison strip
  const comparisonOpacity = useRef(new Animated.Value(0)).current;
  const comparisonTranslate = useRef(new Animated.Value(10)).current;

  // Bear
  const bearOpacity = useRef(new Animated.Value(0)).current;
  const bearScale = useRef(new Animated.Value(0.7)).current;
  const bearBob = useRef(new Animated.Value(0)).current;

  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Card fades in (300ms)
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardTranslate, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // 2. Score ring starts after card
    timers.push(setTimeout(() => setShowScore(true), 400));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Called when score ring (94) finishes
  const handleScoreComplete = () => {
    // Success haptic (the satisfying ding)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const timers: NodeJS.Timeout[] = [];

    // 3. Checklist items stagger
    CHECKLIST.forEach((_, i) => {
      const delay = 300 + i * CHECK_STAGGER;
      timers.push(setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.timing(checkAnims[i].opacity, {
          toValue: 1, duration: 200, useNativeDriver: true,
        }).start();

        // Checkmark scale-in with spring overshoot
        Animated.spring(checkAnims[i].iconScale, {
          toValue: 1, friction: 4, tension: 120, useNativeDriver: true,
        }).start();
      }, delay));
    });

    // 4. Comparison strip
    const compTime = 300 + CHECKLIST.length * CHECK_STAGGER + 300;
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(comparisonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(comparisonTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, compTime));

    // 5. Bear bounce in
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(bearOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(bearScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(bearBob, { toValue: -5, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bearBob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, compTime + 200));

    // 6. Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, compTime + 100));
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S18_IngredientDecoder');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Confetti — fires immediately */}
      <Confetti count={28} colors={[COLORS.amber, COLORS.safe, COLORS.softGold, '#81C784']} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={17} total={31} variant="light" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Main card ──────────────────────────────────────────── */}
          <Animated.View
            style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}
          >
            {/* Score ring */}
            <View style={styles.scoreWrap}>
              {showScore ? (
                <ScoreRing
                  score={94}
                  color={COLORS.safe}
                  size={140}
                  strokeWidth={10}
                  duration={1200}
                  hapticStyle="medium"
                  onComplete={handleScoreComplete}
                />
              ) : (
                <View style={{ width: 140, height: 140 }} />
              )}
              <Text style={styles.safeLabel}>Safe for {childName}</Text>
            </View>

            {/* Product */}
            <View style={styles.productWrap}>
              <View style={styles.productImage}>
                <Text style={styles.productEmoji}>🧴</Text>
              </View>
              <Text style={styles.productName}>PureShield Baby</Text>
              <Text style={styles.productSub}>Gentle Hydrating Cream</Text>
            </View>

            {/* Green checklist */}
            <View style={styles.checklistWrap}>
              {CHECKLIST.map((item, i) => (
                <Animated.View
                  key={item}
                  style={[styles.checkRow, { opacity: checkAnims[i].opacity }]}
                >
                  <Animated.View
                    style={[styles.checkIcon, { transform: [{ scale: checkAnims[i].iconScale }] }]}
                  >
                    <Text style={styles.checkMark}>✓</Text>
                  </Animated.View>
                  <Text style={styles.checkText}>{item}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ── Comparison strip ────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.comparisonWrap,
              { opacity: comparisonOpacity, transform: [{ translateY: comparisonTranslate }] },
            ]}
          >
            <View style={styles.comparisonRow}>
              {/* Bad result mini */}
              <View style={styles.compMini}>
                <View style={[styles.compCircle, { backgroundColor: 'rgba(229,115,115,0.15)' }]}>
                  <Text style={[styles.compScore, { color: COLORS.coral }]}>34</Text>
                </View>
              </View>

              <Text style={styles.compArrow}>→</Text>

              {/* Good result mini */}
              <View style={styles.compMini}>
                <View style={[styles.compCircle, styles.compCircleGood]}>
                  <Text style={[styles.compScore, { color: COLORS.safe }]}>94</Text>
                </View>
              </View>
            </View>
            <Text style={styles.compCaption}>Swap and protect {childName}</Text>
          </Animated.View>

          {/* ── Bear celebrating ────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.bearWrap,
              {
                opacity: bearOpacity,
                transform: [{ scale: bearScale }, { translateY: bearBob }],
              },
            ]}
          >
            <Text style={styles.bearEmoji}>🎉🐻</Text>
          </Animated.View>
        </ScrollView>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>What else can Kuma do?</Text>
            <Text style={styles.buttonStar}>✨</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, alignItems: 'center' },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.card,
    padding: 28, width: '100%', alignItems: 'center',
    shadowColor: 'rgba(40,25,3,0.06)', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1, shadowRadius: 32, elevation: 4,
  },

  // Score
  scoreWrap: { alignItems: 'center', marginBottom: 20 },
  safeLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: COLORS.safe, textTransform: 'uppercase',
    letterSpacing: 2, marginTop: 8,
  },

  // Product
  productWrap: { alignItems: 'center', marginBottom: 24 },
  productImage: {
    width: 100, height: 100, borderRadius: RADIUS.card,
    backgroundColor: '#FFF1E5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  productEmoji: { fontSize: 48 },
  productName: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary, textAlign: 'center', marginBottom: 2,
  },
  productSub: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  // Checklist
  checklistWrap: { width: '100%', gap: 10 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFF1E5', borderRadius: 14,
    padding: 14,
  },
  checkIcon: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.safe,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { fontSize: 14, color: COLORS.white, fontWeight: '700' },
  checkText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },

  // Comparison
  comparisonWrap: { marginTop: 24, alignItems: 'center' },
  comparisonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 20,
  },
  compMini: { alignItems: 'center' },
  compCircle: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  compCircleGood: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderWidth: 2, borderColor: COLORS.safe,
    width: 56, height: 56, borderRadius: 16,
  },
  compScore: {
    fontFamily: FONT_FAMILY.heading, fontSize: 18,
  },
  compArrow: {
    fontFamily: FONT_FAMILY.body, fontSize: 24,
    color: 'rgba(79,94,129,0.4)',
  },
  compCaption: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 12,
    color: 'rgba(79,94,129,0.6)', fontStyle: 'italic',
    marginTop: 10,
  },

  // Bear
  bearWrap: { marginTop: 16, marginBottom: 8 },
  bearEmoji: { fontSize: 48 },

  // Footer
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 52, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.sm,
    color: COLORS.white,
  },
  buttonStar: { fontSize: 16 },
});
