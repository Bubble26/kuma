import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
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
import BearMascot from '../../components/shared/BearMascot';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'S25_KumaPledge'>;

// ─── Pledge data ────────────────────────────────────────────────────────
interface Pledge {
  icon: string;
  text: string; // {childName} replaced at render
  haptic: 'light' | 'medium';
}

const PLEDGES: Pledge[] = [
  {
    icon: '💰',
    text: 'We will never accept money from brands to change a score.',
    haptic: 'light',
  },
  {
    icon: '🔒',
    text: "Your family's data belongs to you. We don't sell it. Ever.",
    haptic: 'light',
  },
  {
    icon: '🧠',
    text: "Every recommendation is based on {childName}'s conditions, not advertising.",
    haptic: 'medium',
  },
];

const PLEDGE_INTERVAL = 1500; // ms between each pledge

export default function S25_Pledge({ navigation }: Props) {
  const { state } = useOnboarding();
  const childName = state.childName || 'your child';

  // ─── Animation values ───────────────────────────────────────────────
  const bearOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;
  const headingOpacity = useRef(new Animated.Value(0)).current;

  // Per-pledge: opacity + translateY + divider opacity
  const pledgeAnims = useRef(
    PLEDGES.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(12),
      dividerOpacity: new Animated.Value(0),
    }))
  ).current;

  // Button (hidden until all pledges visible)
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 1. Bear fades in (600ms)
    Animated.timing(bearOpacity, {
      toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    // 2. "The Kuma Pledge" heading (400ms after bear)
    timers.push(setTimeout(() => {
      Animated.timing(headingOpacity, {
        toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }).start();
    }, 600));

    // 3. Pledges, time-released (1500ms apart, starting 1500ms after heading)
    const pledgeStartTime = 600 + 400 + PLEDGE_INTERVAL;

    PLEDGES.forEach((pledge, i) => {
      const delay = pledgeStartTime + i * PLEDGE_INTERVAL;

      timers.push(setTimeout(() => {
        // Haptic
        const style = pledge.haptic === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
        Haptics.impactAsync(style);

        // Divider fades in first
        Animated.timing(pledgeAnims[i].dividerOpacity, {
          toValue: 1, duration: 200, useNativeDriver: true,
        }).start();

        // Statement fades + slides
        Animated.parallel([
          Animated.timing(pledgeAnims[i].opacity, {
            toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          Animated.timing(pledgeAnims[i].translateY, {
            toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
        ]).start();
      }, delay));
    });

    // 4. After all pledges: glow pulse (800ms)
    const allPledgesTime = pledgeStartTime + PLEDGES.length * PLEDGE_INTERVAL + 500;

    timers.push(setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.5, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.15, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
      ]).start();
    }, allPledgesTime));

    // 5. Button reveals after glow pulse
    timers.push(setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, allPledgesTime + 800));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('S26_FakeLoading');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.progressRow}>
          <View style={styles.progressBarWrap}>
            <ProgressBar current={25} total={31} variant="dark" />
          </View>
        </View>

        <View style={styles.content}>
          {/* Mascot + glow */}
          <View style={styles.bearSection}>
            <Animated.View style={[styles.bearGlow, { opacity: glowOpacity }]} />
            <Animated.View style={{ opacity: bearOpacity }}>
              <BearMascot expression="protective" size={140} showBaby={true} />
            </Animated.View>
          </View>

          {/* Title */}
          <Animated.Text style={[styles.heading, { opacity: headingOpacity }]}>
            The Kuma Pledge
          </Animated.Text>

          {/* Pledge statements */}
          <View style={styles.pledgesWrap}>
            {PLEDGES.map((pledge, i) => (
              <View key={i}>
                {/* Divider */}
                <Animated.View style={[styles.divider, { opacity: pledgeAnims[i].dividerOpacity }]} />

                {/* Statement */}
                <Animated.View
                  style={[
                    styles.pledgeRow,
                    {
                      opacity: pledgeAnims[i].opacity,
                      transform: [{ translateY: pledgeAnims[i].translateY }],
                    },
                  ]}
                >
                  <Text style={styles.pledgeIcon}>{pledge.icon}</Text>
                  <Text style={styles.pledgeText}>
                    {pledge.text.replace('{childName}', childName)}
                  </Text>
                </Animated.View>
              </View>
            ))}
            {/* Bottom divider */}
            <Animated.View
              style={[
                styles.divider,
                { opacity: pledgeAnims[PLEDGES.length - 1].dividerOpacity },
              ]}
            />
          </View>
        </View>

        {/* CTA — hidden until all pledges shown */}
        <Animated.View
          style={[styles.footer, { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }, { scale: buttonScale }] }]}
        >
          <Pressable onPress={handleContinue} style={styles.button}>
            <Text style={styles.buttonText}>I trust Kuma.</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1528' },
  safeArea: { flex: 1 },
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: SPACING.sm,
  },
  progressBarWrap: { flex: 1 },

  content: {
    flex: 1, paddingHorizontal: 28, paddingTop: 16,
    alignItems: 'center',
  },

  // Bear
  bearSection: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, position: 'relative',
  },
  bearGlow: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.amber,
  },

  // Heading
  heading: {
    fontFamily: FONT_FAMILY.heading, fontSize: 24,
    color: COLORS.cream, textAlign: 'center',
    letterSpacing: -0.3, marginBottom: 28,
  },

  // Pledges
  pledgesWrap: { width: '100%' },
  divider: {
    height: 1, backgroundColor: 'rgba(212,137,14,0.2)', width: '100%',
  },
  pledgeRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    paddingVertical: 24, paddingHorizontal: 4,
  },
  pledgeIcon: { fontSize: 20, marginTop: 2 },
  pledgeText: {
    fontFamily: FONT_FAMILY.bodyMedium, fontSize: FONT_SIZE.lg, lineHeight: 28,
    color: COLORS.cream, flex: 1,
  },

  // CTA
  footer: { paddingHorizontal: 28, paddingBottom: 16 },
  button: {
    width: '100%', height: 56, backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: COLORS.amber, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 32, elevation: 6,
  },
  buttonText: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.lg, color: '#482B00',
  },
  buttonArrow: {
    fontFamily: FONT_FAMILY.heading, fontSize: FONT_SIZE.xl, color: '#482B00',
  },
});
