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
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S09_WhoAreYouProtecting'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── DOB helpers ────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 18 }, (_, i) => String(currentYear - i));

export default function S09_AddChild({ navigation }: Props) {
  const { dispatch } = useOnboarding();

  // ─── Form state ─────────────────────────────────────────────────────
  const [childName, setChildName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const nameInputRef = useRef<TextInput>(null);

  const isValid = childName.trim().length >= 2;
  const hasTriggeredActive = useRef(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingScale = useRef(new Animated.Value(0.95)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const subTranslate = useRef(new Animated.Value(6)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(12)).current;

  // Photo circle dashed border rotation
  const dashRotation = useRef(new Animated.Value(0)).current;

  // Bear
  const bearOpacity = useRef(new Animated.Value(0)).current;
  const bearBob = useRef(new Animated.Value(0)).current;

  // Button
  const buttonActiveAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Note
  const noteOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading fades in + scale
    Animated.parallel([
      Animated.timing(headingOpacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.spring(headingScale, {
        toValue: 1, friction: 8, tension: 60, useNativeDriver: true,
      }),
    ]).start();

    // 2. Subheading 300ms later
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(subTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 300));

    // 3. Form fields 600ms
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();

      // Auto-focus name input
      setTimeout(() => nameInputRef.current?.focus(), 200);
    }, 600));

    // 4. Note
    timers.push(setTimeout(() => {
      Animated.timing(noteOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1000));

    // 5. Bear fades in
    timers.push(setTimeout(() => {
      Animated.timing(bearOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(bearBob, { toValue: -4, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bearBob, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 800));

    // 6. Dashed border rotation loop
    Animated.loop(
      Animated.timing(dashRotation, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Button activation on name change ───────────────────────────────
  useEffect(() => {
    if (isValid && !hasTriggeredActive.current) {
      hasTriggeredActive.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(buttonActiveAnim, {
        toValue: 1, duration: 200, useNativeDriver: false,
      }).start();
    } else if (!isValid && hasTriggeredActive.current) {
      hasTriggeredActive.current = false;
      Animated.timing(buttonActiveAnim, {
        toValue: 0, duration: 200, useNativeDriver: false,
      }).start();
    }
  }, [isValid]);

  // ─── Continue handler ───────────────────────────────────────────────
  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Build DOB string if any fields set
    let dob = '';
    if (month && day && year) {
      const monthIndex = MONTHS.indexOf(month) + 1;
      dob = `${year}-${String(monthIndex).padStart(2, '0')}-${day}`;
    }

    dispatch({
      type: 'SET_CHILD_INFO',
      payload: { childName: childName.trim(), childDOB: dob || undefined },
    });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S10_SelectConditions');
    });
  };

  // ─── Interpolations ─────────────────────────────────────────────────
  const rotate = dashRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const buttonOpacity = buttonActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Progress — no skip from Screen 9 onwards */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarWrap}>
              <ProgressBar current={9} total={31} variant="dark" />
            </View>
          </View>

          <View style={styles.content}>
            {/* ── Heading ──────────────────────────────────────────── */}
            <Animated.Text
              style={[
                styles.heading,
                {
                  opacity: headingOpacity,
                  transform: [{ scale: headingScale }],
                },
              ]}
            >
              Who are you protecting?
            </Animated.Text>

            <Animated.Text
              style={[
                styles.subheading,
                {
                  opacity: subOpacity,
                  transform: [{ translateY: subTranslate }],
                },
              ]}
            >
              We'll personalize everything for your child.
            </Animated.Text>

            {/* ── Photo upload circle ──────────────────────────────── */}
            <Animated.View style={[styles.photoWrap, { opacity: formOpacity }]}>
              <Pressable style={styles.photoTouchable}>
                <Animated.View
                  style={[
                    styles.photoDashedBorder,
                    { transform: [{ rotate }] },
                  ]}
                />
                <View style={styles.photoInner}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </View>
              </Pressable>
              <Text style={styles.photoLabel}>Add photo</Text>
            </Animated.View>

            {/* ── Form ─────────────────────────────────────────────── */}
            <Animated.View
              style={[
                styles.formWrap,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslate }],
                },
              ]}
            >
              {/* Name input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Child's name</Text>
                <TextInput
                  ref={nameInputRef}
                  style={styles.textInput}
                  placeholder="Emma"
                  placeholderTextColor="rgba(255,248,240,0.2)"
                  value={childName}
                  onChangeText={setChildName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              {/* DOB pickers */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Date of birth</Text>
                <View style={styles.dobRow}>
                  <Pressable
                    style={styles.dobSelect}
                    onPress={() => {
                      // In production: open a picker. For now, cycle through months
                      const idx = MONTHS.indexOf(month);
                      setMonth(MONTHS[(idx + 1) % MONTHS.length]);
                    }}
                  >
                    <Text style={[styles.dobText, !month && styles.dobPlaceholder]}>
                      {month || 'Month'}
                    </Text>
                    <Text style={styles.chevron}>▾</Text>
                  </Pressable>

                  <Pressable
                    style={styles.dobSelect}
                    onPress={() => {
                      const idx = DAYS.indexOf(day);
                      setDay(DAYS[(idx + 1) % DAYS.length]);
                    }}
                  >
                    <Text style={[styles.dobText, !day && styles.dobPlaceholder]}>
                      {day || 'Day'}
                    </Text>
                    <Text style={styles.chevron}>▾</Text>
                  </Pressable>

                  <Pressable
                    style={styles.dobSelect}
                    onPress={() => {
                      const idx = YEARS.indexOf(year);
                      setYear(YEARS[(idx + 1) % YEARS.length]);
                    }}
                  >
                    <Text style={[styles.dobText, !year && styles.dobPlaceholder]}>
                      {year || 'Year'}
                    </Text>
                    <Text style={styles.chevron}>▾</Text>
                  </Pressable>
                </View>
              </View>

              {/* Note */}
              <Animated.Text style={[styles.noteText, { opacity: noteOpacity }]}>
                You can add siblings later.
              </Animated.Text>
            </Animated.View>
          </View>

          {/* ── Bear mascot (bottom-right) ──────────────────────────── */}
          <Animated.View
            style={[
              styles.bearWrap,
              {
                opacity: bearOpacity,
                transform: [{ translateY: bearBob }],
              },
            ]}
          >
            <BearMascot expression="protective" size={90} showBaby={true} />
          </Animated.View>

          {/* ── CTA ────────────────────────────────────────────────── */}
          <Animated.View
            style={[
              styles.footer,
              { opacity: buttonOpacity, transform: [{ scale: buttonScale }] },
            ]}
          >
            <Pressable
              onPress={handleContinue}
              disabled={!isValid}
              style={[styles.button, !isValid && styles.buttonDisabled]}
            >
              <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
                Continue
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const INPUT_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  kav: { flex: 1 },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  content: {
    flex: 1, paddingHorizontal: 32, paddingTop: 24,
  },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 24, lineHeight: 32,
    color: COLORS.cream, textAlign: 'center', letterSpacing: -0.3,
    marginBottom: 10,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: 14, lineHeight: 22,
    color: 'rgba(255,248,240,0.55)', textAlign: 'center',
    maxWidth: 240, alignSelf: 'center', marginBottom: 28,
  },

  // Photo upload
  photoWrap: { alignItems: 'center', marginBottom: 28, gap: 8 },
  photoTouchable: {
    width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  photoDashedBorder: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderStyle: 'dashed',
    borderColor: 'rgba(255,248,240,0.3)',
  },
  photoInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  cameraIcon: { fontSize: 22, opacity: 0.4 },
  photoLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: 'rgba(255,248,240,0.3)', textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Form
  formWrap: { gap: 24 },
  fieldGroup: { gap: 8 },
  label: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 11,
    color: 'rgba(255,248,240,0.6)', textTransform: 'uppercase',
    letterSpacing: 1.2, marginLeft: 4,
  },
  textInput: {
    height: 48, backgroundColor: INPUT_BG, borderRadius: 12,
    paddingHorizontal: 20, fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.base, color: COLORS.cream,
  },

  // DOB
  dobRow: { flexDirection: 'row', gap: 10 },
  dobSelect: {
    flex: 1, height: 48, backgroundColor: INPUT_BG, borderRadius: 12,
    paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  dobText: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,248,240,0.7)',
  },
  dobPlaceholder: { color: 'rgba(255,248,240,0.25)' },
  chevron: { fontSize: 12, color: 'rgba(255,248,240,0.2)' },

  // Note
  noteText: {
    fontFamily: FONT_FAMILY.body, fontSize: 11,
    color: 'rgba(255,248,240,0.35)', textAlign: 'center',
    marginTop: 4,
  },

  // Bear
  bearWrap: {
    position: 'absolute', bottom: 90, right: -4,
  },

  // Footer
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 52, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
  },
  buttonDisabled: {
    shadowOpacity: 0,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base,
    color: '#482B00',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});
