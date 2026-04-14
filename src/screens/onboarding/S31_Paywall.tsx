import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  FlatList,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S31_Paywall'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURE_CARD_WIDTH = 140;
const FEATURE_GAP = 12;
const AUTO_SCROLL_MS = 3000;

// ─── Feature mini cards ─────────────────────────────────────────────────
const FEATURES = [
  { icon: '🔍', label: 'Scan Products' },
  { icon: '💧', label: 'Water Alerts' },
  { icon: '📺', label: 'Safe Shows' },
  { icon: '📓', label: 'Health Journal' },
];

export default function S31_Paywall({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';
  const trialDays = state.trialDays;

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const featureListRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Disable Android back ───────────────────────────────────────────
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => handler.remove();
  }, []);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const carouselOpacity = useRef(new Animated.Value(0)).current;
  const giftOpacity = useRef(new Animated.Value(0)).current;
  const giftTranslate = useRef(new Animated.Value(20)).current;
  const pricingOpacity = useRef(new Animated.Value(0)).current;
  const pricingTranslate = useRef(new Animated.Value(12)).current;
  const saveBadgeScale = useRef(new Animated.Value(1)).current;

  const annualBorder = useRef(new Animated.Value(1)).current;
  const monthlyBorder = useRef(new Animated.Value(0)).current;

  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const bearOpacity = useRef(new Animated.Value(0)).current;

  // Dot widths
  const dotWidths = useRef(FEATURES.map((_, i) => new Animated.Value(i === 0 ? 6 : 4))).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // 2. Feature carousel
    timers.push(setTimeout(() => {
      Animated.timing(carouselOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300));

    // 3. Gift section slides up
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(giftOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(giftTranslate, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    }, 600));

    // 4. Pricing cards
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(pricingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(pricingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();

      // "Save 53%" badge pulse
      Animated.sequence([
        Animated.timing(saveBadgeScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(saveBadgeScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 900));

    // 5. CTA + bear
    timers.push(setTimeout(() => {
      Animated.timing(ctaOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      Animated.timing(bearOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 1100));

    // Auto-scroll features
    autoScrollRef.current = setInterval(() => {
      const next = (activeFeature + 1) % FEATURES.length;
      featureListRef.current?.scrollToOffset({ offset: next * (FEATURE_CARD_WIDTH + FEATURE_GAP), animated: true });
    }, AUTO_SCROLL_MS);

    return () => {
      timers.forEach(clearTimeout);
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, []);

  // Dot animation on feature change
  useEffect(() => {
    dotWidths.forEach((dw, i) => {
      Animated.timing(dw, { toValue: i === activeFeature ? 6 : 4, duration: 200, useNativeDriver: false }).start();
    });
  }, [activeFeature]);

  const onFeatureScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (FEATURE_CARD_WIDTH + FEATURE_GAP));
    if (idx !== activeFeature && idx >= 0 && idx < FEATURES.length) setActiveFeature(idx);
  }, [activeFeature]);

  // Plan selection
  useEffect(() => {
    Animated.parallel([
      Animated.timing(annualBorder, { toValue: selectedPlan === 'annual' ? 1 : 0, duration: 200, useNativeDriver: false }),
      Animated.timing(monthlyBorder, { toValue: selectedPlan === 'monthly' ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [selectedPlan]);

  const handleSelectPlan = (plan: 'annual' | 'monthly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  };

  // ─── Purchase handler (stubbed for RevenueCat) ──────────────────────
  const handlePurchase = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // TODO: RevenueCat Purchases.purchasePackage()
      // Simulating for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('PostPaymentLoading');
    } catch {
      // On failure: stay on screen
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: RevenueCat Purchases.restorePurchases()
  };

  const annualBorderColor = annualBorder.interpolate({
    inputRange: [0, 1], outputRange: ['transparent', COLORS.amber],
  });
  const monthlyBorderColor = monthlyBorder.interpolate({
    inputRange: [0, 1], outputRange: ['transparent', COLORS.amber],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background glows */}
      <View style={styles.glowRight} />
      <View style={styles.glowLeft} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Progress — full bar */}
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Animated.View style={[styles.headerWrap, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}>
            <Text style={styles.heading}>Protect {childName} starting today.</Text>
            <Text style={styles.subheading}>Unlock the full Kuma Guardian experience for your family.</Text>
          </Animated.View>

          {/* Feature carousel */}
          <Animated.View style={{ opacity: carouselOpacity }}>
            <FlatList
              ref={featureListRef}
              data={FEATURES}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={FEATURE_CARD_WIDTH + FEATURE_GAP}
              decelerationRate="fast"
              onScroll={onFeatureScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.featureListContent}
              ItemSeparatorComponent={() => <View style={{ width: FEATURE_GAP }} />}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <View style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{item.icon}</Text>
                  <Text style={styles.featureLabel}>{item.label}</Text>
                </View>
              )}
            />
            <View style={styles.dotsRow}>
              {FEATURES.map((_, i) => (
                <Animated.View
                  key={i}
                  style={[styles.dot, {
                    width: dotWidths[i],
                    backgroundColor: i === activeFeature ? COLORS.amber : '#4F5E81',
                  }]}
                />
              ))}
            </View>
          </Animated.View>

          {/* Gift section */}
          <Animated.View style={[styles.giftCard, { opacity: giftOpacity, transform: [{ translateY: giftTranslate }] }]}>
            <Text style={styles.giftTitle}>🎁 Included free:</Text>
            <View style={styles.giftItem}>
              <Text style={styles.giftCheck}>✓</Text>
              <Text style={styles.giftText}>
                {childName}'s Trigger Checklist (PDF) — <Text style={styles.giftBold}>$27 value</Text>
              </Text>
            </View>
            <View style={styles.giftItem}>
              <Text style={styles.giftCheck}>✓</Text>
              <Text style={styles.giftText}>
                The First 90 Days Guide (PDF) — <Text style={styles.giftBold}>$20 value</Text>
              </Text>
            </View>
          </Animated.View>

          {/* Pricing cards */}
          <Animated.View style={[styles.pricingRow, { opacity: pricingOpacity, transform: [{ translateY: pricingTranslate }] }]}>
            {/* Monthly */}
            <Pressable onPress={() => handleSelectPlan('monthly')} style={styles.pricingCardWrap}>
              <Animated.View style={[styles.pricingCard, { borderColor: monthlyBorderColor }]}>
                <Text style={styles.priceMain}>$11.99/mo</Text>
                <Text style={styles.priceSub}>Billed monthly.</Text>
              </Animated.View>
            </Pressable>

            {/* Annual */}
            <Pressable onPress={() => handleSelectPlan('annual')} style={styles.pricingCardWrap}>
              <Animated.View style={[styles.pricingCard, styles.pricingCardAnnual, { borderColor: annualBorderColor }]}>
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>BEST VALUE</Text>
                </View>
                <Text style={styles.priceMainAmber}>$5.58/mo</Text>
                <Text style={styles.priceAnnual}>$67/year</Text>
                <Animated.View style={[styles.saveBadge, { transform: [{ scale: saveBadgeScale }] }]}>
                  <Text style={styles.saveText}>Save 53%</Text>
                </Animated.View>
              </Animated.View>
            </Pressable>
          </Animated.View>

          {/* CTA area */}
          <Animated.View style={[styles.ctaWrap, { opacity: ctaOpacity }]}>
            <Text style={styles.trialNote}>
              Cancel anytime. {trialDays}-day free trial.
            </Text>

            <Pressable
              onPress={handlePurchase}
              disabled={isLoading}
              style={[styles.ctaButton, isLoading && styles.ctaButtonLoading]}
            >
              {isLoading ? (
                <ActivityIndicator color="#482B00" />
              ) : (
                <Text style={styles.ctaText}>Start Free Trial.</Text>
              )}
            </Pressable>

            <Pressable onPress={handleRestore} hitSlop={12}>
              <Text style={styles.restoreText}>Restore purchase</Text>
            </Pressable>
          </Animated.View>

          {/* Bear at bottom — calm, anchoring */}
          <Animated.View style={[styles.bearWrap, { opacity: bearOpacity }]}>
            <BearMascot expression="neutral" size={50} showBaby={true} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a2130' },
  safeArea: { flex: 1 },
  glowRight: {
    position: 'absolute', top: '25%', right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: COLORS.amber, opacity: 0.04,
  },
  glowLeft: {
    position: 'absolute', bottom: '25%', left: -80,
    width: 256, height: 256, borderRadius: 128,
    backgroundColor: '#4F5E81', opacity: 0.08,
  },

  // Progress (full)
  progressTrack: {
    height: 6, backgroundColor: '#4F5E81', marginHorizontal: 24, marginTop: 8,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', width: '100%', backgroundColor: COLORS.amber, borderRadius: 3,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 24 },

  // Header
  headerWrap: { paddingHorizontal: 28, alignItems: 'center', marginBottom: 20 },
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center', marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: '#c5d4fd', opacity: 0.8, textAlign: 'center', maxWidth: 260,
  },

  // Features
  featureListContent: { paddingHorizontal: 24 },
  featureCard: {
    width: FEATURE_CARD_WIDTH, backgroundColor: CARD_BG,
    borderRadius: RADIUS.card, padding: 16,
    alignItems: 'center',
  },
  featureIcon: { fontSize: 24, marginBottom: 8 },
  featureLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 11,
    color: COLORS.cream, textTransform: 'uppercase', letterSpacing: 1.2,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 5,
    marginTop: 10, marginBottom: 16,
  },
  dot: { height: 4, borderRadius: 2 },

  // Gift
  giftCard: {
    backgroundColor: CARD_BG, borderRadius: RADIUS.card,
    borderLeftWidth: 4, borderLeftColor: COLORS.amber,
    padding: 18, marginHorizontal: 24, marginBottom: 16, gap: 10,
  },
  giftTitle: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: FONT_SIZE.sm,
    color: '#ffb951', marginBottom: 4,
  },
  giftItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  giftCheck: { color: COLORS.amber, fontFamily: FONT_FAMILY.buttonLabel, fontSize: 12, marginTop: 1 },
  giftText: { fontFamily: FONT_FAMILY.body, fontSize: 12, lineHeight: 19, color: COLORS.cream, flex: 1 },
  giftBold: { fontFamily: FONT_FAMILY.buttonLabel },

  // Pricing
  pricingRow: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 20,
  },
  pricingCardWrap: { flex: 1 },
  pricingCard: {
    backgroundColor: CARD_BG, borderRadius: RADIUS.card, borderWidth: 2,
    padding: 18, alignItems: 'center', justifyContent: 'center',
  },
  pricingCardAnnual: { position: 'relative', overflow: 'hidden' },
  priceMain: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.xl,
    color: COLORS.cream,
  },
  priceMainAmber: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.xl,
    color: '#ffb951', marginTop: 8,
  },
  priceSub: {
    fontFamily: FONT_FAMILY.body, fontSize: 10, color: '#c5d4fd',
    opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4,
  },
  priceAnnual: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: COLORS.cream, opacity: 0.9, marginTop: 2,
  },
  bestValueBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: COLORS.amber, borderBottomLeftRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  bestValueText: {
    fontFamily: FONT_FAMILY.heading, fontSize: 8,
    color: '#855300', letterSpacing: 0.5,
  },
  saveBadge: {
    backgroundColor: COLORS.safe, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 8,
  },
  saveText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9,
    color: COLORS.white, textTransform: 'uppercase',
  },

  // CTA
  ctaWrap: { paddingHorizontal: 24, alignItems: 'center', gap: 14 },
  trialNote: {
    fontFamily: FONT_FAMILY.body, fontSize: 12,
    color: 'rgba(255,241,229,0.4)',
  },
  ctaButton: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  ctaButtonLoading: { opacity: 0.8 },
  ctaText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
  restoreText: {
    fontFamily: FONT_FAMILY.body, fontSize: 12,
    color: 'rgba(255,241,229,0.25)',
  },

  // Bear
  bearWrap: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
});
