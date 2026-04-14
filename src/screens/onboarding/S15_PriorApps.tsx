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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S15_UsedOtherApps'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function S15_PriorApps({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [selected, setSelected] = useState<boolean | null>(null);

  const isValid = selected !== null;
  const hasTriggeredActive = useRef(false);

  // Animations
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const yesAnim = useRef(new Animated.Value(0)).current;
  const noAnim = useRef(new Animated.Value(0)).current;
  const yesBorderAnim = useRef(new Animated.Value(0)).current;
  const noBorderAnim = useRef(new Animated.Value(0)).current;
  const subtextOpacity = useRef(new Animated.Value(0)).current;
  const comparisonOpacity = useRef(new Animated.Value(0)).current;
  const comparisonTranslate = useRef(new Animated.Value(16)).current;
  const buttonActiveAnim = useRef(new Animated.Value(0)).current;
  const buttonOpacityBase = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // Buttons stagger in
    timers.push(setTimeout(() => {
      Animated.timing(yesAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, 300));
    timers.push(setTimeout(() => {
      Animated.timing(noAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, 420));

    // Subtext fades in 500ms after mount (delayed for emphasis)
    timers.push(setTimeout(() => {
      Animated.timing(subtextOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, 500));

    // Comparison graphic
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(comparisonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(comparisonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 800));

    // Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacityBase, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 600));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Button activation
  useEffect(() => {
    if (isValid && !hasTriggeredActive.current) {
      hasTriggeredActive.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(buttonActiveAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    }
  }, [isValid]);

  // Selection border animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(yesBorderAnim, { toValue: selected === true ? 1 : 0, duration: 200, useNativeDriver: false }),
      Animated.timing(noBorderAnim, { toValue: selected === false ? 1 : 0, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [selected]);

  const handleSelect = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(value);
  };

  const handleContinue = () => {
    if (!isValid || selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'SET_USED_OTHER_APPS', payload: selected });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S16_ScanDemo_Bad');
    });
  };

  // Interpolations
  const yesBorder = yesBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: ['transparent', COLORS.amber],
  });
  const yesShadow = yesBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 0.3],
  });
  const noBorder = noBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: ['transparent', COLORS.amber],
  });
  const noShadow = noBorderAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 0.3],
  });
  const buttonDimOpacity = buttonActiveAnim.interpolate({
    inputRange: [0, 1], outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={15} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Heading */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            Have you used other apps to check what's safe for {childName}?
          </Animated.Text>

          {/* Two selection buttons */}
          <View style={styles.buttonsGroup}>
            <Animated.View style={{ opacity: yesAnim }}>
              <Pressable onPress={() => handleSelect(true)}>
                <Animated.View
                  style={[
                    styles.optionCard,
                    {
                      borderColor: yesBorder,
                      shadowColor: COLORS.amber,
                      shadowOpacity: yesShadow,
                    },
                    selected === true && styles.optionCardSelected,
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    selected === true && styles.optionTextSelected,
                  ]}>
                    Yes, I've tried a few
                  </Text>
                  {selected === true && <Text style={styles.optionCheck}>✓</Text>}
                </Animated.View>
              </Pressable>
            </Animated.View>

            <Animated.View style={{ opacity: noAnim }}>
              <Pressable onPress={() => handleSelect(false)}>
                <Animated.View
                  style={[
                    styles.optionCard,
                    {
                      borderColor: noBorder,
                      shadowColor: COLORS.amber,
                      shadowOpacity: noShadow,
                    },
                    selected === false && styles.optionCardSelected,
                  ]}
                >
                  <Text style={[
                    styles.optionText,
                    selected === false && styles.optionTextSelected,
                  ]}>
                    No, this is new to me
                  </Text>
                  {selected === false && <Text style={styles.optionCheck}>✓</Text>}
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>

          {/* Subtext — delayed 500ms */}
          <Animated.Text style={[styles.subtext, { opacity: subtextOpacity }]}>
            Most product scanner apps give the same answer to every user.
          </Animated.Text>

          {/* Phone comparison */}
          <Animated.View
            style={[
              styles.comparisonRow,
              { opacity: comparisonOpacity, transform: [{ translateY: comparisonTranslate }] },
            ]}
          >
            {/* Other apps — dim */}
            <View style={styles.phoneCol}>
              <View style={[styles.phoneMockup, styles.phoneDim]}>
                <View style={styles.phonePlaceholder} />
                <Text style={styles.phoneScore}>Good ✓</Text>
                <View style={styles.phoneBar} />
              </View>
              <Text style={styles.phoneLabel}>Other apps</Text>
            </View>

            {/* ≠ */}
            <Text style={styles.neqSymbol}>≠</Text>

            {/* Kuma — glowing */}
            <View style={styles.phoneCol}>
              <View style={[styles.phoneMockup, styles.phoneKuma]}>
                <View style={styles.kumaImagePlaceholder} />
                <Text style={styles.kumaScore}>
                  {childName}: 3 triggers
                </Text>
                <View style={styles.kumaBar} />
              </View>
              <Text style={styles.kumaLabel}>Kuma</Text>
            </View>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacityBase, transform: [{ translateY: buttonTranslate }] }]}
        >
          <Animated.View style={{ opacity: buttonDimOpacity, transform: [{ scale: buttonScale }] }}>
            <Pressable
              onPress={handleContinue}
              disabled={!isValid}
              style={[styles.button, !isValid && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Show me what Kuma does.</Text>
            </Pressable>
          </Animated.View>
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

  content: {
    flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center',
  },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center', letterSpacing: -0.3,
    marginBottom: 28, maxWidth: 320,
  },

  // Selection buttons
  buttonsGroup: { width: '100%', gap: 10, marginBottom: 20 },
  optionCard: {
    width: '100%', paddingVertical: 20, paddingHorizontal: 20,
    backgroundColor: CARD_BG, borderRadius: RADIUS.card,
    borderWidth: 2, borderColor: 'transparent',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 20, elevation: 4,
  },
  optionCardSelected: {
    backgroundColor: COLORS.amber,
  },
  optionText: {
    fontFamily: FONT_FAMILY.heading, fontSize: 15, color: COLORS.cream,
  },
  optionTextSelected: {
    color: '#482B00',
  },
  optionCheck: {
    fontFamily: FONT_FAMILY.heading, fontSize: 18, color: '#482B00',
  },

  // Subtext
  subtext: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.5)', textAlign: 'center',
    maxWidth: 280, marginBottom: 32,
  },

  // Comparison
  comparisonRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', width: '100%',
  },
  phoneCol: { alignItems: 'center', gap: 10 },
  phoneMockup: {
    borderRadius: 16, padding: 8, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  phoneDim: {
    width: 96, height: 140, backgroundColor: CARD_BG,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', opacity: 0.6,
  },
  phonePlaceholder: {
    width: '100%', height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8,
  },
  phoneScore: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10, color: COLORS.safe,
  },
  phoneBar: {
    width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2,
  },
  phoneLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 11,
    color: 'rgba(255,248,240,0.4)', textTransform: 'uppercase', letterSpacing: 2,
  },

  phoneKuma: {
    width: 112, height: 164, backgroundColor: '#FFF1E5',
    borderWidth: 2, borderColor: 'rgba(212,137,14,0.3)',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 6,
  },
  kumaImagePlaceholder: {
    width: '100%', height: 72, backgroundColor: 'rgba(212,137,14,0.1)', borderRadius: 10,
  },
  kumaScore: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 9,
    color: '#E57373', textAlign: 'center', lineHeight: 13,
  },
  kumaBar: {
    width: 48, height: 4, backgroundColor: 'rgba(212,137,14,0.2)', borderRadius: 2,
  },
  kumaLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 11,
    color: COLORS.amber, textTransform: 'uppercase', letterSpacing: 2,
  },

  neqSymbol: {
    fontFamily: FONT_FAMILY.heading, fontSize: 28, color: COLORS.amber,
  },

  // Footer
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 52, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 6,
  },
  buttonDisabled: { shadowOpacity: 0 },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base, color: '#482B00',
  },
});
