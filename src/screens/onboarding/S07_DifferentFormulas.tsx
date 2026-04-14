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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import ProgressBar from '../../components/shared/ProgressBar';
import SkipLink from '../../components/shared/SkipLink';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S07_DifferentFormulas'>;

// ─── Ingredient data ────────────────────────────────────────────────────
const EU_INGREDIENTS = [
  'Organic Oats',
  'Fruit Puree',
  'Natural Fiber',
  'Vitamin C',
  'Iron',
  'Zinc',
];

const US_SHARED = [
  'Organic Oats',
  'Fruit Puree',
  'Natural Fiber',
];

const US_EXTRA = [
  'Red 40 Dye',
  'Corn Syrup',
  'BHT Preservative',
];

const EU_STAGGER = 100;
const US_SHARED_STAGGER = 80;
const US_EXTRA_STAGGER = 150;

export default function S07_DifferentFormulas({ navigation }: Props) {
  // ─── Heading anims ──────────────────────────────────────────────────
  const h1Opacity = useRef(new Animated.Value(0)).current;
  const h1Translate = useRef(new Animated.Value(8)).current;
  const h2Opacity = useRef(new Animated.Value(0)).current;
  const h2Translate = useRef(new Animated.Value(8)).current;

  // Product card
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(40)).current;

  // Amber divider line (height grows from 0 → 1)
  const dividerProgress = useRef(new Animated.Value(0)).current;

  // EU ingredients (opacity per row)
  const euAnims = useRef(EU_INGREDIENTS.map(() => ({
    opacity: new Animated.Value(0),
    dotScale: new Animated.Value(1),
  }))).current;

  // US shared ingredients
  const usSharedAnims = useRef(US_SHARED.map(() => ({
    opacity: new Animated.Value(0),
  }))).current;

  // US extra ingredients (opacity + translateX + warning pulse)
  const usExtraAnims = useRef(US_EXTRA.map(() => ({
    opacity: new Animated.Value(0),
    translateX: new Animated.Value(20),
    warnScale: new Animated.Value(1),
  }))).current;

  // Bottom text + button
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslate = useRef(new Animated.Value(8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading line 1
    Animated.parallel([
      Animated.timing(h1Opacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(h1Translate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // 2. Heading line 2 (amber), 300ms later
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(h2Opacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(h2Translate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 300));

    // 3. Product card slides up, 500ms
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(cardTranslateY, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    }, 500));

    // 4. Amber divider draws during EU column phase
    const euStartTime = 1100;
    timers.push(setTimeout(() => {
      Animated.timing(dividerProgress, {
        toValue: 1,
        duration: EU_INGREDIENTS.length * EU_STAGGER + 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false, // height animation
      }).start();
    }, euStartTime));

    // 5. EU ingredients appear top to bottom
    EU_INGREDIENTS.forEach((_, i) => {
      const delay = euStartTime + i * EU_STAGGER;
      timers.push(setTimeout(() => {
        Animated.timing(euAnims[i].opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        // Green dot pulse
        Animated.sequence([
          Animated.timing(euAnims[i].dotScale, { toValue: 1.4, duration: 80, useNativeDriver: true }),
          Animated.timing(euAnims[i].dotScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();
      }, delay));
    });

    // 6. After EU complete + 400ms pause: US shared ingredients
    const euEndTime = euStartTime + EU_INGREDIENTS.length * EU_STAGGER + 200;
    const usStartTime = euEndTime + 400;

    US_SHARED.forEach((_, i) => {
      const delay = usStartTime + i * US_SHARED_STAGGER;
      timers.push(setTimeout(() => {
        Animated.timing(usSharedAnims[i].opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      }, delay));
    });

    // 7. US extra ingredients — slide from right + warning pulse + haptic
    const usExtraStartTime = usStartTime + US_SHARED.length * US_SHARED_STAGGER + 200;

    US_EXTRA.forEach((_, i) => {
      const delay = usExtraStartTime + i * US_EXTRA_STAGGER;
      timers.push(setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.parallel([
          Animated.timing(usExtraAnims[i].opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.spring(usExtraAnims[i].translateX, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
        ]).start();

        // Warning triangle pulse
        Animated.sequence([
          Animated.timing(usExtraAnims[i].warnScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
          Animated.timing(usExtraAnims[i].warnScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }, delay));
    });

    // 8. Bottom text + button
    const allDoneTime = usExtraStartTime + US_EXTRA.length * US_EXTRA_STAGGER + 400;
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(footerTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, allDoneTime));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S08_Testimonials');
    });
  };

  // Divider height interpolation
  const dividerHeight = dividerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Progress + skip */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={7} total={31} variant="dark" />
          </View>
          <SkipLink
            onPress={() => navigation.navigate('S09_WhoAreYouProtecting')}
            variant="dark"
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Heading ────────────────────────────────────────────── */}
          <View style={styles.headingWrap}>
            <Animated.Text style={[styles.headingLine, { opacity: h1Opacity, transform: [{ translateY: h1Translate }] }]}>
              Same children's product.{'\n'}Same packaging.
            </Animated.Text>
            <Animated.Text style={[styles.headingAmber, { opacity: h2Opacity, transform: [{ translateY: h2Translate }] }]}>
              Different ingredients inside.
            </Animated.Text>
          </View>

          {/* ── Product card placeholder ────────────────────────────── */}
          <Animated.View style={[styles.productCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslateY }] }]}>
            <View style={styles.productImagePlaceholder}>
              <Text style={styles.productEmoji}>📦</Text>
              <Text style={styles.productLabel}>Children's Snack</Text>
            </View>
          </Animated.View>

          {/* ── Comparison card ─────────────────────────────────────── */}
          <View style={styles.comparisonCard}>
            <View style={styles.columnsWrap}>
              {/* Amber divider */}
              <View style={styles.dividerTrack}>
                <Animated.View style={[styles.dividerFill, { height: dividerHeight }]} />
              </View>

              {/* EU Column */}
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={styles.flag}>🇪🇺</Text>
                  <Text style={styles.columnTitle}>EU Formula</Text>
                </View>
                {EU_INGREDIENTS.map((ing, i) => (
                  <Animated.View key={ing} style={[styles.ingredientRow, { opacity: euAnims[i].opacity }]}>
                    <Animated.View style={[styles.greenDot, { transform: [{ scale: euAnims[i].dotScale }] }]} />
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </Animated.View>
                ))}
              </View>

              {/* US Column */}
              <View style={[styles.column, styles.usColumn]}>
                <View style={styles.columnHeader}>
                  <Text style={styles.flag}>🇺🇸</Text>
                  <Text style={styles.columnTitle}>US Formula</Text>
                </View>

                {/* Shared ingredients */}
                {US_SHARED.map((ing, i) => (
                  <Animated.View key={ing} style={[styles.ingredientRow, { opacity: usSharedAnims[i].opacity }]}>
                    <View style={styles.greenDot} />
                    <Text style={styles.ingredientText}>{ing}</Text>
                  </Animated.View>
                ))}

                {/* Extra US-only ingredients */}
                {US_EXTRA.map((ing, i) => (
                  <Animated.View
                    key={ing}
                    style={[
                      styles.ingredientRow,
                      {
                        opacity: usExtraAnims[i].opacity,
                        transform: [{ translateX: usExtraAnims[i].translateX }],
                      },
                    ]}
                  >
                    <Animated.Text
                      style={[styles.warningIcon, { transform: [{ scale: usExtraAnims[i].warnScale }] }]}
                    >
                      ⚠
                    </Animated.Text>
                    <Text style={styles.extraIngredientText}>{ing}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>

          {/* ── Footer text ────────────────────────────────────────── */}
          <Animated.Text
            style={[styles.footerText, { opacity: footerOpacity, transform: [{ translateY: footerTranslate }] }]}
          >
            The EU requires safety testing before ingredients are approved for
            children. The US does not.
          </Animated.Text>
        </ScrollView>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>Who's checking for my kids?</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c1425' },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm, gap: 16,
  },
  progressBarWrap: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },

  // Heading
  headingWrap: { alignItems: 'center', marginBottom: 24 },
  headingLine: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center',
  },
  headingAmber: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.amber, textAlign: 'center', marginTop: 2,
  },

  // Product card
  productCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.card,
    padding: 24, alignItems: 'center', marginBottom: -16, zIndex: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  productImagePlaceholder: { alignItems: 'center', gap: 8 },
  productEmoji: { fontSize: 64 },
  productLabel: {
    fontFamily: FONT_FAMILY.bodySemiBold, fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Comparison card
  comparisonCard: {
    backgroundColor: CARD_BG, borderRadius: RADIUS.card,
    padding: 24, paddingTop: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.3, shadowRadius: 32, elevation: 6,
  },
  columnsWrap: { flexDirection: 'row', position: 'relative' },

  // Divider
  dividerTrack: {
    position: 'absolute', left: '50%', top: 32, bottom: 8,
    width: 1, backgroundColor: 'rgba(212,137,14,0.1)',
    marginLeft: -0.5,
  },
  dividerFill: {
    width: 1, backgroundColor: 'rgba(212,137,14,0.3)',
  },

  // Columns
  column: { flex: 1, gap: 8 },
  usColumn: { paddingLeft: 16 },
  columnHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
  },
  flag: { fontSize: 14 },
  columnTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: 13, color: COLORS.cream,
    textTransform: 'uppercase', letterSpacing: 1,
  },

  // Ingredients
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.safe,
  },
  ingredientText: {
    fontFamily: FONT_FAMILY.body, fontSize: 11,
    color: 'rgba(255,248,240,0.7)', flex: 1,
  },
  warningIcon: { fontSize: 12, color: '#ff6b6b' },
  extraIngredientText: {
    fontFamily: FONT_FAMILY.bodySemiBold, fontSize: 11,
    color: '#ff6b6b', flex: 1,
  },

  // Footer text
  footerText: {
    fontFamily: FONT_FAMILY.body, fontSize: 12, lineHeight: 20,
    color: 'rgba(255,248,240,0.6)', textAlign: 'center',
    marginTop: 24, marginBottom: 8, paddingHorizontal: 16,
  },

  // CTA
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base, color: COLORS.cream,
  },
  buttonArrow: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: COLORS.cream,
  },
});
