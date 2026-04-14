import React, { useEffect, useRef } from 'react';
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
import ProgressBar from '../../components/shared/ProgressBar';
import SkipLink from '../../components/shared/SkipLink';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S05_HiddenTriggers'>;

// ─── Card data ──────────────────────────────────────────────────────────
interface TriggerCard {
  title: string;
  emoji: string;
  ingredients: string[];
  stat: string;
}

const CARDS: TriggerCard[] = [
  {
    title: 'Eczema triggers',
    emoji: '🐻',
    ingredients: [
      'Sodium Lauryl Sulfate',
      'Fragrance (undisclosed mix of 30+ chemicals)',
      'Methylisothiazolinone',
    ],
    stat: 'Found in 6 out of 10 "gentle" baby washes',
  },
  {
    title: 'ADHD-linked additives',
    emoji: '⚡',
    ingredients: [
      'Red 40',
      'Yellow 5',
      'Sodium Benzoate',
    ],
    stat: 'Found in most children\'s vitamins and snacks',
  },
  {
    title: 'Hidden allergens',
    emoji: '🤧',
    ingredients: [
      'Casein (milk derivative)',
      'Hydrolyzed Wheat Protein',
      'Arachis Oil (peanut)',
    ],
    stat: 'Often listed under names parents don\'t recognize',
  },
];

const CARD_STAGGER = 200;
const INGREDIENT_STAGGER = 150;
const INITIAL_DELAY = 400;

