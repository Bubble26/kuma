import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  FlatList,
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
import { CONDITIONS, Condition } from '../../data/conditions';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S10_SelectConditions'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 24;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

// ─── Animated card wrapper ──────────────────────────────────────────────
function ConditionCard({
  item,
  isSelected,
  onToggle,
  index,
}: {
  item: Condition;
  isSelected: boolean;
  onToggle: (id: string) => void;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslate = useRef(new Animated.Value(20)).current;

  // Entrance animation (staggered)
  useEffect(() => {
    const delay = 400 + index * 60;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(entranceOpacity, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }),
        Animated.spring(entranceTranslate, {
          toValue: 0, friction: 8, tension: 70, useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  // Selection animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(checkOpacity, {
        toValue: isSelected ? 1 : 0, duration: 150, useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: isSelected ? 1 : 0, duration: 150, useNativeDriver: false,
      }),
    ]).start();
  }, [isSelected]);

  const handlePress = () => {
    if (!isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Scale bounce
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.03, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    onToggle(item.id);
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', COLORS.amber],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={{
        opacity: entranceOpacity,
        transform: [
          { translateY: entranceTranslate },
          { scale: scaleAnim },
        ],
      }}
    >
      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.card,
            {
              borderColor,
              shadowColor: COLORS.amber,
              shadowOpacity,
            },
          ]}
        >
          {/* Checkmark */}
          <Animated.Text style={[styles.checkmark, { opacity: checkOpacity }]}>
            ✓
          </Animated.Text>

          {/* Emoji */}
          <Text style={styles.cardEmoji}>{item.emoji}</Text>

          {/* Label */}
          <Text style={styles.cardLabel}>{item.label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────────
export default function S10_SelectConditions({ navigation }: Props) {
  const { state, dispatch } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);
  const childName = state.childName || 'your child';

  const isValid = selected.length >= 1;
  const hasTriggeredActive = useRef(false);

  // Animations
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const buttonActiveAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Heading
    Animated.parallel([
      Animated.timing(headingOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(headingTranslate, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    // Sub
    setTimeout(() => {
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300);

    // Footer
    setTimeout(() => {
      Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 600);
  }, []);

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

  // ─── Toggle logic ──────────────────────────────────────────────────
  const handleToggle = useCallback((id: string) => {
    setSelected((prev) => {
      if (id === 'none') {
        // "None" is exclusive — deselects everything else
        return prev.includes('none') ? [] : ['none'];
      }
      // Any other card deselects "None"
      const withoutNone = prev.filter((s) => s !== 'none');
      if (withoutNone.includes(id)) {
        return withoutNone.filter((s) => s !== id);
      }
      return [...withoutNone, id];
    });
  }, []);

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const conditions = selected.includes('none') ? [] : selected;
    dispatch({ type: 'SET_CONDITIONS', payload: conditions });

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S11_SymptomGrid');
    });
  };

  const buttonOpacity = buttonActiveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  const renderItem = useCallback(
    ({ item, index }: { item: Condition; index: number }) => (
      <ConditionCard
        item={item}
        isSelected={selected.includes(item.id)}
        onToggle={handleToggle}
        index={index}
      />
    ),
    [selected, handleToggle]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={10} total={31} variant="dark" />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Animated.Text
            style={[styles.heading, { opacity: headingOpacity, transform: [{ translateY: headingTranslate }] }]}
          >
            What does {childName} deal with?
          </Animated.Text>
          <Animated.Text style={[styles.subheading, { opacity: subOpacity }]}>
            Select all that apply. This shapes everything Kuma checks for.
          </Animated.Text>
        </View>

        {/* Grid */}
        <FlatList
          data={CONDITIONS}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          style={styles.grid}
        />

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <Text style={styles.noteText}>You can update these anytime.</Text>

          <Animated.View style={{ opacity: buttonOpacity, transform: [{ scale: buttonScale }] }}>
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

  header: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8,
    alignItems: 'center',
  },
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22, lineHeight: 30,
    color: COLORS.cream, textAlign: 'center', marginBottom: 8,
  },
  subheading: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,248,240,0.55)', textAlign: 'center',
  },

  // Grid
  grid: { flex: 1 },
  gridContent: {
    paddingHorizontal: GRID_PADDING, paddingTop: 20, paddingBottom: 8,
  },
  gridRow: {
    justifyContent: 'space-between', marginBottom: GRID_GAP,
  },

  // Card
  card: {
    width: CARD_WIDTH, height: 100,
    backgroundColor: CARD_BG, borderRadius: 14,
    padding: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
    // Shadow (activated on selection via animated shadowOpacity)
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, elevation: 4,
  },
  checkmark: {
    position: 'absolute', top: 8, right: 10,
    fontFamily: FONT_FAMILY.heading, fontSize: 16,
    color: COLORS.amber,
  },
  cardEmoji: {
    fontSize: 28, marginBottom: 6,
  },
  cardLabel: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 14,
    color: COLORS.cream, textAlign: 'center', lineHeight: 18,
  },

  // Footer
  footer: {
    paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 16,
  },
  noteText: {
    fontFamily: FONT_FAMILY.body, fontSize: 10,
    color: 'rgba(255,248,240,0.3)',
  },
  button: {
    width: SCREEN_WIDTH - 48, height: 52,
    backgroundColor: COLORS.amber, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
  },
  buttonDisabled: { shadowOpacity: 0 },
  buttonText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: FONT_SIZE.lg,
    color: COLORS.white,
  },
});
