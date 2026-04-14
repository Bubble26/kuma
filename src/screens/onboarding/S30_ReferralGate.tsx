import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Share,
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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S30_ReferralGate'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function S30_ReferralGate({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [showConfirmation, setShowConfirmation] = useState(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  // Phones + mascot + glow line
  const illustrationOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  // Cards
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslate = useRef(new Animated.Value(16)).current;

  // Confirmation
  const confirmOpacity = useRef(new Animated.Value(0)).current;

  // Footer
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    timers.push(setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 200));

    // 2. Illustration fades in (400ms)
    timers.push(setTimeout(() => {
      Animated.timing(illustrationOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

      // Glow line draws through (600ms)
      Animated.timing(lineWidth, {
        toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: false,
      }).start();
    }, 400));

    // 3. Cards
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardsTranslate, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    }, 800));

    // 4. Footer text
    timers.push(setTimeout(() => {
      Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1200));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Share handler ──────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `I'm using Kuma to protect ${childName} from hidden ingredients. Try it free for 14 days: https://kuma.app/ref/DEMO`,
      });

      if (result.action === Share.sharedAction) {
        // Shared successfully
        dispatch({ type: 'SET_REFERRAL_SHARED', payload: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Show confirmation
        setShowConfirmation(true);
        Animated.timing(confirmOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

        // Navigate after 1.5s
        setTimeout(() => {
          navigation.navigate('S31_Paywall');
        }, 1500);
      }
      // If cancelled, stay on screen — no state change
    } catch {
      // Share failed, stay on screen
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'SET_REFERRAL_SHARED', payload: false });
    navigation.navigate('S31_Paywall');
  };

  const lineWidthInterpolated = lineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={30} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Heading */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            Give {childName}'s protection{'\n'}to another family.
          </Animated.Text>
          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            Share Kuma and get 14 days free instead of 7.
          </Animated.Text>

          {/* Phones + mascot illustration */}
          <Animated.View style={[styles.illustrationWrap, { opacity: illustrationOpacity }]}>
            {/* Background glow */}
            <View style={styles.illustrationGlow} />

            <View style={styles.phonesRow}>
              {/* Left phone */}
              <View style={styles.phoneSilhouette}>
                <View style={styles.phoneGradient} />
              </View>

              {/* Mascot center */}
              <View style={styles.mascotCenter}>
                <Text style={styles.mascotEmoji}>🐻</Text>
                {/* Glow line through mascot */}
                <Animated.View style={[styles.glowLine, { width: lineWidthInterpolated }]} />
              </View>

              {/* Right phone */}
              <View style={styles.phoneSilhouette}>
                <View style={styles.phoneGradient} />
              </View>
            </View>
          </Animated.View>

          {/* Confirmation overlay */}
          {showConfirmation && (
            <Animated.View style={[styles.confirmBadge, { opacity: confirmOpacity }]}>
              <Text style={styles.confirmText}>✓ 14 days unlocked!</Text>
            </Animated.View>
          )}

          {/* Action cards */}
          <Animated.View
            style={[styles.cardsWrap, { opacity: cardsOpacity, transform: [{ translateY: cardsTranslate }] }]}
          >
            {/* Share card */}
            <Pressable onPress={handleShare} style={({ pressed }) => [styles.shareCard, pressed && styles.cardPressed]}>
              <View style={styles.shareCardContent}>
                <View style={styles.shareTextWrap}>
                  <Text style={styles.shareTitle}>Share with a friend</Text>
                  <Text style={styles.shareSub}>You get 14 days free. They get 14 days free.</Text>
                </View>
                <View style={styles.shareIconWrap}>
                  <Text style={styles.shareIcon}>↗</Text>
                </View>
              </View>
            </Pressable>

            {/* Skip card */}
            <Pressable onPress={handleSkip} style={({ pressed }) => [styles.skipCard, pressed && styles.cardPressed]}>
              <Text style={styles.skipText}>Skip — start with 7 days free</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <Text style={styles.footerText}>
            You can always share later from your profile.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0f1a' },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  content: {
    flex: 1, paddingHorizontal: 24, paddingTop: 24,
    alignItems: 'center',
  },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.white, textAlign: 'center', marginBottom: 10,
  },
  subheading: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: COLORS.amber, marginBottom: 28,
  },

  // Illustration
  illustrationWrap: {
    width: '100%', aspectRatio: 16 / 9,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32, position: 'relative',
  },
  illustrationGlow: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: 'rgba(212,137,14,0.08)', borderRadius: 100,
  },
  phonesRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 0,
  },
  phoneSilhouette: {
    width: 56, height: 96, backgroundColor: '#1a1e2e',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
  },
  phoneGradient: {
    flex: 1, backgroundColor: 'rgba(212,137,14,0.05)',
  },
  mascotCenter: {
    marginHorizontal: -12, zIndex: 2, alignItems: 'center', justifyContent: 'center',
  },
  mascotEmoji: {
    fontSize: 56,
    // Glow shadow
    textShadowColor: 'rgba(212,137,14,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  glowLine: {
    position: 'absolute', height: 2,
    backgroundColor: COLORS.amber, borderRadius: 1,
    top: '50%', left: -40, opacity: 0.4,
  },

  // Confirmation
  confirmBadge: {
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 10,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(76,175,80,0.3)',
  },
  confirmText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: FONT_SIZE.base,
    color: COLORS.safe,
  },

  // Cards
  cardsWrap: { width: '100%', gap: 12 },
  cardPressed: { transform: [{ scale: 0.97 }] },

  shareCard: {
    width: '100%', backgroundColor: COLORS.amber,
    borderRadius: RADIUS.card, padding: 22, overflow: 'hidden',
    shadowColor: 'rgba(40,25,3,0.15)', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1, shadowRadius: 32, elevation: 6,
  },
  shareCardContent: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  shareTextWrap: { flex: 1, paddingRight: 12 },
  shareTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg,
    color: '#482B00', marginBottom: 4,
  },
  shareSub: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: 'rgba(72,43,0,0.8)',
  },
  shareIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 20, color: COLORS.white, fontWeight: '700',
  },

  skipCard: {
    width: '100%', backgroundColor: 'rgba(26,30,46,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: RADIUS.card, padding: 18,
    alignItems: 'center',
  },
  skipText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.5)',
  },

  // Footer
  footer: { paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  footerText: {
    fontFamily: FONT_FAMILY.body, fontSize: 10,
    color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
    letterSpacing: 2, textAlign: 'center',
  },
});
