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
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import ProgressBar from '../../components/shared/ProgressBar';
import SkipLink from '../../components/shared/SkipLink';
import BearMascot from '../../components/shared/BearMascot';
import ScoreRing from '../../components/shared/ScoreRing';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S04_DifferentChildren'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// ─── Connecting line config ─────────────────────────────────────────────
// Approximate path lengths for strokeDashoffset animation
const LINE_LENGTH = 120;

export default function S04_DifferentChildren({ navigation }: Props) {
  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const productOpacity = useRef(new Animated.Value(0)).current;
  const productScale = useRef(new Animated.Value(0.9)).current;

  // Lines
  const lineDraw = useRef(new Animated.Value(0)).current;

  // Cards
  const jakeTranslateX = useRef(new Animated.Value(-60)).current;
  const jakeOpacity = useRef(new Animated.Value(0)).current;
  const emmaTranslateX = useRef(new Animated.Value(60)).current;
  const emmaOpacity = useRef(new Animated.Value(0)).current;

  // Score rings start trigger
  const [showScores, setShowScores] = useState(false);

  // Emma condition pills + trigger text
  const emmaPillsOpacity = useRef(new Animated.Value(0)).current;
  const triggerTextOpacity = useRef(new Animated.Value(0)).current;

  // Bottom text + bear
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslate = useRef(new Animated.Value(10)).current;
  const bearOpacity = useRef(new Animated.Value(0)).current;
  const bearBob = useRef(new Animated.Value(0)).current;

  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading fades in
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

    // 2. Product fades in on mount
    Animated.parallel([
      Animated.timing(productOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(productScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 3. After 400ms: lines draw downward (500ms)
    timers.push(
      setTimeout(() => {
        Animated.timing(lineDraw, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }).start();
      }, 400)
    );

    // 4. After lines complete (900ms): both cards slide in
    timers.push(
      setTimeout(() => {
        Animated.parallel([
          // Jake from left
          Animated.spring(jakeTranslateX, {
            toValue: 0,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.timing(jakeOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // Emma from right
          Animated.spring(emmaTranslateX, {
            toValue: 0,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.timing(emmaOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Start score ring animations after cards land
          setShowScores(true);
        });
      }, 900)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Called when Emma's score ring finishes (the later one to complete)
  const handleEmmaScoreComplete = () => {
    // Condition pills fade in
    Animated.timing(emmaPillsOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // "3 triggers" text fades in 300ms later
    setTimeout(() => {
      Animated.timing(triggerTextOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 300);

    // Footer text + bear + button 600ms later
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(footerTranslate, {
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

      // Bear bob
      Animated.loop(
        Animated.sequence([
          Animated.timing(bearBob, {
            toValue: -4,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bearBob, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 600);
  };

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
      navigation.navigate('S05_HiddenTriggers');
    });
  };

  // ─── Line draw interpolation ────────────────────────────────────────
  const lineStrokeDashoffset = lineDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [LINE_LENGTH, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background glows */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── Progress + skip ──────────────────────────────────────── */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={4} total={31} variant="dark" />
          </View>
          <SkipLink
            onPress={() => navigation.navigate('S09_WhoAreYouProtecting')}
            variant="dark"
          />
        </View>

        {/* ── Content ──────────────────────────────────────────────── */}
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
            The same product.{'\n'}Two different answers.
          </Animated.Text>

          {/* Product bottle */}
          <Animated.View
            style={[
              styles.productContainer,
              {
                opacity: productOpacity,
                transform: [{ scale: productScale }],
              },
            ]}
          >
            <View style={styles.productBottle}>
              <View style={styles.productLabel} />
              <View style={styles.productCap} />
            </View>
          </Animated.View>

          {/* Connecting lines (SVG) */}
          <View style={styles.linesContainer}>
            <Svg width={260} height={60} viewBox="0 0 260 60">
              <AnimatedPath
                d="M130 5 Q100 30 30 55"
                fill="none"
                stroke={COLORS.amber}
                strokeWidth={1.5}
                strokeDasharray={`${LINE_LENGTH}`}
                strokeDashoffset={lineStrokeDashoffset}
                strokeLinecap="round"
                opacity={0.6}
              />
              <AnimatedPath
                d="M130 5 Q160 30 230 55"
                fill="none"
                stroke={COLORS.amber}
                strokeWidth={1.5}
                strokeDasharray={`${LINE_LENGTH}`}
                strokeDashoffset={lineStrokeDashoffset}
                strokeLinecap="round"
                opacity={0.6}
              />
            </Svg>
          </View>

          {/* Score cards */}
          <View style={styles.cardsRow}>
            {/* Jake */}
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: jakeOpacity,
                  transform: [{ translateX: jakeTranslateX }],
                },
              ]}
            >
              <Text style={styles.cardName}>Jake, age 7</Text>
              <Text style={styles.cardSubtitle}>No conditions</Text>

              <View style={styles.ringWrap}>
                {showScores && (
                  <ScoreRing
                    score={89}
                    color={COLORS.safe}
                    size={68}
                    strokeWidth={4}
                    duration={800}
                    delay={200}
                    hapticStyle="light"
                  />
                )}
              </View>

              <Text style={[styles.cardStatus, { color: COLORS.safe }]}>
                Safe for Jake
              </Text>
            </Animated.View>

            {/* Emma */}
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: emmaOpacity,
                  transform: [{ translateX: emmaTranslateX }],
                },
              ]}
            >
              <Text style={styles.cardName}>Emma, age 3</Text>

              {/* Condition pills */}
              <Animated.View style={[styles.pillsRow, { opacity: emmaPillsOpacity }]}>
                <View style={[styles.conditionPill, { backgroundColor: COLORS.coral }]}>
                  <Text style={styles.conditionPillText}>Eczema</Text>
                </View>
                <View style={[styles.conditionPill, { backgroundColor: COLORS.caution }]}>
                  <Text style={styles.conditionPillText}>Food Allergies</Text>
                </View>
              </Animated.View>

              <View style={styles.ringWrap}>
                {showScores && (
                  <ScoreRing
                    score={34}
                    color={COLORS.coral}
                    size={68}
                    strokeWidth={4}
                    duration={800}
                    delay={200}
                    hapticStyle="medium"
                    onComplete={handleEmmaScoreComplete}
                  />
                )}
              </View>

              <Animated.Text
                style={[
                  styles.cardStatus,
                  { color: COLORS.coral, opacity: triggerTextOpacity },
                ]}
              >
                3 triggers for Emma
              </Animated.Text>
            </Animated.View>
          </View>

          {/* Bear mascot */}
          <Animated.View
            style={[
              styles.bearWrap,
              {
                opacity: bearOpacity,
                transform: [{ translateY: bearBob }],
              },
            ]}
          >
            <BearMascot expression="curious" size={56} showBaby={false} />
          </Animated.View>

          {/* Footer text */}
          <Animated.Text
            style={[
              styles.footerText,
              {
                opacity: footerOpacity,
                transform: [{ translateY: footerTranslate }],
              },
            ]}
          >
            Other apps give one score.{'\n'}Kuma gives the right score for{' '}
            <Text style={styles.footerEmphasis}>your</Text> child.
          </Animated.Text>
        </View>

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
            <Text style={styles.buttonText}>How does it work?</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  glowTopRight: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: COLORS.amber,
    opacity: 0.06,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#4F5E81',
    opacity: 0.12,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 28,
    lineHeight: 36,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 28,
  },

  // Product bottle placeholder
  productContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  productBottle: {
    width: 54,
    height: 76,
    backgroundColor: '#FFF1E5',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ rotate: '-2deg' }],
  },
  productLabel: {
    width: 30,
    height: 22,
    backgroundColor: COLORS.softGold,
    borderRadius: 4,
    opacity: 0.6,
  },
  productCap: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 10,
    backgroundColor: '#E8D5C0',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  // Lines
  linesContainer: {
    alignItems: 'center',
    marginTop: -8,
    marginBottom: -8,
    zIndex: 1,
  },

  // Cards
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
  },
  card: {
    width: (SCREEN_WIDTH - 60) / 2,
    maxWidth: 165,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardName: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: 13,
    color: COLORS.white,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 11,
    color: 'rgba(255,248,240,0.45)',
    marginBottom: 12,
  },
  ringWrap: {
    height: 68,
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardStatus: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    lineHeight: 15,
  },

  // Condition pills on Emma's card
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 10,
  },
  conditionPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  conditionPillText: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: 9,
    color: COLORS.white,
  },

  // Bear
  bearWrap: {
    marginBottom: 4,
  },

  // Footer text
  footerText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,248,240,0.65)',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  footerEmphasis: {
    fontFamily: FONT_FAMILY.buttonLabel,
    color: COLORS.cream,
    fontStyle: 'italic',
  },

  // CTA
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.amber,
    paddingHorizontal: 32,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: FONT_SIZE.base,
    color: '#482B00',
  },
});
