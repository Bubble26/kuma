import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { useOnboarding } from '../../context/OnboardingContext';
import ProgressBar from '../../components/shared/ProgressBar';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S14_Worries'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Worry options ──────────────────────────────────────────────────────
interface WorryOption {
  id: string;
  icon: string; // Material icon name → using emoji as placeholder
  label: string;
}

const WORRY_OPTIONS: WorryOption[] = [
  { id: 'hidden_ingredients', icon: '🔍', label: "Hidden ingredients I can't pronounce" },
  { id: 'untrusted_companies', icon: '🏭', label: "Products made by companies I don't trust" },
  { id: 'tap_water', icon: '💧', label: "What's in our tap water" },
  { id: 'screen_time', icon: '📺', label: 'Screen time and overstimulation' },
  { id: 'skincare', icon: '🧴', label: 'Skincare and personal care products' },
  { id: 'food_additives', icon: '🥗', label: 'Food additives and preservatives' },
  { id: 'long_term', icon: '🏥', label: 'Long-term health effects' },
  { id: 'dont_know', icon: '❓', label: "I don't know what to worry about — that's why I'm here" },
];

// ─── Animated worry card ────────────────────────────────────────────────
function WorryCard({
  option,
  isSelected,
  onToggle,
  index,
}: {
  option: WorryOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index: number;
}) {
  const borderAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslate = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const delay = 400 + index * 50;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(entranceOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(entranceTranslate, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: isSelected ? 1 : 0, duration: 150, useNativeDriver: false }),
      Animated.timing(checkOpacity, { toValue: isSelected ? 1 : 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [isSelected]);

  const handlePress = () => {
    if (!isSelected) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.98, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle(option.id);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', COLORS.amber],
  });
  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.2],
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
          <View style={styles.cardLeft}>
            <Text style={styles.cardIcon}>{option.icon}</Text>
            <Text style={styles.cardLabel}>{option.label}</Text>
          </View>
          <Animated.Text style={[styles.checkmark, { opacity: checkOpacity }]}>
            ✓
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────
export default function S14_Worries({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [selected, setSelected] = useState<string[]>([]);

  const isValid = selected.length >= 1;
  const hasTriggeredActive = useRef(false);

  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const buttonActiveAnim = useRef(new Animated.Value(0)).current;
  const buttonOpacityBase = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
    }, 600);
  }, []);

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

  const handleToggle = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'SET_WORRIES', payload: selected });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S15_UsedOtherApps');
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
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={14} total={31} variant="dark" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            What worries you most about {childName}'s products?
          </Animated.Text>
          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            Select all that apply to customize your guardian alerts.
          </Animated.Text>

          <View style={styles.cardsContainer}>
            {WORRY_OPTIONS.map((option, i) => (
              <WorryCard
                key={option.id}
                option={option}
                isSelected={selected.includes(option.id)}
                onToggle={handleToggle}
                index={i}
              />
            ))}
          </View>
        </ScrollView>

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
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </Animated.View>
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

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm,
    color: 'rgba(183,198,238,0.6)', marginBottom: 24,
  },

  cardsContainer: { gap: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#162340', borderRadius: 14, padding: 16,
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 15, elevation: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, paddingRight: 8 },
  cardIcon: { fontSize: 20 },
  cardLabel: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 14,
    color: COLORS.cream, flex: 1,
  },
  checkmark: {
    fontFamily: FONT_FAMILY.heading, fontSize: 18, color: COLORS.amber,
  },

  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 52, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  buttonDisabled: { shadowOpacity: 0 },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base, color: '#482B00',
  },
});
