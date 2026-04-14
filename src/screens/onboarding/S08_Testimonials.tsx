import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
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
import { TESTIMONIALS, Testimonial } from '../../data/testimonials';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S08_Testimonials'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 3500;
const PAUSE_AFTER_TOUCH = 5000;
const STAR_STAGGER = 50;
const CARD_HEIGHT = 170;

export default function S08_Testimonials({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;

  // Per-card: opacity + translateY
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;

  // Stars (5 per card)
  const starAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  // Tag badge pulse
  const tagScale = useRef(new Animated.Value(1)).current;

  // Footer stat
  const statOpacity = useRef(new Animated.Value(0)).current;
  const statTranslate = useRef(new Animated.Value(8)).current;

  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // ─── Animate card entrance ──────────────────────────────────────────
  const animateCardIn = useCallback(() => {
    // Reset
    cardOpacity.setValue(0);
    cardTranslateY.setValue(20);
    starAnims.forEach((s) => s.setValue(0));
    tagScale.setValue(1);

    // Card slide up + fade
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1, duration: 400,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0, duration: 400,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();

    // Stars stagger
    starAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.timing(anim, {
          toValue: 1, duration: 150,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }).start();
      }, 200 + i * STAR_STAGGER);
    });

    // Tag badge pulse on first appearance
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(tagScale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
        Animated.timing(tagScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 500);
  }, []);

  // ─── Auto-scroll logic ──────────────────────────────────────────────
  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIndex((prev) => {
          const next = (prev + 1) % TESTIMONIALS.length;
          return next;
        });
      }
    }, AUTO_SCROLL_INTERVAL);
  }, []);

  const pauseAutoScroll = useCallback(() => {
    isPausedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, PAUSE_AFTER_TOUCH);
  }, []);

  // ─── Animate on index change ───────────────────────────────────────
  useEffect(() => {
    animateCardIn();
  }, [activeIndex]);

  // ─── Mount: heading, stat, button, auto-scroll ─────────────────────
  useEffect(() => {
    // Heading
    Animated.parallel([
      Animated.timing(headingOpacity, {
        toValue: 1, duration: 400,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(headingTranslate, {
        toValue: 0, duration: 400,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
    ]).start();

    // Stat line
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(statOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.timing(statTranslate, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // Button
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Start auto-scroll
    startAutoScroll();

    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // ─── Manual navigation ──────────────────────────────────────────────
  const goToCard = (index: number) => {
    pauseAutoScroll();
    setActiveIndex(index);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S09_WhoAreYouProtecting');
    });
  };

  const card = TESTIMONIALS[activeIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background glows */}
      <View style={styles.glowRight} />
      <View style={styles.glowLeft} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Progress — no skip on last education screen */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={8} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Heading */}
          <Animated.Text
            style={[
              styles.heading,
              { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] },
            ]}
          >
            Parents are paying attention.
          </Animated.Text>

          {/* Testimonial card */}
          <Pressable
            onPressIn={pauseAutoScroll}
            style={styles.cardTouchArea}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: cardOpacity,
                  transform: [{ translateY: cardTranslateY }],
                },
              ]}
            >
              {/* Stars */}
              <View style={styles.starsRow}>
                {Array.from({ length: card.stars }).map((_, i) => (
                  <Animated.Text
                    key={i}
                    style={[styles.star, { opacity: starAnims[i] }]}
                  >
                    ★
                  </Animated.Text>
                ))}
              </View>

              {/* Quote */}
              <Text style={styles.quote}>"{card.quote}"</Text>

              {/* Footer: name + tag */}
              <View style={styles.cardFooter}>
                <Text style={styles.authorName}>{card.name}</Text>
                <Animated.View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: card.tagColor,
                      transform: [{ scale: tagScale }],
                    },
                  ]}
                >
                  <Text style={styles.tagText}>{card.tag}</Text>
                </Animated.View>
              </View>
            </Animated.View>
          </Pressable>

          {/* Pagination dots */}
          <View style={styles.dotsRow}>
            {TESTIMONIALS.map((_, i) => (
              <Pressable key={i} onPress={() => goToCard(i)} hitSlop={8}>
                <View
                  style={[
                    styles.dot,
                    i === activeIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Stat line */}
          <Animated.Text
            style={[
              styles.statText,
              { opacity: statOpacity, transform: [{ translateY: statTranslate }] },
            ]}
          >
            Parents find an average of 6 hidden triggers for their child in the
            first week.
          </Animated.Text>
        </View>

        {/* CTA */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslate }, { scale: buttonScale }],
            },
          ]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>Protect my child.</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  glowRight: {
    position: 'absolute', top: '20%', right: '-10%',
    width: 256, height: 256, borderRadius: 128,
    backgroundColor: COLORS.amber, opacity: 0.06,
  },
  glowLeft: {
    position: 'absolute', bottom: '10%', left: '-10%',
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: '#4F5E81', opacity: 0.12,
  },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm, gap: 16,
  },
  progressBarWrap: { flex: 1 },

  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 20, lineHeight: 28,
    color: COLORS.white, textAlign: 'center', marginBottom: 32,
  },

  // Card
  cardTouchArea: { width: '100%' },
  card: {
    backgroundColor: '#FFF8F0', borderRadius: 16,
    padding: 20, width: '100%', minHeight: CARD_HEIGHT,
    shadowColor: 'rgba(40,25,3,0.06)', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1, shadowRadius: 32, elevation: 4,
  },
  starsRow: {
    flexDirection: 'row', gap: 2, marginBottom: 10,
  },
  star: {
    fontSize: 12, color: COLORS.amber,
  },
  quote: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 14, lineHeight: 22,
    color: COLORS.navy, marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  authorName: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 11, color: COLORS.navy,
  },
  tagBadge: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  tagText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9, color: COLORS.white,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 28,
  },
  dot: { borderRadius: 4 },
  dotActive: {
    width: 20, height: 7, backgroundColor: COLORS.amber, borderRadius: 4,
  },
  dotInactive: {
    width: 7, height: 7, backgroundColor: 'rgba(255,248,240,0.2)', borderRadius: 4,
  },

  // Stat
  statText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 13, lineHeight: 21,
    color: 'rgba(255,248,240,0.6)', textAlign: 'center', maxWidth: 280,
  },

  // CTA
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
});
