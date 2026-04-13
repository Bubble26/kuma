import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { SCREEN, SPACING } from '../../theme/spacing';
import ProgressBar from './ProgressBar';

type BackgroundVariant = 'navy' | 'navyDark' | 'navyExtraDark' | 'cream';

interface ScreenWrapperProps {
  children: React.ReactNode;
  background?: BackgroundVariant;
  progress?: { current: number; total: number };
  showProgress?: boolean;
  style?: ViewStyle;
}

const BG_MAP: Record<BackgroundVariant, string> = {
  navy: COLORS.navy,
  navyDark: COLORS.navyDark,
  navyExtraDark: COLORS.navyExtraDark,
  cream: COLORS.cream,
};

export default function ScreenWrapper({
  children,
  background = 'navy',
  progress,
  showProgress = true,
  style,
}: ScreenWrapperProps) {
  const isDark = background !== 'cream';
  const barStyle = isDark ? 'light-content' : 'dark-content';
  const progressVariant = isDark ? 'dark' : 'light';

  return (
    <View style={[styles.container, { backgroundColor: BG_MAP[background] }]}>
      <StatusBar barStyle={barStyle} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {showProgress && progress && (
          <View style={styles.progressContainer}>
            <ProgressBar
              current={progress.current}
              total={progress.total}
              variant={progressVariant}
            />
          </View>
        )}
        <View style={[styles.content, style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: SCREEN.paddingHorizontal,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN.paddingHorizontal,
  },
});
