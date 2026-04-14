import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
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
import { getDecoderIngredient } from '../../data/decoderIngredients';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S18_IngredientDecoder'>;

const INGREDIENT_LABEL_TEXT =
  'INGREDIENTS: WATER (AQUA), GLYCERIN, DISTEARYLDIMONIUM CHLORIDE, PETROLATUM, ISOPROPYL PALMITATE, CETYL ALCOHOL, DIMETHICONE, AVENA SATIVA (OAT) KERNEL FLOUR, BENZYL ALCOHOL, SODIUM CHLORIDE, METHYLPARABEN, PROPYLPARABEN, BUTYLPARABEN, ETHYLPARABEN, ISOBUTYLPARABEN, PHENOXYETHANOL, CITRIC ACID, SODIUM HYDROXIDE, MAGNESIUM ALUMINUM SILICATE, TOCOPHERYL ACETATE, ALOE BARBADENSIS LEAF JUICE.';

const TYPEWRITER_SPEED = 20; // ms per character

export default function S18_IngredientDecoder({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  const decoder = useMemo(
    () => getDecoderIngredient(state.conditions),
    [state.conditions]
  );
  const description = decoder.description.replace('{childName}', childName);

  // Typewriter state
  const [typedChars, setTypedChars] = useState(0);
  const [typewriterDone, setTypewriterDone] = useState(false);

  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const empathyOpacity = useRef(new Animated.Value(0)).current;
  const decoderOpacity = useRef(new Animated.Value(0)).current;
  const decoderTranslate = useRef(new Animated.Value(40)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagTranslateX = useRef(new Animated.Value(-20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading
    Animated.timing(headingOpacity, {
      toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    // 2. Ingredient label (400ms)
    timers.push(setTimeout(() => {
      Animated.timing(labelOpacity, {
        toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start();
    }, 400));

    // 3. "Neither can most parents." (500ms after label)
    timers.push(setTimeout(() => {
      Animated.timing(empathyOpacity, {
        toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start();
    }, 1300));

    // 4. Decoder card slides up (400ms after empathy)
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(decoderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(decoderTranslate, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();

      // Start typewriter after card visible
      setTimeout(() => startTypewriter(), 300);
    }, 1700));

    // 5. Button
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 2100));

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Typewriter effect ──────────────────────────────────────────────
  const startTypewriter = () => {
    let charIndex = 0;
    const interval = setInterval(() => {
      charIndex++;
      setTypedChars(charIndex);
      if (charIndex >= description.length) {
        clearInterval(interval);
        setTypewriterDone(true);

        // Condition tag slides in after typewriter
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(tagOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.spring(tagTranslateX, { toValue: 0, friction: 7, tension: 80, useNativeDriver: true }),
          ]).start();
        }, 200);

        // Footer text
        setTimeout(() => {
          Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, 500);
      }
    }, TYPEWRITER_SPEED);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S19_EnterZip');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={18} total={31} variant="dark" />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Animated.Text style={[styles.heading, { opacity: headingOpacity }]}>
            Can you read this?
          </Animated.Text>

          {/* Ingredient label mockup */}
          <Animated.View style={[styles.labelCard, { opacity: labelOpacity }]}>
            <Text style={styles.labelText}>{INGREDIENT_LABEL_TEXT}</Text>
            <View style={styles.labelFooter}>
              <View style={styles.labelBarcode} />
              <View style={styles.labelCircle} />
            </View>
          </Animated.View>

          {/* Empathy line */}
          <Animated.Text style={[styles.empathyText, { opacity: empathyOpacity }]}>
            Neither can most parents.
          </Animated.Text>

          {/* Decoder card */}
          <Animated.View
            style={[
              styles.decoderCard,
              { opacity: decoderOpacity, transform: [{ translateY: decoderTranslate }] },
            ]}
          >
            <View style={styles.decoderHeader}>
              <Text style={styles.decoderName}>{decoder.name}</Text>
              <Animated.View
                style={[
                  styles.conditionTag,
                  { opacity: tagOpacity, transform: [{ translateX: tagTranslateX }] },
                ]}
              >
                <Text style={styles.conditionTagText}>
                  {childName}'s condition: {decoder.conditionTag}
                </Text>
              </Animated.View>
            </View>

            {/* Typewriter description */}
            <Text style={styles.decoderDescription}>
              {description.substring(0, typedChars)}
              {!typewriterDone && <Text style={styles.cursor}>|</Text>}
            </Text>

            {/* Warning icon row */}
            <View style={styles.warningRow}>
              <View style={styles.warningIconWrap}>
                <Text style={styles.warningIcon}>⚠</Text>
              </View>
              <View style={styles.warningLine} />
            </View>
          </Animated.View>

          {/* Footer text */}
          <Animated.Text style={[styles.footerText, { opacity: footerOpacity }]}>
            Kuma decodes every ingredient for {childName}'s specific conditions.
          </Animated.Text>
        </ScrollView>

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
  scrollContent: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 16, alignItems: 'center' },

  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 22,
    color: COLORS.cream, textAlign: 'center', marginBottom: 24,
  },

  // Ingredient label mockup
  labelCard: {
    width: '100%', backgroundColor: '#FFF1E5',
    padding: 20, borderRadius: RADIUS.sm,
    transform: [{ rotate: '-1deg' }],
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 6,
    marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(215,195,175,0.2)',
  },
  labelText: {
    fontFamily: 'Courier', fontSize: 8, lineHeight: 12,
    color: '#524435', textAlign: 'justify',
  },
  labelFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(215,195,175,0.3)',
    paddingTop: 8,
  },
  labelBarcode: {
    width: 60, height: 16, backgroundColor: 'rgba(215,195,175,0.4)',
  },
  labelCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: 'rgba(215,195,175,0.3)',
  },

  empathyText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.sm,
    color: 'rgba(255,241,229,0.55)', letterSpacing: 0.5,
    marginTop: 16, marginBottom: 32,
  },

  // Decoder card
  decoderCard: {
    width: '100%', backgroundColor: CARD_BG,
    borderRadius: RADIUS.card, padding: 24,
    borderLeftWidth: 4, borderLeftColor: COLORS.amber,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 24, elevation: 8,
  },
  decoderHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap',
    gap: 8, marginBottom: 12,
  },
  decoderName: {
    fontFamily: FONT_FAMILY.heading, fontSize: 15,
    color: COLORS.amber, letterSpacing: 0.5,
  },
  conditionTag: {
    backgroundColor: COLORS.coral, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  conditionTagText: {
    fontFamily: FONT_FAMILY.buttonLabel, fontSize: 10,
    color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  decoderDescription: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: 13, lineHeight: 21,
    color: COLORS.cream, marginBottom: 20,
  },
  cursor: {
    color: COLORS.amber, fontWeight: '700',
  },

  warningRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  warningIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(212,137,14,0.2)',
    borderWidth: 1, borderColor: 'rgba(212,137,14,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  warningIcon: { fontSize: 18, color: COLORS.amber },
  warningLine: {
    flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)',
  },

  footerText: {
    fontFamily: FONT_FAMILY.body, fontSize: 13, lineHeight: 20,
    color: 'rgba(255,241,229,0.6)', textAlign: 'center',
    fontStyle: 'italic', marginTop: 28, maxWidth: 280,
  },

  // CTA
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.base, color: COLORS.white,
  },
});