export default function S05_HiddenTriggers({ navigation }: Props) {
  // ─── Animation values ───────────────────────────────────────────────
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslate = useRef(new Animated.Value(8)).current;

  // Per-card: opacity + translateX
  const cardAnims = useRef(
    CARDS.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(40),
    }))
  ).current;

  // Per-ingredient per-card: opacity + dot scale
  const ingredientAnims = useRef(
    CARDS.map((card) =>
      card.ingredients.map(() => ({
        opacity: new Animated.Value(0),
        dotScale: new Animated.Value(1),
      }))
    )
  ).current;

  // Per-card stat line
  const statAnims = useRef(
    CARDS.map(() => new Animated.Value(0))
  ).current;

  // Footer fact
  const factOpacity = useRef(new Animated.Value(0)).current;
  const factTranslate = useRef(new Animated.Value(8)).current;

  // Button
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Heading fades in
    Animated.parallel([
      Animated.timing(headingOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headingTranslate, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Cards stagger in from right
    let lastIngredientTime = 0;

    CARDS.forEach((card, cardIndex) => {
      const cardDelay = INITIAL_DELAY + cardIndex * CARD_STAGGER;

      timers.push(
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(cardAnims[cardIndex].opacity, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.spring(cardAnims[cardIndex].translateX, {
              toValue: 0,
              friction: 8,
              tension: 70,
              useNativeDriver: true,
            }),
          ]).start();
        }, cardDelay)
      );

      // 3. Ingredients within each card stagger in
      const ingredientStartDelay = cardDelay + 350;

      card.ingredients.forEach((_, ingIndex) => {
        const ingDelay = ingredientStartDelay + ingIndex * INGREDIENT_STAGGER;

        timers.push(
          setTimeout(() => {
            // Light haptic per ingredient
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Fade in ingredient
            Animated.timing(ingredientAnims[cardIndex][ingIndex].opacity, {
              toValue: 1,
              duration: 200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start();

            // Coral dot pulse: 1.0 → 1.3 → 1.0
            Animated.sequence([
              Animated.timing(ingredientAnims[cardIndex][ingIndex].dotScale, {
                toValue: 1.4,
                duration: 100,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(ingredientAnims[cardIndex][ingIndex].dotScale, {
                toValue: 1,
                duration: 100,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
            ]).start();

            // Track latest ingredient time for footer scheduling
            if (ingDelay > lastIngredientTime) {
              lastIngredientTime = ingDelay;
            }
          }, ingDelay)
        );
      });

      // 4. Stat line appears after ingredients
      const statDelay = ingredientStartDelay + card.ingredients.length * INGREDIENT_STAGGER + 200;
      timers.push(
        setTimeout(() => {
          Animated.timing(statAnims[cardIndex], {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
        }, statDelay)
      );

      if (statDelay > lastIngredientTime) {
        lastIngredientTime = statDelay;
      }
    });

    // 5. Footer fact after all cards done
    const factDelay = lastIngredientTime + 600;
    timers.push(
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(factOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(factTranslate, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, factDelay)
    );

    // 6. Button
    timers.push(
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(buttonTranslate, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, factDelay + 300)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // ─── Button handler ─────────────────────────────────────────────────
  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('S06_BannedEurope');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* ── Progress + skip ──────────────────────────────────────── */}
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={5} total={31} variant="light" />
          </View>
          <SkipLink
            onPress={() => navigation.navigate('S09_WhoAreYouProtecting')}
            variant="light"
          />
        </View>

        {/* ── Scrollable content ───────────────────────────────────── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <Animated.Text
            style={[
              styles.heading,
              {
                opacity: headingOpacity,
                transform: [{ translateY: headingTranslate }],
              },
            ]}
          >
            What's hiding in plain sight.
          </Animated.Text>

          {/* Cards */}
          {CARDS.map((card, cardIndex) => (
            <Animated.View
              key={card.title}
              style={[
                styles.card,
                {
                  opacity: cardAnims[cardIndex].opacity,
                  transform: [{ translateX: cardAnims[cardIndex].translateX }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                </View>
              </View>

              {/* Ingredients */}
              <View style={styles.ingredientsList}>
                {card.ingredients.map((ingredient, ingIndex) => (
                  <Animated.View
                    key={ingredient}
                    style={[
                      styles.ingredientRow,
                      { opacity: ingredientAnims[cardIndex][ingIndex].opacity },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.coralDot,
                        {
                          transform: [
                            { scale: ingredientAnims[cardIndex][ingIndex].dotScale },
                          ],
                        },
                      ]}
                    />
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </Animated.View>
                ))}
              </View>

              {/* Stat footer */}
              <Animated.View
                style={[
                  styles.cardFooter,
                  { opacity: statAnims[cardIndex] },
                ]}
              >
                <Text style={styles.cardStat}>{card.stat}</Text>
              </Animated.View>
            </Animated.View>
          ))}

          {/* Footer fact */}
          <Animated.Text
            style={[
              styles.factText,
              {
                opacity: factOpacity,
                transform: [{ translateY: factTranslate }],
              },
            ]}
          >
            A baby's skin is 30% thinner than an adult's. These ingredients
            absorb faster and deeper.
          </Animated.Text>

          {/* CTA */}
          <Animated.View
            style={[
              styles.buttonWrap,
              {
                opacity: buttonOpacity,
                transform: [
                  { translateY: buttonTranslate },
                  { scale: buttonScale },
                ],
              },
            ]}
          >
            <Pressable onPress={handleContinue} style={styles.button}>
              <Text style={styles.buttonText}>What about in Europe?</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  safeArea: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: SPACING.sm,
    gap: 16,
  },
  progressBarWrap: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.navy,
    letterSpacing: -0.3,
    marginBottom: 24,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    // Shadow
    shadowColor: 'rgba(40, 25, 3, 0.06)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 32,
    marginTop: -4,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: 14,
    color: COLORS.navy,
  },

  // Ingredients
  ingredientsList: {
    gap: 8,
    marginBottom: 14,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  coralDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.coral,
    marginTop: 5,
  },
  ingredientText: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.navy,
    flex: 1,
  },

  // Card footer
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#FFF1E5',
    paddingTop: 12,
  },
  cardStat: {
    fontFamily: FONT_FAMILY.body,
    fontSize: 10,
    color: COLORS.coral,
  },

  // Fact
  factText: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(27, 42, 74, 0.6)',
    fontStyle: 'italic',
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 32,
  },

  // Button
  buttonWrap: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.buttonLabel,
    fontSize: FONT_SIZE.base,
    color: '#482B00',
  },
});
