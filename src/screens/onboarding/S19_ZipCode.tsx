import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S19_EnterZip'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Simple US zip validation (starts with valid prefix, 5 digits)
function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip) && parseInt(zip.charAt(0)) >= 0;
}

// Mock water quality bars
const WATER_BARS = [
  { label: 'Nitrates', level: 0.33, status: 'Safe', color: COLORS.safe },
  { label: 'Lead Trace', level: 0.65, status: 'Alert', color: COLORS.caution },
  { label: 'Chlorine', level: 0.85, status: 'Action', color: '#ba1a1a' },
];

export default function S19_ZipCode({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [zip, setZip] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isValid = isValidZip(zip);
  const hasTriggeredActive = useRef(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputTranslate = useRef(new Animated.Value(12)).current;
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const previewTranslate = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonActiveAnim = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    timers.push(setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300));

    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(inputOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(inputTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
      setTimeout(() => inputRef.current?.focus(), 200);
    }, 500));

    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 700));

    return () => timers.forEach(clearTimeout);
  }, []);

  // On zip change
  const handleZipChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 5);
    if (digits.length > zip.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setZip(digits);
  };

  // Validation + preview on 5 digits
  useEffect(() => {
    if (zip.length === 5) {
      if (isValidZip(zip)) {
        // Show preview
        Animated.parallel([
          Animated.timing(previewOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(previewTranslate, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
        ]).start();
      } else {
        // Shake input
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    } else {
      // Hide preview if editing
      previewOpacity.setValue(0);
      previewTranslate.setValue(30);
    }
  }, [zip]);

  // Button activation
  useEffect(() => {
    if (isValid && !hasTriggeredActive.current) {
      hasTriggeredActive.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(buttonActiveAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    } else if (!isValid && hasTriggeredActive.current) {
      hasTriggeredActive.current = false;
      Animated.timing(buttonActiveAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [isValid]);

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'SET_ZIP_CODE', payload: zip });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S20_WaterTrends');
    });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('S20_WaterTrends');
  };

  const buttonDimOpacity = buttonActiveAnim.interpolate({
    inputRange: [0, 1], outputRange: [0.4, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background glows */}
      <View style={styles.glowRight} />
      <View style={styles.glowLeft} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.progressRow}>
            <View style={styles.progressBarWrap}>
              <ProgressBar current={19} total={31} variant="dark" />
            </View>
          </View>

          <View style={styles.content}>
            {/* Heading */}
            <Animated.Text
              style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
            >
              Let's check {childName}'s tap water.
            </Animated.Text>
            <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
              Enter your zip code. We'll pull your local water quality report from the EPA.
            </Animated.Text>

            {/* Zip input */}
            <Animated.View
              style={[
                styles.inputWrap,
                {
                  opacity: inputOpacity,
                  transform: [{ translateY: inputTranslate }, { translateX: shakeAnim }],
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                style={styles.zipInput}
                value={zip}
                onChangeText={handleZipChange}
                keyboardType="number-pad"
                maxLength={5}
                placeholder="00000"
                placeholderTextColor="rgba(255,248,240,0.15)"
              />
              <View style={styles.lockRow}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockText}>
                  Your zip code is stored securely and never shared.
                </Text>
              </View>
            </Animated.View>

            {/* Preview card */}
            <Animated.View
              style={[
                styles.previewCard,
                { opacity: previewOpacity, transform: [{ translateY: previewTranslate }] },
              ]}
            >
              <View style={styles.previewHeader}>
                <View>
                  <Text style={styles.previewTitle}>Water Report for {zip}</Text>
                  <Text style={styles.previewSub}>Regional data preview available</Text>
                </View>
                <View style={styles.waterIcon}>
                  <Text style={{ fontSize: 20 }}>💧</Text>
                </View>
              </View>

              {WATER_BARS.map((bar) => (
                <View key={bar.label} style={styles.barGroup}>
                  <View style={styles.barHeader}>
                    <Text style={styles.barLabel}>{bar.label}</Text>
                    <Text style={[styles.barStatus, { color: bar.color }]}>{bar.status}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${bar.level * 100}%`, backgroundColor: bar.color }]} />
                  </View>
                </View>
              ))}

              <View style={styles.previewFooter}>
                <Text style={styles.previewFooterText}>Full report inside the app.</Text>
              </View>
            </Animated.View>
          </View>

          {/* Footer */}
          <Animated.View
            style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslateY }] }]}
          >
            <Animated.View style={{ opacity: buttonDimOpacity, transform: [{ scale: buttonScale }] }}>
              <Pressable
                onPress={handleContinue}
                disabled={!isValid}
                style={[styles.button, !isValid && styles.buttonDisabled]}
              >
                <Text style={styles.buttonText}>Check my water</Text>
              </Pressable>
            </Animated.View>

            <Pressable onPress={handleSkip} hitSlop={12}>
              <Text style={styles.skipText}>Skip for now</Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  kav: { flex: 1 },
  safeArea: { flex: 1 },
  glowRight: {
    position: 'absolute', top: '25%', right: -80,
    width: 256, height: 256, borderRadius: 128,
    backgroundColor: COLORS.amber, opacity: 0.04,
  },
  glowLeft: {
    position: 'absolute', bottom: '25%', left: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: '#4F5E81', opacity: 0.08,
  },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  content: {
    flex: 1, paddingHorizontal: 24, paddingTop: 24,
  },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center', marginBottom: 10,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.55)', textAlign: 'center',
    maxWidth: 280, alignSelf: 'center', marginBottom: 28,
  },

  // Zip input
  inputWrap: { alignItems: 'center', marginBottom: 24 },
  zipInput: {
    width: '100%', height: 64, backgroundColor: CARD_BG,
    borderRadius: 20, textAlign: 'center',
    fontFamily: FONT_FAMILY.heading, fontSize: 28,
    color: COLORS.cream, letterSpacing: 8,
  },
  lockRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 12, opacity: 0.3,
  },
  lockIcon: { fontSize: 10 },
  lockText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 10, color: COLORS.cream,
    letterSpacing: 0.2,
  },

  // Preview card
  previewCard: {
    backgroundColor: CARD_BG, borderRadius: RADIUS.card, padding: 20,
    gap: 14,
  },
  previewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 4,
  },
  previewTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: 14, color: COLORS.cream,
  },
  previewSub: {
    fontFamily: FONT_FAMILY.body, fontSize: 11, color: 'rgba(255,248,240,0.45)',
    marginTop: 2,
  },
  waterIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,248,240,0.1)',
  },

  barGroup: { gap: 4 },
  barHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  barLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9,
    color: 'rgba(255,248,240,0.4)', textTransform: 'uppercase', letterSpacing: 1.5,
  },
  barStatus: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1,
  },
  barTrack: {
    height: 4, backgroundColor: COLORS.navy, borderRadius: 2, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },

  previewFooter: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,248,240,0.05)',
    paddingTop: 12, alignItems: 'center',
  },
  previewFooterText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 12,
    color: 'rgba(255,248,240,0.45)', fontStyle: 'italic',
  },

  // Footer
  footer: {
    paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 14,
  },
  button: {
    width: SCREEN_WIDTH - 48, height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
  },
  buttonDisabled: { shadowOpacity: 0 },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: COLORS.cream,
  },
  skipText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,248,240,0.3)', textTransform: 'uppercase', letterSpacing: 1.5,
  },
});
