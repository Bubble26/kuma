import React, { useEffect, useRef } from 'react';
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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S02_ScaryStat'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Word-by-word stat ──────────────────────────────────────────────────
const STAT_WORDS = [
  '34', 'potentially', 'harmful', 'chemicals',
  'were', 'detected', 'in', 'over',
  '90%', 'of', 'American', 'preschoolers.',
];
const GUT_PUNCH_INDEX = STAT_WORDS.indexOf('90%');
const WORD_DELAY = 80; // ms between each word

export default function S02_ScaryStat({ navigation }: Props) {
  // ─── Animation values ───────────────────────────────────────────────
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // One opacity per word
  const wordAnims = useRef(STAT_WORDS.map(() => new Animated.Value(0))).current;

  const citation1Opacity = useRef(new Animated.Value(0)).current;
  const secondStatOpacity = useRef(new Animated.Value(0)).current;
  const secondStatTranslate = useRef(new Animated.Value(10)).current;
  const citation2Opacity = useRef(new Animated.Value(0)).current;
  const cubOpacity = useRef(new Animated.Value(0)).current;
  const cubBob = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. "Did you know?" fades in (300ms)
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // 2. After 500ms: word-by-word reveal
    const wordStartDelay = 500;
    STAT_WORDS.forEach((word, i) => {
      const wordDelay = wordStartDelay + i * WORD_DELAY;
      timers.push(
        setTimeout(() => {
          // Haptic on "90%"
          if (i === GUT_PUNCH_INDEX) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          Animated.timing(wordAnims[i], {
            toValue: 1,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }, wordDelay)
      );
    });

    // Total time for all words to appear
    const allWordsTime = wordStartDelay + STAT_WORDS.length * WORD_DELAY + 120;

    // 3. Citation 1 fades in after main stat
    timers.push(
      setTimeout(() => {
        Animated.timing(citation1Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }, allWordsTime + 200)
    );

    // 4. Second stat block fades in 500ms after citation
    const secondStatTime = allWordsTime + 200 + 500;
    timers.push(
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(secondStatOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(secondStatTranslate, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, secondStatTime)
    );

    // 4b. Citation 2 fades in shortly after second stat
    timers.push(
      setTimeout(() => {
        Animated.timing(citation2Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }, secondStatTime + 400)
    );

    // 5. Bear cub fades in 500ms after second stat
    const cubTime = secondStatTime + 500 + 500;
    timers.push(
      setTimeout(() => {
        Animated.timing(cubOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();

        // Start cub bob loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(cubBob, {
              toValue: -4,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(cubBob, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, cubTime)
    );

    // 6. Button fades in with the second stat
    timers.push(
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
      }, secondStatTime + 200)
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
      navigation.navigate('S03_GentleLie');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Subtle radial glow */}
      <View style={styles.radialGlow} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── Progress bar ─────────────────────────────────────────── */}
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <ProgressBar current={2} total={31} variant="dark" />
          </View>
          <SkipLink
            onPress={() => navigation.navigate('S09_WhoAreYouProtecting')}
            variant="dark"
          />
        </View>

        {/* ── Content ──────────────────────────────────────────────── */}
        <View style={styles.content}>
          {/* "Did you know?" */}
          <Animated.Text style={[styles.header, { opacity: headerOpacity }]}>
            Did you know?
          </Animated.Text>

          {/* Primary stat — word by word */}
          <View style={styles.statContainer}>
            <Text style={styles.statText}>
              {STAT_WORDS.map((word, i) => (
                <Animated.Text
                  key={i}
                  style={[
                    styles.statWord,
                    i === GUT_PUNCH_INDEX && styles.statWordHighlight,
                    { opacity: wordAnims[i] },
                  ]}
                >
                  {word}{i < STAT_WORDS.length - 1 ? ' ' : ''}
                </Animated.Text>
              ))}
            </Text>

            {/* Citation 1 */}
            <Animated.Text style={[styles.citation, { opacity: citation1Opacity }]}>
              UC Davis / Environmental Influences on Child Health, 2025
            </Animated.Text>
          </View>

          {/* Secondary stat */}
          <Animated.View
            style={[
              styles.secondStatContainer,
              {
                opacity: secondStatOpacity,
                transform: [{ translateY: secondStatTranslate }],
              },
            ]}
          >
            <Text style={styles.secondStatText}>
              The average child is exposed to 27 chemicals a day through personal
              care products alone that have not been found safe for children.
            </Text>
            <Animated.Text style={[styles.citation, { opacity: citation2Opacity }]}>
              Environmental Working Group, survey of 3,300+ parents
            </Animated.Text>
          </Animated.View>
        </View>

        {/* ── Bear cub (bottom-right) ──────────────────────────────── */}
        <Animated.View
          style={[
            styles.cubContainer,
            {
              opacity: cubOpacity,
              transform: [{ translateY: cubBob }],
            },
          ]}
        >
          <BearMascot expression="concerned" size={65} showBaby={false} />
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
            <Text style={styles.buttonText}>That's not okay.</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  radialGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    // Approximate radial glow with a centered amber tint
    backgroundColor: 'transparent',
    borderWidth: 0,
    // Use a simple overlay since RN doesn't support radial-gradient natively
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
  progressBar: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // "Did you know?"
  header: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 248, 240, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Primary stat
  statContainer: {
    marginBottom: 56,
  },
  statText: {
    textAlign: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statWord: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 30,
    lineHeight: 40,
    color: COLORS.cream,
    letterSpacing: -0.3,
  },
  statWordHighlight: {
    color: COLORS.amber,
  },
  citation: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 10,
    color: 'rgba(255, 248, 240, 0.25)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 16,
  },

  // Secondary stat
  secondStatContainer: {
    alignItems: 'center',
  },
  secondStatText: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255, 248, 240, 0.6)',
    textAlign: 'center',
    maxWidth: 280,
  },

  // Cub
  cubContainer: {
    position: 'absolute',
    bottom: 120,
    right: 28,
    opacity: 0.8,
  },

  // Footer
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
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});
