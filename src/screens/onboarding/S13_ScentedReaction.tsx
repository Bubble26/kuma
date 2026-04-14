import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  ScrollView,
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
import { useOnboarding, OnboardingState } from '../../context/OnboardingContext';
import ProgressBar from '../../components/shared/ProgressBar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S13_ScentedReaction'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Options ────────────────────────────────────────────────────────────
type SensitivityValue = OnboardingState['fragranceSensitivity'];

interface ReactionOption {
  value: SensitivityValue;
  emoji: string;
  title: string;
  subtitle: string;
}

const OPTIONS: ReactionOption[] = [
  {
    value: 'none',
    emoji: '😊',
    title: 'No issues at all',
    subtitle: "Kuma won't flag fragrance",
  },
  {
    value: 'mild',
    emoji: '🤔',
    title: 'Sometimes sensitive',
    subtitle: 'Kuma will note fragrance as caution',
  },
  {
    value: 'high',
    emoji: '😣',
    title: 'Often reacts',
    subtitle: 'Kuma will flag fragrance as a warning',
  },
  {
    value: 'unknown',
    emoji: '❓',
    title: "I'm not sure yet",
    subtitle: 'Kuma will flag fragrance so you can track it',
  },
];

// ─── Animated option card ───────────────────────────────────────────────
function OptionCard({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: ReactionOption;
  isSelected: boolean;
  onSelect: (value: SensitivityValue) => void;
  index: number;
}) {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslate = useRef(new Animated.Value(16)).current;

  // Entrance stagger
  useEffect(() => {
    const delay = 500 + index * 100;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(entranceOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(entranceTranslate, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  // Selection animation
  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isSelected ? 1 : 0, duration: 150, useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onSelect(option.value);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', COLORS.amber],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={{
        opacity: entranceOpacity,
        transform: [{ translateY: entranceTranslate }, { scale: scaleAnim }],
      }}
    >
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.card,
            {
              borderColor,
              borderWidth: 2,
              shadowColor: COLORS.amber,
              shadowOpacity,
            },
          ]}
        >
          {/* Bear face placeholder */}
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </View>

          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────
export default function S13_ScentedReaction({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [selected, setSelected] = useState<SensitivityValue | null>(null);

  const isValid = selected !== null;
  const hasTriggeredActive = useRef(false);

  // Animations
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const buttonActiveAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacityBase = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacityBase, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 800);
  }, []);

  // Button activation
  useEffect(() => {
    if (isValid && !hasTriggeredActive.current) {
      hasTriggeredActive.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(buttonActiveAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    }
  }, [isValid]);

  const handleSelect = (value: SensitivityValue) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (!isValid || selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'SET_FRAGRANCE_SENSITIVITY', payload: selected });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S14_Worries');
    });
  };

  const buttonDimOpacity = buttonActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={13} total={31} variant="dark" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            How does {childName} react to scented products?
          </Animated.Text>
          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            Lotions, soaps, detergents, candles...
          </Animated.Text>

          {/* Option cards */}
          <View style={styles.cardsContainer}>
            {OPTIONS.map((option, i) => (
              <OptionCard
                key={option.value}
                option={option}
                isSelected={selected === option.value}
                onSelect={handleSelect}
                index={i}
              />
            ))}
          </View>
        </ScrollView>

        {/* CTA */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: buttonOpacityBase, transform: [{ translateY: buttonTranslate }] },
          ]}
        >
          <Animated.View style={{ opacity: buttonDimOpacity, transform: [{ scale: buttonScale }] }}>
            <Pressable
              onPress={handleContinue}
              disabled={!isValid}
              style={[styles.button, !isValid && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const CARD_BG = '#162340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 24, lineHeight: 32,
    color: COLORS.cream, marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,248,240,0.5)', marginBottom: 28,
  },

  cardsContainer: { gap: 10 },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: CARD_BG, borderRadius: RADIUS.card, padding: 20,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 15, elevation: 4,
  },
  emojiWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    fontFamily: FONT_FAMILY.heading, fontSize: 15,
    color: COLORS.cream, marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILY.body, fontSize: 12,
    color: 'rgba(255,248,240,0.4)',
  },

  // Footer
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  buttonDisabled: { shadowOpacity: 0 },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
});
