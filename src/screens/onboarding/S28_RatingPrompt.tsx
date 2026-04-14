import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';
import ProgressBar from '../../components/shared/ProgressBar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S28_RatingPrompt'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_STARS = 5;

export default function S28_RatingPrompt({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  const watchlistCount = Math.max(state.conditions.length * 5, 10) + state.allergies.length * 3;
  const hasWater = !!state.zipCode;

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // ─── Animation values ───────────────────────────────────────────────
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(8)).current;
  const testimonialOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(16)).current;

  // Star fill animations (0=empty, 1=filled)
  const starAnims = useRef(
    Array.from({ length: NUM_STARS }, () => new Animated.Value(0))
  ).current;

  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Stats row
    Animated.timing(statsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Header
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 200));

    // Testimonials
    timers.push(setTimeout(() => {
      Animated.timing(testimonialOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 500));

    // Rating card
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardTranslate, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    }, 700));

    // Button always visible
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 900));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Star tap handler ───────────────────────────────────────────────
  const handleStarTap = async (starIndex: number) => {
    const newRating = starIndex + 1;
    setRating(newRating);

    // Animate stars left-to-right
    for (let i = 0; i < NUM_STARS; i++) {
      const targetValue = i <= starIndex ? 1 : 0;
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.timing(starAnims[i], {
          toValue: targetValue, duration: 100, useNativeDriver: false,
        }).start();
      }, i <= starIndex ? i * 100 : 0);
    }

    // 4 or 5 stars → trigger StoreReview after 300ms
    if (newRating >= 4) {
      setShowFeedback(false);
      setTimeout(async () => {
        try {
          if (await StoreReview.hasAction()) {
            await StoreReview.requestReview();
          }
        } catch {}
      }, 300);
    } else {
      // 1-3 stars → show feedback input
      setTimeout(() => {
        setShowFeedback(true);
        Animated.timing(feedbackOpacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }).start();
      }, NUM_STARS * 100 + 200);
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Store rating data locally (TODO: persist)
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S29_CommitmentRitual');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.progressRow}>
            <View style={styles.progressBarWrap}>
              <ProgressBar current={28} total={31} variant="dark" />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Stats row */}
            <Animated.Text style={[styles.statsText, { opacity: statsOpacity }]}>
              {watchlistCount} ingredients tracked · {state.conditions.length} conditions monitored
              {hasWater ? ' · Water alerts active' : ''}
            </Animated.Text>

            {/* Header */}
            <Animated.View
              style={[styles.headerWrap, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}
            >
              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>⭐</Text>
              </View>
              <Text style={styles.heading}>Are you loving Kuma so far?</Text>
              <Text style={styles.subheading}>
                A quick rating helps other parents find us.
              </Text>
            </Animated.View>

            {/* Compact testimonials */}
            <Animated.View style={[styles.testimonialsRow, { opacity: testimonialOpacity }]}>
              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialQuote}>
                  "Kuma changed how we approach mealtime. The ingredient tracking is so intuitive!"
                </Text>
                <View style={styles.testimonialAuthor}>
                  <Text style={styles.authorName}>Sarah M.</Text>
                  <Text style={styles.authorLabel}>Verified Parent</Text>
                </View>
              </View>
            </Animated.View>

            {/* Rating card */}
            <Animated.View
              style={[styles.ratingCard, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}
            >
              <Text style={styles.ratingTitle}>Loving Kuma so far?</Text>

              {/* Stars */}
              <View style={styles.starsRow}>
                {Array.from({ length: NUM_STARS }).map((_, i) => {
                  const color = starAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['rgba(255,248,240,0.2)', COLORS.amber],
                  });
                  return (
                    <Pressable key={i} onPress={() => handleStarTap(i)} hitSlop={6}>
                      <Animated.Text style={[styles.star, { color }]}>★</Animated.Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.ratingHint}>
                A quick rating helps other parents find us.
              </Text>

              {/* Negative feedback input */}
              {showFeedback && (
                <Animated.View style={[styles.feedbackWrap, { opacity: feedbackOpacity }]}>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder={`What could we improve for ${childName}?`}
                    placeholderTextColor="rgba(255,248,240,0.35)"
                    value={feedback}
                    onChangeText={setFeedback}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </Animated.View>
              )}
            </Animated.View>
          </ScrollView>

          {/* CTA — always visible */}
          <Animated.View
            style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
          >
            <Pressable onPress={handleContinue} style={styles.button}>
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1121' },
  kav: { flex: 1 },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, alignItems: 'center' },

  // Stats
  statsText: {
    fontFamily: FONT_FAMILY.body, fontSize: 11,
    color: 'rgba(255,241,229,0.4)', textAlign: 'center',
    letterSpacing: 0.3, marginBottom: 28,
  },

  // Header
  headerWrap: { alignItems: 'center', marginBottom: 24 },
  headerIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(133,83,0,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  headerIconText: { fontSize: 28 },
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 26, lineHeight: 34,
    color: COLORS.white, textAlign: 'center', marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.base,
    color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 16,
  },

  // Testimonials
  testimonialsRow: { width: '100%', marginBottom: 24 },
  testimonialCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.card, padding: 18,
  },
  testimonialQuote: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm, lineHeight: 22,
    color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: 12,
  },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 12, color: COLORS.white,
  },
  authorLabel: {
    fontFamily: FONT_FAMILY.body, fontSize: 10, color: 'rgba(255,255,255,0.4)',
  },

  // Rating card
  ratingCard: {
    width: '100%', backgroundColor: CARD_BG,
    borderRadius: 20, padding: 28, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3, shadowRadius: 50, elevation: 8,
  },
  ratingTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg,
    color: COLORS.white, marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  star: { fontSize: 28 },
  ratingHint: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,241,229,0.6)', textAlign: 'center',
    maxWidth: 200,
  },

  // Feedback
  feedbackWrap: { width: '100%', marginTop: 16 },
  feedbackInput: {
    width: '100%', minHeight: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.sm, padding: 14,
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: COLORS.cream, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // CTA
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base, color: '#482B00',
  },
});
