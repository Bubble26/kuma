import React, { useEffect, useRef, useMemo, useState } from 'react';
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
import { getFlaggedIngredients, FlaggedIngredient } from '../../data/ingredients';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S16_ScanDemo_Bad'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const INGREDIENT_STAGGER = 250;

export default function S16_ScanDemoBad({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  // Dynamic flagged ingredients based on conditions
  const flagged = useMemo(
    () => getFlaggedIngredients(state.conditions, 3),
    [state.conditions]
  );

  const [showScore, setShowScore] = useState(false);

  // ─── Animation values ───────────────────────────────────────────────
  const productOpacity = useRef(new Animated.Value(0)).current;
  const productTranslate = useRef(new Animated.Value(12)).current;

  // Post-score elements
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const triggersHeaderOpacity = useRef(new Animated.Value(0)).current;

  // Per-ingredient
  const ingredientAnims = useRef(
    flagged.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(30),
      dotScale: new Animated.Value(1),
    }))
  ).current;

  // Disclaimer + button
  const disclaimerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Product card fades in (300ms)
    Animated.parallel([
      Animated.timing(productOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(productTranslate, { toValue: 0, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // 2. Start score ring after product visible
    timers.push(setTimeout(() => {
      setShowScore(true);
    }, 400));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Called when score ring finishes (score=34)
  const handleScoreComplete = () => {
    const timers: NodeJS.Timeout[] = [];

    // 3. "Not safe for {childName}" label (200ms delay)
    timers.push(setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(labelOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 200));

    // 4. Triggers header (500ms after score)
    timers.push(setTimeout(() => {
      Animated.timing(triggersHeaderOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 500));

    // 5. Flagged ingredients staggered
    flagged.forEach((_, i) => {
      const delay = 800 + i * INGREDIENT_STAGGER;
      timers.push(setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.parallel([
          Animated.timing(ingredientAnims[i].opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.spring(ingredientAnims[i].translateX, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
        ]).start();

        // Coral dot pulse
        Animated.sequence([
          Animated.timing(ingredientAnims[i].dotScale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
          Animated.timing(ingredientAnims[i].dotScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }, delay));
    });

    // 6. Disclaimer + button
    const allDoneTime = 800 + flagged.length * INGREDIENT_STAGGER + 400;
    timers.push(setTimeout(() => {
      Animated.timing(disclaimerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, allDoneTime));

    // Cleanup
    return () => timers.forEach(clearTimeout);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S17_ScanDemo_GoodSwap');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={16} total={31} variant="light" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Product card ───────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.card,
              { opacity: productOpacity, transform: [{ translateY: productTranslate }] },
            ]}
          >
            {/* Product image placeholder */}
            <View style={styles.productImage}>
              <Text style={styles.productEmoji}>🧴</Text>
            </View>

            <Text style={styles.productName}>Bubbles & Bears Body Wash</Text>
            <Text style={styles.productBrand}>Generic Brand</Text>

            {/* ── Score ring ─────────────────────────────────────── */}
            <View style={styles.scoreSection}>
              <View style={styles.scoreRingWrap}>
                {showScore ? (
                  <ScoreRing
                    score={34}
                    color={COLORS.coral}
                    size={120}
                    strokeWidth={6}
                    duration={1000}
                    hapticStyle="medium"
                    onComplete={handleScoreComplete}
                  />
                ) : (
                  <View style={{ width: 120, height: 120 }} />
                )}
              </View>

              {/* "Not safe for {childName}" */}
              <Animated.View style={[styles.warningBadge, { opacity: labelOpacity }]}>
                <Text style={styles.warningIcon}>⚠</Text>
                <Text style={styles.warningText}>Not safe for {childName}</Text>
              </Animated.View>
            </View>

            {/* ── Triggers section ───────────────────────────────── */}
            <Animated.View style={[styles.triggersSection, { opacity: triggersHeaderOpacity }]}>
              <Text style={styles.triggersHeader}>
                {childName}'s Triggers Found: {flagged.length}
              </Text>
            </Animated.View>

            {flagged.map((ing, i) => (
              <Animated.View
                key={ing.name}
                style={[
                  styles.ingredientRow,
                  {
                    opacity: ingredientAnims[i].opacity,
                    transform: [{ translateX: ingredientAnims[i].translateX }],
                  },
                ]}
              >
                <Animated.View
                  style={[styles.coralDot, { transform: [{ scale: ingredientAnims[i].dotScale }] }]}
                />
                <View style={styles.ingredientTextWrap}>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientReason}>{ing.reason}</Text>
                </View>
              </Animated.View>
            ))}

            {/* ── CTA inside card ────────────────────────────────── */}
            <Animated.View
              style={[styles.ctaWrap, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
            >
              <Pressable onPress={handleContinue} style={styles.button}>
                <Text style={styles.buttonText}>Find a safer option</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* ── Disclaimer ─────────────────────────────────────────── */}
          <Animated.Text style={[styles.disclaimer, { opacity: disclaimerOpacity }]}>
            This is a demo. Real scans personalized to {childName}.
          </Animated.Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32,
  },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.card,
    padding: 28, alignItems: 'center',
    shadowColor: 'rgba(40,25,3,0.06)', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1, shadowRadius: 32, elevation: 4,
  },

  // Product
  productImage: {
    width: 140, height: 140, borderRadius: RADIUS.card,
    backgroundColor: '#FFF1E5', marginBottom: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  productEmoji: { fontSize: 64 },
  productName: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary, textAlign: 'center', marginBottom: 4,
  },
  productBrand: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary, marginBottom: 24,
  },

  // Score
  scoreSection: { alignItems: 'center', marginBottom: 24 },
  scoreRingWrap: { marginBottom: 12 },
  warningBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(229,115,115,0.12)', borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  warningIcon: { fontSize: 16 },
  warningText: {
    fontFamily: FONT_FAMILY.bodySemiBold, fontSize: FONT_SIZE.sm,
    color: COLORS.coral,
  },

  // Triggers
  triggersSection: { width: '100%', marginBottom: 16 },
  triggersHeader: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },

  // Ingredient row
  ingredientRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    width: '100%', padding: 14,
    backgroundColor: '#FFF1E5', borderRadius: RADIUS.sm,
    marginBottom: 10,
  },
  coralDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.coral, marginTop: 5,
  },
  ingredientTextWrap: { flex: 1 },
  ingredientName: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary, marginBottom: 2,
  },
  ingredientReason: {
    fontFamily: FONT_FAMILY.body, fontSize: 12,
    color: COLORS.textSecondary,
  },

  // CTA
  ctaWrap: { width: '100%', marginTop: 20 },
  button: {
    width: '100%', height: 56,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.amber,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base, color: '#482B00',
  },
  buttonArrow: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },

  // Disclaimer
  disclaimer: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 10,
    color: 'rgba(40,25,3,0.4)', textAlign: 'center',
    marginTop: 20,
  },
});
