import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

export type BearExpression =
  | 'neutral'
  | 'curious'
  | 'concerned'
  | 'protective'
  | 'celebrating'
  | 'sleeping'
  | 'waving';

interface BearMascotProps {
  expression?: BearExpression;
  size?: number;
  showBaby?: boolean;
}

/**
 * Placeholder view for the bear mascot.
 * Will be replaced with actual SVG/Lottie assets.
 * Sized to match the final asset dimensions.
 */
export default function BearMascot({
  expression = 'neutral',
  size = 200,
  showBaby = true,
}: BearMascotProps) {
  const babySize = size * 0.45;

  return (
    <View style={[styles.container, { width: size, height: size * 1.2 }]}>
      {/* Mama bear placeholder */}
      <View
        style={[
          styles.placeholder,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: size * 0.35,
            backgroundColor: COLORS.amber,
          },
        ]}
      />
      {/* Baby cub placeholder */}
      {showBaby && (
        <View
          style={[
            styles.baby,
            {
              width: babySize,
              height: babySize,
              borderRadius: babySize * 0.5,
              backgroundColor: COLORS.softGold,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    opacity: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baby: {
    opacity: 0.25,
    position: 'absolute',
    bottom: '5%',
    right: '10%',
  },
});
