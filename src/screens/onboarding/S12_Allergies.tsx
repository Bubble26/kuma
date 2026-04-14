import React, { useEffect, useRef, useState, useCallback } from 'react';
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
import { TOP_ALLERGENS, OTHER_ALLERGENS } from '../../data/allergens';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S12_Allergies'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CORAL = '#E57373';

// ─── Allergen chip ──────────────────────────────────────────────────────
function AllergenChip({
  label,
  isSelected,
  onToggle,
  index,
  variant,
}: {
  label: string;
  isSelected: boolean;
  onToggle: (label: string) => void;
  index: number;
  variant: 'top' | 'other';
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = 400 + index * 35;
    const timer = setTimeout(() => {
      Animated.timing(entranceOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.timing(bgAnim, {
      toValue: isSelected ? 1 : 0, duration: 150, useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const handlePress = () => {
    if (!isSelected) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle(label);
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [variant === 'top' ? '#162340' : 'rgba(22,35,64,0.6)', CORAL],
  });

  return (
    <Animated.View style={{ opacity: entranceOpacity, transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.chip, variant === 'top' ? styles.chipTop : styles.chipOther, { backgroundColor }]}>
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {label}
          </Text>
          {isSelected && <Text style={styles.chipCheck}>✓</Text>}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────
export default function S12_Allergies({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const childName = state.childName || 'your child';
  const [selected, setSelected] = useState<string[]>([]);
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  // Animations
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const disclaimerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
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
      Animated.timing(disclaimerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 600);
  }, []);

  const handleToggle = useCallback((label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }, []);

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (trimmed && !TOP_ALLERGENS.includes(trimmed) && !OTHER_ALLERGENS.includes(trimmed) && !customAllergens.includes(trimmed)) {
      setCustomAllergens((prev) => [...prev, trimmed]);
      setSelected((prev) => [...prev, trimmed]);
      setCustomText('');
      setShowCustomInput(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navigateNext = (allergies: string[]) => {
    dispatch({ type: 'SET_ALLERGIES', payload: allergies });
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S13_ScentedReaction');
    });
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigateNext(selected);
  };

  const handleNoAllergies = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected([]);
    navigateNext([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background glows */}
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Progress */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarWrap}>
              <ProgressBar current={12} total={31} variant="dark" />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <Animated.Text
              style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
            >
              Does {childName} have any allergies?
            </Animated.Text>
            <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
              Select all that apply to help Kuma personalize {childName}'s
              nutritional guidance.
            </Animated.Text>

            {/* Top 9 */}
            <Text style={styles.sectionLabel}>Top 9 Allergens</Text>
            <View style={styles.chipsWrap}>
              {TOP_ALLERGENS.map((a, i) => (
                <AllergenChip
                  key={a} label={a} variant="top"
                  isSelected={selected.includes(a)}
                  onToggle={handleToggle} index={i}
                />
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Other + custom */}
            <Text style={styles.sectionLabel}>Other Common Allergies</Text>
            <View style={styles.chipsWrap}>
              {[...OTHER_ALLERGENS, ...customAllergens].map((a, i) => (
                <AllergenChip
                  key={a} label={a} variant="other"
                  isSelected={selected.includes(a)}
                  onToggle={handleToggle} index={TOP_ALLERGENS.length + i}
                />
              ))}
            </View>

            {/* Add custom */}
            {showCustomInput ? (
              <View style={styles.customInputWrap}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Type allergen name..."
                  placeholderTextColor="rgba(255,248,240,0.3)"
                  value={customText}
                  onChangeText={setCustomText}
                  onSubmitEditing={handleAddCustom}
                  autoFocus
                  returnKeyType="done"
                />
              </View>
            ) : (
              <Pressable
                onPress={() => setShowCustomInput(true)}
                style={styles.addCustomButton}
              >
                <Text style={styles.addCustomPlus}>＋</Text>
                <Text style={styles.addCustomText}>Add custom allergen</Text>
              </Pressable>
            )}

            {/* Disclaimer */}
            <Animated.View style={[styles.disclaimer, { opacity: disclaimerOpacity }]}>
              <Text style={styles.disclaimerText}>
                Kuma is not a medical device. Always consult your pediatrician for
                allergy management.
              </Text>
            </Animated.View>
          </ScrollView>

          {/* Footer */}
          <Animated.View
            style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }] }]}
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable onPress={handleContinue} style={styles.button}>
                <Text style={styles.buttonText}>Continue</Text>
              </Pressable>
            </Animated.View>

            <Pressable onPress={handleNoAllergies} hitSlop={12}>
              <Text style={styles.noAllergiesText}>No known allergies</Text>
            </Pressable>
          </Animated.View>
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
  glowLeft: {
    position: 'absolute', top: 80, left: -80,
    width: 256, height: 256, borderRadius: 128,
    backgroundColor: COLORS.amber, opacity: 0.06,
  },
  glowRight: {
    position: 'absolute', bottom: 160, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: CORAL, opacity: 0.04,
  },
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
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.sm, lineHeight: 20,
    color: 'rgba(255,248,240,0.6)', marginBottom: 24,
  },

  sectionLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 11,
    color: 'rgba(255,185,94,0.8)', textTransform: 'uppercase',
    letterSpacing: 2, marginBottom: 12,
  },

  chipsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: RADIUS.full,
  },
  chipTop: { height: 42, paddingHorizontal: 20 },
  chipOther: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
  chipText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 13,
    color: 'rgba(255,248,240,0.9)',
  },
  chipTextSelected: { color: COLORS.white },
  chipCheck: { fontSize: 14, color: COLORS.white },

  divider: {
    height: 1, backgroundColor: 'rgba(255,248,240,0.1)', marginBottom: 20,
  },

  // Add custom
  addCustomButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24,
  },
  addCustomPlus: { fontSize: 18, color: COLORS.amber },
  addCustomText: {
    fontFamily: FONT_FAMILY.heading, fontSize: 13, color: COLORS.amber,
  },
  customInputWrap: {
    backgroundColor: '#162340', borderRadius: RADIUS.full,
    height: 48, paddingHorizontal: 20, justifyContent: 'center',
    marginBottom: 24,
  },
  customInput: {
    fontFamily: FONT_FAMILY.body, fontSize: FONT_SIZE.base,
    color: COLORS.cream, height: '100%',
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: '#162340', borderRadius: RADIUS.sm,
    padding: 16, borderLeftWidth: 4, borderLeftColor: CORAL,
    marginBottom: 8,
  },
  disclaimerText: {
    fontFamily: FONT_FAMILY.body, fontSize: 11, lineHeight: 18,
    color: 'rgba(255,248,240,0.45)',
  },

  // Footer
  footer: {
    paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 12,
  },
  button: {
    width: SCREEN_WIDTH - 48, height: 56,
    backgroundColor: COLORS.amber, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
  noAllergiesText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,248,240,0.4)',
  },
});
