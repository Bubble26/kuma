import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
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
import { getSymptomsForConditions } from '../../data/symptoms';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S11_SymptomGrid'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Animated chip ──────────────────────────────────────────────────────
function SymptomChip({
  label,
  isSelected,
  onToggle,
  index,
}: {
  label: string;
  isSelected: boolean;
  onToggle: (label: string) => void;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.8)).current;

  // Entrance stagger
  useEffect(() => {
    const delay = 300 + index * 40;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(entranceOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(entranceScale, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    if (!isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle(label);
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#162340', COLORS.amber],
  });

  const textColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.cream, '#482B00'],
  });

  return (
    <Animated.View style={{ opacity: entranceOpacity, transform: [{ scale: Animated.multiply(entranceScale, scaleAnim) }] }}>
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.chip,
            { backgroundColor },
            !isSelected && styles.chipUnselected,
          ]}
        >
          <Animated.Text style={[styles.chipText, { color: textColor }]}>
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────
export default function S11_SymptomGrid({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([]);

  // Build symptom list from conditions
  const baseSymptoms = useMemo(
    () => getSymptomsForConditions(state.conditions),
    [state.conditions]
  );
  const allSymptoms = useMemo(
    () => [...baseSymptoms, ...customSymptoms],
    [baseSymptoms, customSymptoms]
  );

  // Animations
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300);

    setTimeout(() => {
      Animated.timing(inputOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    setTimeout(() => {
      Animated.timing(tipOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1000);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 1200);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleToggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !allSymptoms.includes(trimmed)) {
      setCustomSymptoms((prev) => [...prev, trimmed]);
      setSelected((prev) => [...prev, trimmed]);
      setCustomInput('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'SET_SYMPTOMS', payload: selected });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S12_Allergies');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarWrap}>
              <ProgressBar current={11} total={31} variant="dark" />
            </View>
          </View>

          {/* Header */}
          <View style={styles.headerWrap}>
            <Animated.Text
              style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
            >
              What symptoms does {childName} experience?
            </Animated.Text>
            <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
              This helps Kuma connect products to reactions.
            </Animated.Text>
          </View>

          {/* Chips scroll area */}
          <ScrollView
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.chipsWrap}>
              {allSymptoms.map((symptom, i) => (
                <SymptomChip
                  key={symptom}
                  label={symptom}
                  isSelected={selected.includes(symptom)}
                  onToggle={handleToggle}
                  index={i}
                />
              ))}
            </View>
          </ScrollView>

          {/* Bottom section */}
          <View style={styles.bottomSection}>
            {/* Custom input */}
            <Animated.View style={[styles.customInputWrap, { opacity: inputOpacity }]}>
              <TextInput
                style={styles.customInput}
                placeholder="Other symptom..."
                placeholderTextColor="rgba(255,248,240,0.3)"
                value={customInput}
                onChangeText={setCustomInput}
                onSubmitEditing={handleAddCustom}
                returnKeyType="done"
              />
              <Pressable onPress={handleAddCustom} style={styles.addButton} hitSlop={8}>
                <Text style={styles.addIcon}>＋</Text>
              </Pressable>
            </Animated.View>

            {/* Guardian tip */}
            <Animated.View style={[styles.tipCard, { opacity: tipOpacity }]}>
              <Text style={styles.tipLabel}>Guardian Tip</Text>
              <Text style={styles.tipText}>
                "Don't worry if you miss something now, you can always add more
                symptoms later."
              </Text>
            </Animated.View>

            {/* CTA */}
            <Animated.View
              style={{ opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }}
            >
              <Pressable onPress={handleContinue} style={styles.button}>
                <Text style={styles.buttonText}>Continue</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>
            </Animated.View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  kav: { flex: 1 },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  headerWrap: { paddingHorizontal: 24, paddingTop: 24, marginBottom: 16 },
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 20, lineHeight: 28,
    color: COLORS.cream, marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.55)',
  },

  // Chips
  chipsScroll: { flex: 1 },
  chipsContent: { paddingHorizontal: 24, paddingBottom: 16 },
  chipsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  chip: {
    paddingHorizontal: 16, height: 38, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
  },
  chipUnselected: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  chipText: {
    fontFamily: FONT_FAMILY.bodySemiBold, fontSize: 13,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: 24, paddingBottom: 16, gap: 16,
  },

  // Custom input
  customInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#162340', borderRadius: RADIUS.full,
    height: 52, paddingHorizontal: 20,
  },
  customInput: {
    flex: 1, fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.base,
    color: COLORS.cream, height: '100%',
  },
  addButton: { marginLeft: 8 },
  addIcon: {
    fontSize: 22, color: 'rgba(212,137,14,0.4)',
  },

  // Tip
  tipCard: {
    backgroundColor: 'rgba(255,228,197,0.1)', borderRadius: RADIUS.card,
    padding: 16,
  },
  tipLabel: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 10,
    color: 'rgba(255,248,240,0.6)', textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 4,
  },
  tipText: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.8)', fontStyle: 'italic',
  },

  // Button
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
  buttonArrow: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
});
