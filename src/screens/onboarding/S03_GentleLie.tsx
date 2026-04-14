import React, { useEffect, useRef, useState } from 'react';
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
import ProgressBar from '../../components/shared/ProgressBar';
import SkipLink from '../../components/shared/SkipLink';
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S03_GentleLie'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Marketing claim pills ──────────────────────────────────────────────
const PILLS = ['Gentle', 'Sensitive', 'Pediatrician Tested', 'Hypoallergenic', 'Natural'];
const PILL_INTERVAL = 150;

export default function S03_GentleLie({ navigation }: Props) {
  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;

  // One opacity + translateY per pill
  const pillAnims = useRef(PILLS.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;

  // Pill shake (shared X offset for all pills)
  const pillShakeX = useRef(new Animated.Value(0)).current;

  // 80% stat
  const [statCount, setStatCount] = useState(0);
  const statOpacity = useRef(new Animated.Value(0)).current;
  const statScale = useRef(new Animated.Value(0.8)).current;

  // Description + citation
  const descOpacity = useRef(new Animated.Value(0)).current;
  const descTranslate = useRef(new Animated.Value(8)).current;
  const citationOpacity = useRef(new Animated.Value(0)).current;

  // Bottom truth line + bear
  const truthOpacity = useRef(new Animated.Value(0)).current;
  const truthTranslate = useRef(new Animated.Value(10)).current;
  const bearOpacity = useRef(new Animated.Value(0)).current;
  const bearBob = useRef(new Animated.Value(0)).current;

  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading fades in on mount
    Animated.parallel([
      Animated.timing(headingOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headingTranslate, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. After 300ms: pills animate in one at a time, 150ms apart, spring bounce
    PILLS.forEach((_, i) => {
      const pillDelay = 300 + i * PILL_INTERVAL;
      timers.push(
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(pillAnims[i].opacity, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.spring(pillAnims[i].translateY, {
              toValue: 0,
              friction: 6,
              tension: 100,
              useNativeDriver: true,
            }),
          ]).start();
        }, pillDelay)
      );
    });

    // All pills visible at: 300 + (PILLS.length - 1) * 150 + ~200 = ~1100ms
    const allPillsTime = 300 + (PILLS.length - 1) * PILL_INTERVAL + 200;

    // 3. After all pills + 500ms pause: 80% stat animates
    const statStartTime = allPillsTime + 500;

    timers.push(
      setTimeout(() => {
        // Fade in + scale the stat
        Animated.parallel([
          Animated.timing(statOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(statScale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();

        // Count up 0 → 80 over 800ms
        const countDuration = 800;
        const startTime = Date.now();
        const countInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / countDuration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const value = Math.round(eased * 80);
          setStatCount(value);

          if (progress >= 1) {
            clearInterval(countInterval);
            // Medium haptic when hitting 80
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // 4. Pills shake after 80% lands
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Animated.sequence([
              Animated.timing(pillShakeX, { toValue: 2, duration: 50, useNativeDriver: true }),
              Animated.timing(pillShakeX, { toValue: -2, duration: 50, useNativeDriver: true }),
              Animated.timing(pillShakeX, { toValue: 2, duration: 50, useNativeDriver: true }),
              Animated.timing(pillShakeX, { toValue: -2, duration: 50, useNativeDriver: true }),
              Animated.timing(pillShakeX, { toValue: 1, duration: 50, useNativeDriver: true }),
              Animated.timing(pillShakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();

            // 5. Description text fades in after shake (~300ms)
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(descOpacity, {
                  toValue: 1,
                  duration: 400,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.timing(descTranslate, {
                  toValue: 0,
                  duration: 400,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
              ]).start();
            }, 350);

            // 6. Citation fades in
            setTimeout(() => {
              Animated.timing(citationOpacity, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }).start();
            }, 700);

            // 7. Truth line + bear fade in last
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(truthOpacity, {
                  toValue: 1,
                  duration: 500,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.timing(truthTranslate, {
                  toValue: 0,
                  duration: 500,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.timing(bearOpacity, {
                  toValue: 1,
                  duration: 600,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
              ]).start();

              // Bear bob loop
              Animated.loop(
                Animated.sequence([
                  Animated.timing(bearBob, {
                    toValue: -4,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                  }),
                  Animated.timing(bearBob, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                  }),
                ])
              ).start();
            }, 1100);

            // 8. Button fades in with truth line
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(buttonOpacity, {
                  toValue: 1,
                  duration: 500,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.timing(buttonTranslate, {
                  toValue: 0,
                  duration: 500,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
              ]).start();
            }, 1100);
          }
        }, 16);
      }, statStartTime)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Button handler ─────────────────────────────────────────────────
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('S04_DifferentChildren');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── Progress bar + skip ───────────────────────────────────── */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={3} total={31} variant="dark" />
          </View>
          <SkipLink
            onPress={() => navigation.navigate('S09_WhoAreYouProtecting')}
            variant="dark"
          />
        </View>

        {/* ── Scrollable content ───────────────────────────────────── */}
        <View style={styles.content}>
          {/* Heading */}
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity: headingOpacity,
                transform: [{ translateY: headingTranslate }],
              },
            ]}
          >
            Products labeled 'gentle'{'\n'}aren't always gentle.
          </Animated.Text>

          {/* ── Card ───────────────────────────────────────────────── */}
          <View style={styles.card}>
            {/* Marketing pills */}
            <Animated.View
              style={[
                styles.pillsWrap,
                { transform: [{ translateX: pillShakeX }] },
              ]}
            >
              {PILLS.map((label, i) => (
                <Animated.View
                  key={label}
                  style={[
                    styles.pill,
                    {
                      opacity: pillAnims[i].opacity,
                      transform: [{ translateY: pillAnims[i].translateY }],
                    },
                  ]}
                >
                  <Text style={styles.pillText}>{label}</Text>
                </Animated.View>
              ))}
            </Animated.View>

            {/* 80% stat */}
            <Animated.View
              style={[
                styles.statContainer,
                {
                  opacity: statOpacity,
                  transform: [{ scale: statScale }],
                },
              ]}
            >
              <Text style={styles.statNumber}>{statCount}%</Text>
            </Animated.View>

            {/* Description */}
            <Animated.Text
              style={[
                styles.description,
                {
                  opacity: descOpacity,
                  transform: [{ translateY: descTranslate }],
                },
              ]}
            >
              of products labeled 'gentle' or 'non-irritating' contain allergens
              or known skin irritants.
            </Animated.Text>

            {/* Study inset */}
            <Animated.View style={[styles.studyInset, { opacity: citationOpacity }]}>
              <Text style={styles.studyText}>
                "A study of 438 baby products found that those marketed as
                'sensitive' and 'gentle' were more likely to contain irritants
                than products without those claims."
              </Text>
            </Animated.View>

            {/* Citation */}
            <Animated.Text style={[styles.citation, { opacity: citationOpacity }]}>
              Journal of Clinical Medicine, UK 2018 study
            </Animated.Text>
          </View>

          {/* ── Truth statement ─────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.truthContainer,
              {
                opacity: truthOpacity,
                transform: [{ translateY: truthTranslate }],
              },
            ]}
          >
            <Text style={styles.truthText}>
              "The label is marketing.{'\n'}The ingredient list is the truth."
            </Text>
          </Animated.View>
        </View>

        {/* ── Bear mascot (bottom-left) ────────────────────────────── */}
        <Animated.View
          style={[
            styles.bearContainer,
            {
              opacity: bearOpacity,
              transform: [{ translateY: bearBob }],
            },
          ]}
        >
          <BearMascot expression="curious" size={60} showBaby={false} />
        </Animated.View>

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
            <Text style={styles.buttonText}>What's really in them?</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const CARD_BG = '#162238';
const INSET_BG = 'rgba(12, 20, 37, 0.4)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
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
  progressBarWrap: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 22,
    lineHeight: 30,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },

  // Card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: RADIUS.card,
    padding: 24,
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },

  // Pills
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  pillText: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: 12,
    color: CARD_BG,
    letterSpacing: -0.2,
  },

  // Stat
  statContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 80,
    lineHeight: 88,
    color: COLORS.coral,
    letterSpacing: -3,
  },

  // Description
  description: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    color: 'rgba(255, 248, 240, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // Study inset
  studyInset: {
    backgroundColor: INSET_BG,
    borderRadius: RADIUS.sm,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  studyText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 12,
    lineHeight: 19,
    color: 'rgba(255, 248, 240, 0.55)',
    fontStyle: 'italic',
  },

  // Citation
  citation: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 10,
    color: 'rgba(255, 248, 240, 0.25)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  // Truth statement
  truthContainer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  truthText: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
    lineHeight: 22,
    color: COLORS.amber,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Bear
  bearContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  button: {
    width: '100%',
    height: 52,
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
    fontSize: FONT_SIZE.sm,
    color: '#482B00',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
