import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { RADIUS, SPACING } from '../../theme/spacing';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboarding } from '../../context/OnboardingContext';
import ProgressBar from '../../components/shared/ProgressBar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S24_Notifications'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function S24_Notifications({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const firstCondition = state.conditions[0] || 'eczema';

  // Map condition to display text
  const conditionDisplay: Record<string, string> = {
    eczema: 'eczema', adhd: 'ADHD', food_allergies: 'food allergies',
    asthma: 'asthma', celiac: 'celiac', skin_sensitivities: 'skin sensitivity',
    autism_sensory: 'sensory needs',
  };
  const conditionLabel = conditionDisplay[firstCondition] || 'conditions';

  const [selected, setSelected] = useState<'yes' | 'later'>('yes'); // pre-selected yes

  // ─── Animation values ───────────────────────────────────────────────
  const notifTranslateY = useRef(new Animated.Value(-80)).current;
  const notifOpacity = useRef(new Animated.Value(0)).current;
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslate = useRef(new Animated.Value(12)).current;

  const yesBorderAnim = useRef(new Animated.Value(1)).current; // pre-selected
  const laterBorderAnim = useRef(new Animated.Value(0)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Mock notification slides down (400ms, bounce)
    Animated.parallel([
      Animated.spring(notifTranslateY, {
        toValue: 0, friction: 7, tension: 50, useNativeDriver: true,
      }),
      Animated.timing(notifOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
    ]).start();

    // 2. Heading after notification lands
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 500));

    // 3. Sub
    timers.push(setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800));

    // 4. Cards
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardsTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 1000));

    // 5. Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 1200));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Selection animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(yesBorderAnim, { toValue: selected === 'yes' ? 1 : 0, duration: 200, useNativeDriver: false }),
      Animated.timing(laterBorderAnim, { toValue: selected === 'later' ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [selected]);

  const handleSelect = (value: 'yes' | 'later') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(value);
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selected === 'yes') {
      // Request permission — never block on result
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        dispatch({ type: 'SET_NOTIFICATIONS', payload: status === 'granted' });
      } catch {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: false });
      }
    } else {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: false });
    }

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S25_KumaPledge');
    });
  };

  const yesBorder = yesBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: ['transparent', COLORS.amber],
  });
  const laterBorder = laterBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: ['transparent', COLORS.amber],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={24} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Mock notification */}
          <Animated.View
            style={[
              styles.notifCard,
              { opacity: notifOpacity, transform: [{ translateY: notifTranslateY }] },
            ]}
          >
            <View style={styles.notifHeader}>
              <View style={styles.notifIconWrap}>
                <Text style={styles.notifIcon}>🐻</Text>
              </View>
              <Text style={styles.notifAppName}>Kuma</Text>
              <Text style={styles.notifTime}>now</Text>
            </View>
            <Text style={styles.notifBody}>
              <Text style={styles.notifWarning}>⚠ </Text>
              <Text style={styles.notifBold}>{childName}'s body wash just changed its formula.</Text>
              {' '}2 new ingredients flagged for {conditionLabel}.
            </Text>
          </Animated.View>

          {/* Heading */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            We'll watch so you don't have to.
          </Animated.Text>

          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            Get alerts when products change ingredients, when your water quality
            shifts, or when new research affects {childName}'s conditions.
          </Animated.Text>

          {/* Option cards */}
          <Animated.View
            style={[styles.cardsWrap, { opacity: cardsOpacity, transform: [{ translateY: cardsTranslate }] }]}
          >
            {/* Yes */}
            <Pressable onPress={() => handleSelect('yes')}>
              <Animated.View style={[styles.optionCard, { borderColor: yesBorder }]}>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>Yes, keep me informed</Text>
                  <Text style={styles.optionSub}>Formula changes, water alerts, recall notices</Text>
                </View>
                {selected === 'yes' ? (
                  <View style={styles.radioActive}>
                    <Text style={styles.radioCheck}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </Animated.View>
            </Pressable>

            {/* Later */}
            <Pressable onPress={() => handleSelect('later')}>
              <Animated.View style={[styles.optionCard, { borderColor: laterBorder }]}>
                <Text style={[styles.optionTitle, selected !== 'later' && styles.optionTitleDim]}>
                  Maybe later
                </Text>
                {selected === 'later' ? (
                  <View style={styles.radioActive}>
                    <Text style={styles.radioCheck}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.radioInactive} />
                )}
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  content: {
    flex: 1, paddingHorizontal: 28, paddingTop: 24,
    alignItems: 'center',
  },

  // Mock notification
  notifCard: {
    width: '100%', backgroundColor: 'rgba(255,248,244,0.95)',
    borderRadius: 22, padding: 16, gap: 8, marginBottom: 32,
    // iOS notification shadow
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 8,
  },
  notifHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  notifIconWrap: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: 'rgba(212,137,14,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 14 },
  notifAppName: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 13,
    color: COLORS.textPrimary, flex: 1,
  },
  notifTime: {
    fontFamily: FONT_FAMILY.body, fontSize: 11,
    color: 'rgba(82,68,53,0.6)',
  },
  notifBody: {
    fontFamily: FONT_FAMILY.body, fontSize: 14, lineHeight: 21,
    color: COLORS.textPrimary,
  },
  notifWarning: { color: COLORS.coral },
  notifBold: { fontFamily: FONT_FAMILY.buttonLabel },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center', marginBottom: 12,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.55)', textAlign: 'center',
    paddingHorizontal: 8, marginBottom: 28,
  },

  // Options
  cardsWrap: { width: '100%', gap: 12 },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: RADIUS.card, borderWidth: 2,
    padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  optionTextWrap: { flex: 1, gap: 4 },
  optionTitle: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: FONT_SIZE.base,
    color: COLORS.cream,
  },
  optionTitleDim: { color: 'rgba(255,248,240,0.5)' },
  optionSub: {
    fontFamily: FONT_FAMILY.body, fontSize: 12,
    color: 'rgba(255,248,240,0.6)',
  },
  radioActive: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  radioCheck: { fontSize: 13, color: '#482B00', fontWeight: '700' },
  radioInactive: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },

  // CTA
  footer: { paddingHorizontal: 28, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
});
