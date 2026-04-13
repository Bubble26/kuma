import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/shared/ScreenWrapper';
import AmberButton from '../../components/shared/AmberButton';
import { COLORS } from '../../theme/colors';
import { FONT_FAMILY, FONT_SIZE } from '../../theme/fonts';
import { OnboardingStackParamList, SCREEN_ORDER } from '../../navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, any>;

interface PlaceholderConfig {
  title: string;
  subtitle: string;
  screenNumber: number;
  block: string;
  background: 'navy' | 'navyDark' | 'navyExtraDark' | 'cream';
  canSkip: boolean;
}

export function createPlaceholder(config: PlaceholderConfig) {
  return function PlaceholderScreenComponent({ navigation, route }: Props) {
    const currentIndex = SCREEN_ORDER.indexOf(route.name as any);
    const nextScreen = SCREEN_ORDER[currentIndex + 1];

    return (
      <ScreenWrapper
        background={config.background}
        progress={{ current: config.screenNumber, total: 31 }}
      >
        <View style={styles.center}>
          <Text style={[
            styles.block,
            { color: config.background === 'cream' ? COLORS.textSecondary : 'rgba(255,248,240,0.4)' },
          ]}>
            {config.block}
          </Text>
          <Text style={[
            styles.number,
            { color: config.background === 'cream' ? COLORS.amber : COLORS.amber },
          ]}>
            {config.screenNumber}
          </Text>
          <Text style={[
            styles.title,
            { color: config.background === 'cream' ? COLORS.textPrimary : COLORS.cream },
          ]}>
            {config.title}
          </Text>
          <Text style={[
            styles.subtitle,
            { color: config.background === 'cream' ? COLORS.textSecondary : 'rgba(255,248,240,0.6)' },
          ]}>
            {config.subtitle}
          </Text>
        </View>

        <View style={styles.footer}>
          <AmberButton
            title={nextScreen ? 'Continue' : 'Finish'}
            onPress={() => {
              if (nextScreen) {
                navigation.navigate(nextScreen as any);
              }
            }}
          />
        </View>
      </ScreenWrapper>
    );
  };
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block: {
    fontFamily: FONT_FAMILY.bodyMedium,
    fontSize: FONT_SIZE.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  number: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontFamily: FONT_FAMILY.heading,
    fontSize: FONT_SIZE['2xl'],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.body,
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    paddingBottom: 16,
  },
});
