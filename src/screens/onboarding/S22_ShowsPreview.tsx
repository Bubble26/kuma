import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  FlatList,
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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S22_LowStimShows'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 150;
const CARD_GAP = 12;
const AUTO_SCROLL_MS = 3000;
const PAUSE_MS = 5000;

// ─── Sensory rating levels ──────────────────────────────────────────────
type SensoryLevel = 'low' | 'moderate' | 'high';
interface SensoryRating {
  icon: string;
  label: string;
  level: SensoryLevel;
}

function levelColor(level: SensoryLevel): string {
  return level === 'low' ? COLORS.safe : level === 'moderate' ? COLORS.amber : COLORS.coral;
}

// ─── Show data ──────────────────────────────────────────────────────────
interface ShowCard {
  title: string;
  ageRange: string;
  emoji: string; // placeholder for thumbnail
  ratings: SensoryRating[];
}

const SHOWS: ShowCard[] = [
  {
    title: 'Forest Friends',
    ageRange: 'Ages 3-6',
    emoji: '🌿',
    ratings: [
      { icon: '⚡', label: 'Low flashing', level: 'low' },
      { icon: '🔊', label: 'Moderate sound', level: 'moderate' },
      { icon: '🌬️', label: 'Slow pace', level: 'low' },
    ],
  },
  {
    title: 'Ocean Whispers',
    ageRange: 'Ages 3-6',
    emoji: '🐋',
    ratings: [
      { icon: '⚡', label: 'Low flashing', level: 'low' },
      { icon: '🔇', label: 'Low sound', level: 'low' },
      { icon: '🌬️', label: 'Slow pace', level: 'low' },
    ],
  },
  {
    title: 'Tiny Tales',
    ageRange: 'Ages 3-6',
    emoji: '🧸',
    ratings: [
      { icon: '⚡', label: 'Low flashing', level: 'low' },
      { icon: '🔊', label: 'Moderate sound', level: 'moderate' },
      { icon: '🌬️', label: 'Slow pace', level: 'low' },
    ],
  },
];

const SENSORY_CONDITIONS = ['adhd', 'autism_sensory', 'skin_sensitivities'];

export default function S22_ShowsPreview({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  // Full or compact mode based on conditions
  const isFullMode = useMemo(
    () => state.conditions.some((c) => SENSORY_CONDITIONS.includes(c)),
    [state.conditions]
  );

  const flatListRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const carouselOpacity = useRef(new Animated.Value(0)).current;
  const noteOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Card entrance anims (staggered)
  const cardAnims = useRef(
    SHOWS.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    timers.push(setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300));

    // 2. Carousel + cards stagger
    timers.push(setTimeout(() => {
      Animated.timing(carouselOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      const showCount = isFullMode ? SHOWS.length : 1;
      for (let i = 0; i < showCount; i++) {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(cardAnims[i].opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(cardAnims[i].translateX, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
          ]).start();
        }, i * 150);
      }
    }, 600));

    // 3. Note
    timers.push(setTimeout(() => {
      Animated.timing(noteOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1200));

    // 4. Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 1000));

    // 5. Auto-scroll (full mode only)
    if (isFullMode) {
      startAutoScroll();
    }

    return () => {
      timers.forEach(clearTimeout);
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  const startAutoScroll = () => {
    autoScrollRef.current = setInterval(() => {
      if (!isPausedRef.current && flatListRef.current) {
        currentIndexRef.current = (currentIndexRef.current + 1) % SHOWS.length;
        flatListRef.current.scrollToIndex({
          index: currentIndexRef.current,
          animated: true,
        });
      }
    }, AUTO_SCROLL_MS);
  };

  const pauseAutoScroll = () => {
    isPausedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, PAUSE_MS);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S23_BenefitCarousel');
    });
  };

  const renderShowCard = useCallback(({ item, index }: { item: ShowCard; index: number }) => (
    <Animated.View
      style={[
        styles.showCard,
        {
          opacity: cardAnims[index]?.opacity ?? 1,
          transform: [{ translateX: cardAnims[index]?.translateX ?? 0 }],
        },
      ]}
    >
      {/* Thumbnail placeholder */}
      <View style={styles.cardThumb}>
        <Text style={styles.cardThumbEmoji}>{item.emoji}</Text>
        <View style={styles.ageBadge}>
          <Text style={styles.ageBadgeText}>{item.ageRange}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>

        {/* Sensory ratings */}
        <View style={styles.ratingsWrap}>
          {item.ratings.map((r, ri) => (
            <View key={ri} style={styles.ratingRow}>
              <Text style={[styles.ratingIcon, { color: levelColor(r.level) }]}>{r.icon}</Text>
              <Text style={[styles.ratingLabel, { color: levelColor(r.level) }]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={22} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Heading */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            {isFullMode
              ? `Safe screens for ${childName}.`
              : `Kuma also finds calming shows for ${childName}.`}
          </Animated.Text>
          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            {isFullMode
              ? `Shows rated by overstimulation level, filtered for ${childName}'s age and sensitivities.`
              : 'Every show rated for visual intensity, sound levels, and pacing.'}
          </Animated.Text>

          {/* Show carousel */}
          <Animated.View style={[styles.carouselWrap, { opacity: carouselOpacity }]}>
            <FlatList
              ref={flatListRef}
              data={isFullMode ? SHOWS : [SHOWS[0]]}
              renderItem={renderShowCard}
              keyExtractor={(item) => item.title}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScrollBeginDrag={pauseAutoScroll}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
          </Animated.View>

          {/* Note */}
          <Animated.View style={[styles.noteCard, { opacity: noteOpacity }]}>
            <Text style={styles.noteIcon}>🛡️</Text>
            <Text style={styles.noteText}>
              Every show rated for visual intensity, sound levels, and pacing.
            </Text>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>One more thing.</Text>
            <Text style={styles.buttonArrow}>→</Text>
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

  content: { flex: 1, paddingTop: 24 },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, marginBottom: 8, paddingHorizontal: 24,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm, lineHeight: 20,
    color: 'rgba(255,248,240,0.55)', paddingHorizontal: 24, marginBottom: 28,
  },

  // Carousel
  carouselWrap: { marginBottom: 24 },
  carouselContent: { paddingHorizontal: 24 },

  // Show card
  showCard: {
    width: CARD_WIDTH, height: 220,
    backgroundColor: CARD_BG, borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  cardThumb: {
    height: 90, backgroundColor: 'rgba(255,248,240,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardThumbEmoji: { fontSize: 36 },
  ageBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,248,240,0.2)', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  ageBadgeText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9, color: COLORS.cream,
  },
  cardContent: { padding: 10, flex: 1, justifyContent: 'space-between' },
  cardTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: 13,
    color: COLORS.cream, marginBottom: 6,
  },
  ratingsWrap: { gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingIcon: { fontSize: 12 },
  ratingLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },

  // Note
  noteCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: CARD_BG, borderRadius: RADIUS.card,
    padding: 18, marginHorizontal: 24,
  },
  noteIcon: { fontSize: 18, marginTop: 1 },
  noteText: {
    fontFamily: FONT_FAMILY.body, fontSize: 12, lineHeight: 19,
    color: 'rgba(255,248,240,0.5)', fontStyle: 'italic', flex: 1,
  },

  // CTA
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
  buttonArrow: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
});
