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
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import ProgressBar from '../../components/shared/ProgressBar';
import SkipLink from '../../components/shared/SkipLink';
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S06_BannedEurope'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Banned ingredient chips ────────────────────────────────────────────
const CHIPS = [
  'Red 40',
  'Titanium Dioxide',
  'BHA',
  'Potassium Bromate',
  'Azodicarbonamide',
];
const CHIP_STAGGER = 100;

export default function S06_BannedEurope({ navigation }: Props) {
  // ─── Animation values ───────────────────────────────────────────────
  const heading1Opacity = useRef(new Animated.Value(0)).current;
  const heading1Translate = useRef(new Animated.Value(8)).current;
  const heading2Opacity = useRef(new Animated.Value(0)).current;
  const heading2Translate = useRef(new Animated.Value(8)).current;

  // Phone mockups
  const euPhoneTranslateX = useRef(new Animated.Value(-60)).current;
  const euPhoneOpacity = useRef(new Animated.Value(0)).current;
  const usPhoneTranslateX = useRef(new Animated.Value(60)).current;
  const usPhoneOpacity = useRef(new Animated.Value(0)).current;

  // ≠ symbol
  const neqOpacity = useRef(new Animated.Value(0)).current;
  const neqScale = useRef(new Animated.Value(0.5)).current;

  // Chips: opacity + translateX per chip, plus "Banned" label opacity
  const chipAnims = useRef(
    CHIPS.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(30),
      labelOpacity: new Animated.Value(0),
    }))
  ).current;

  // Bottom text + bear + button
  const bottomTextOpacity = useRef(new Animated.Value(0)).current;
  const bottomTextTranslate = useRef(new Animated.Value(8)).current;
  const bearOpacity = useRef(new Animated.Value(0)).current;
  const bearTranslateY = useRef(new Animated.Value(40)).current;
  const bearBob = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. "Banned for European children." fades in
    Animated.parallel([
      Animated.timing(heading1Opacity, {
        toValue: 1, duration: 400,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(heading1Translate, {
        toValue: 0, duration: 400,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();

    // 2. After 300ms: "Sold to American kids." in coral + medium haptic
    timers.push(setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.parallel([
        Animated.timing(heading2Opacity, {
          toValue: 1, duration: 400,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(heading2Translate, {
          toValue: 0, duration: 400,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]).start();
    }, 300));

    // 3. Phones slide in (700ms mark, 400ms spring)
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.spring(euPhoneTranslateX, {
          toValue: 0, friction: 8, tension: 65, useNativeDriver: true,
        }),
        Animated.timing(euPhoneOpacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }),
        Animated.spring(usPhoneTranslateX, {
          toValue: 0, friction: 8, tension: 65, useNativeDriver: true,
        }),
        Animated.timing(usPhoneOpacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }),
      ]).start();
    }, 700));

    // 4. ≠ symbol 200ms after phones land (~1300ms)
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(neqOpacity, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
        Animated.spring(neqScale, {
          toValue: 1, friction: 5, tension: 100, useNativeDriver: true,
        }),
      ]).start();
    }, 1300));

    // 5. Chips stagger in (1600ms)
    CHIPS.forEach((_, i) => {
      const chipDelay = 1600 + i * CHIP_STAGGER;
      timers.push(setTimeout(() => {
        Animated.parallel([
          Animated.timing(chipAnims[i].opacity, {
            toValue: 1, duration: 250, useNativeDriver: true,
          }),
          Animated.spring(chipAnims[i].translateX, {
            toValue: 0, friction: 8, tension: 70, useNativeDriver: true,
          }),
        ]).start();

        // "Banned in EU" label 200ms after chip
        setTimeout(() => {
          Animated.timing(chipAnims[i].labelOpacity, {
            toValue: 1, duration: 200, useNativeDriver: true,
          }).start();
        }, 200);
      }, chipDelay));
    });

    // 6. Bottom text (~2400ms)
    const bottomTime = 1600 + CHIPS.length * CHIP_STAGGER + 400;
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(bottomTextOpacity, {
          toValue: 1, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(bottomTextTranslate, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]).start();
    }, bottomTime));

    // 7. Bear slides up from bottom (300ms after bottom text)
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(bearOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
        Animated.spring(bearTranslateY, {
          toValue: 0, friction: 8, tension: 65, useNativeDriver: true,
        }),
      ]).start();

      // Bob loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(bearBob, {
            toValue: -4, duration: 1500,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
          Animated.timing(bearBob, {
            toValue: 0, duration: 1500,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
        ])
      ).start();
    }, bottomTime + 300));

    // 8. Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]).start();
    }, bottomTime + 200));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S07_DifferentFormulas');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── Progress + skip ──────────────────────────────────────── */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={6} total={31} variant="dark" />
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
          <View style={styles.headingContainer}>
            <Animated.Text
              style={[
                styles.heading,
                {
                  opacity: heading1Opacity,
                  transform: [{ translateY: heading1Translate }],
                },
              ]}
            >
              Banned for European children.
            </Animated.Text>
            <Animated.Text
              style={[
                styles.headingCoral,
                {
                  opacity: heading2Opacity,
                  transform: [{ translateY: heading2Translate }],
                },
              ]}
            >
              Sold to American kids.
            </Animated.Text>
          </View>

          {/* ── Phone mockups ──────────────────────────────────────── */}
          <View style={styles.phonesRow}>
            {/* EU phone */}
            <Animated.View
              style={[
                styles.phoneCol,
                {
                  opacity: euPhoneOpacity,
                  transform: [{ translateX: euPhoneTranslateX }],
                },
              ]}
            >
              <Text style={[styles.phoneLabel, { color: COLORS.safe }]}>EU</Text>
              <View style={[styles.phoneMockup, styles.phoneEU]}>
                <View style={[styles.phoneIcon, { backgroundColor: 'rgba(76,175,80,0.2)' }]}>
                  <Text style={styles.phoneIconText}>✓</Text>
                </View>
                <View style={[styles.phoneBar, { backgroundColor: 'rgba(76,175,80,0.3)' }]} />
              </View>
            </Animated.View>

            {/* ≠ */}
            <Animated.Text
              style={[
                styles.neqSymbol,
                {
                  opacity: neqOpacity,
                  transform: [{ scale: neqScale }],
                },
              ]}
            >
              ≠
            </Animated.Text>

            {/* US phone */}
            <Animated.View
              style={[
                styles.phoneCol,
                {
                  opacity: usPhoneOpacity,
                  transform: [{ translateX: usPhoneTranslateX }],
                },
              ]}
            >
              <Text style={[styles.phoneLabel, { color: COLORS.coral }]}>US</Text>
              <View style={[styles.phoneMockup, styles.phoneUS]}>
                <View style={[styles.phoneIcon, { backgroundColor: 'rgba(229,115,115,0.2)' }]}>
                  <Text style={styles.phoneIconText}>⚠</Text>
                </View>
                <View style={[styles.phoneBar, { backgroundColor: 'rgba(229,115,115,0.3)' }]} />
              </View>
            </Animated.View>
          </View>

          {/* ── Ingredient chips (horizontal scroll) ───────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
            style={styles.chipsScroll}
          >
            {CHIPS.map((chip, i) => (
              <Animated.View
                key={chip}
                style={[
                  styles.chip,
                  {
                    opacity: chipAnims[i].opacity,
                    transform: [{ translateX: chipAnims[i].translateX }],
                  },
                ]}
              >
                <Text style={styles.chipName}>{chip}</Text>
                <Animated.Text
                  style={[styles.chipBanned, { opacity: chipAnims[i].labelOpacity }]}
                >
                  Banned in EU
                </Animated.Text>
              </Animated.View>
            ))}
          </ScrollView>

          {/* ── Bottom text ────────────────────────────────────────── */}
          <Animated.Text
            style={[
              styles.bottomText,
              {
                opacity: bottomTextOpacity,
                transform: [{ translateY: bottomTextTranslate }],
              },
            ]}
          >
            These are in children's products on your shelf right now.
          </Animated.Text>

          {/* ── Bear mascot ────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.bearWrap,
              {
                opacity: bearOpacity,
                transform: [
                  { translateY: Animated.add(bearTranslateY, bearBob) },
                ],
              },
            ]}
          >
            <BearMascot expression="protective" size={56} showBaby={false} />
          </Animated.View>
        </ScrollView>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: buttonOpacity,
              transform: [
                { translateY: buttonTranslate },
                { scale: buttonScale },
              ],
            },
          ]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>What else is hidden?</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const PHONE_BG = '#162340';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  safeArea: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: SPACING.sm,
    gap: 16,
  },
  progressBarWrap: { flex: 1 },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },

  // Heading
  headingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 22,
    lineHeight: 30,
    color: COLORS.cream,
    textAlign: 'center',
  },
  headingCoral: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 22,
    lineHeight: 30,
    color: COLORS.coral,
    textAlign: 'center',
  },

  // Phones
  phonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  phoneCol: {
    alignItems: 'center',
    gap: 8,
  },
  phoneLabel: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  phoneMockup: {
    width: 110,
    height: 160,
    backgroundColor: PHONE_BG,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  phoneEU: {
    borderColor: 'rgba(76,175,80,0.3)',
    // Green glow
    shadowColor: COLORS.safe,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  phoneUS: {
    borderColor: 'rgba(229,115,115,0.3)',
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  phoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconText: {
    fontSize: 22,
  },
  phoneBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },

  // ≠
  neqSymbol: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 32,
    color: COLORS.amber,
    paddingBottom: 24,
  },

  // Chips
  chipsScroll: {
    marginBottom: 28,
    marginHorizontal: -24,
  },
  chipsScrollContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  chip: {
    backgroundColor: PHONE_BG,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  chipName: {
    fontFamily: FONT_FAMILY.bodySemiBold,
    fontSize: 12,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 2,
  },
  chipBanned: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 9,
    color: COLORS.coral,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Bottom
  bottomText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,248,240,0.7)',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 20,
  },
  bearWrap: {
    marginBottom: 8,
  },

  // CTA
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE.lg,
    color: COLORS.cream,
  },
});
