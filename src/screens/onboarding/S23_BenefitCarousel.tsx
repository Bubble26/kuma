import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S23_BenefitCarousel'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const AUTO_SCROLL_MS = 4000;
const PAUSE_MS = 5000;

// ─── Benefit card data ──────────────────────────────────────────────────
interface BenefitCard {
  icon: string;
  title: string;
  descriptionTemplate: string; // {childName} and {conditions} replaced at render
  iconBg: string;
}

const BENEFITS: BenefitCard[] = [
  {
    icon: '🔍',
    title: 'Scan Any Product',
    descriptionTemplate: "Personalized scores based on {childName}'s {conditions}.",
    iconBg: 'rgba(212,137,14,0.2)',
  },
  {
    icon: '💧',
    title: 'Monitor Tap Water',
    descriptionTemplate: "EPA data for your zip code, linked to {childName}'s conditions.",
    iconBg: 'rgba(197,212,253,0.2)',
  },
  {
    icon: '👥',
    title: 'Parent Community',
    descriptionTemplate: "Ratings filtered by condition. See what other {conditionLabel} families trust.",
    iconBg: 'rgba(205,141,29,0.2)',
  },
  {
    icon: '📺',
    title: 'Safe Shows',
    descriptionTemplate: "Low-stimulation recommendations rated for {childName}'s age.",
    iconBg: 'rgba(255,185,94,0.2)',
  },
  {
    icon: '📓',
    title: 'Health Journal',
    descriptionTemplate: "Track reactions, spot patterns, share reports with {childName}'s doctor.",
    iconBg: 'rgba(252,222,186,0.2)',
  },
];

// Condition labels for description text
const CONDITION_LABELS: Record<string, string> = {
  eczema: 'eczema',
  adhd: 'ADHD',
  food_allergies: 'food allergy',
  asthma: 'asthma',
  celiac: 'celiac',
  skin_sensitivities: 'sensitive skin',
  autism_sensory: 'sensory',
};

export default function S23_BenefitCarousel({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';
  const [activeIndex, setActiveIndex] = useState(0);

  // Build condition-specific text
  const conditionsText = state.conditions
    .map((c) => CONDITION_LABELS[c])
    .filter(Boolean)
    .join(', ') || 'conditions';

  const firstConditionLabel = state.conditions.length > 0
    ? (CONDITION_LABELS[state.conditions[0]] || 'condition')
    : 'health';

  const flatListRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef = useRef(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const carouselOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Dot width animations (active=24, inactive=8)
  const dotWidths = useRef(BENEFITS.map((_, i) => new Animated.Value(i === 0 ? 24 : 8))).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // 2. Carousel
    timers.push(setTimeout(() => {
      Animated.timing(carouselOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 400));

    // 3. Dots
    timers.push(setTimeout(() => {
      Animated.timing(dotsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 600));

    // 4. Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 800));

    // 5. Auto-scroll
    startAutoScroll();

    return () => {
      timers.forEach(clearTimeout);
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // Update dots on index change
  useEffect(() => {
    dotWidths.forEach((dw, i) => {
      Animated.timing(dw, {
        toValue: i === activeIndex ? 24 : 8,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex]);

  const startAutoScroll = () => {
    autoScrollRef.current = setInterval(() => {
      if (!isPausedRef.current && flatListRef.current) {
        const nextIndex = (activeIndex + 1) % BENEFITS.length;
        flatListRef.current.scrollToOffset({
          offset: nextIndex * SNAP_INTERVAL,
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

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SNAP_INTERVAL);
    if (index !== activeIndex && index >= 0 && index < BENEFITS.length) {
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const getDescription = (template: string): string => {
    return template
      .replace('{childName}', childName)
      .replace('{conditions}', conditionsText)
      .replace('{conditionLabel}', firstConditionLabel);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S24_Notifications');
    });
  };

  const renderCard = useCallback(({ item }: { item: BenefitCard }) => (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: item.iconBg }]}>
        <Text style={styles.cardIconText}>{item.icon}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{getDescription(item.descriptionTemplate)}</Text>
    </View>
  ), [childName, conditionsText, firstConditionLabel]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={23} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Heading */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            Everything Kuma does for {childName}.
          </Animated.Text>

          {/* Carousel */}
          <Animated.View style={[styles.carouselWrap, { opacity: carouselOpacity }]}>
            <FlatList
              ref={flatListRef}
              data={BENEFITS}
              renderItem={renderCard}
              keyExtractor={(item) => item.title}
              horizontal
              pagingEnabled={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onScrollBeginDrag={pauseAutoScroll}
              ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            />
          </Animated.View>

          {/* Pagination dots */}
          <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
            {BENEFITS.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidths[i],
                    backgroundColor: i === activeIndex ? COLORS.amber : 'rgba(255,248,240,0.2)',
                  },
                ]}
              />
            ))}
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>I'm ready.</Text>
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
    color: COLORS.cream, paddingHorizontal: 28, marginBottom: 28,
  },

  // Carousel
  carouselWrap: { marginBottom: 20 },
  carouselContent: { paddingHorizontal: 24 },

  // Card
  card: {
    width: CARD_WIDTH, backgroundColor: CARD_BG,
    borderRadius: 28, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },
  cardIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  cardIconText: { fontSize: 28 },
  cardTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: 24, lineHeight: 32,
    color: COLORS.white, marginBottom: 10,
  },
  cardDesc: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.lg, lineHeight: 28,
    color: '#b7c6ee',
  },

  // Dots
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6,
  },
  dot: {
    height: 8, borderRadius: 4,
  },

  // CTA
  footer: { paddingHorizontal: 28, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
});
