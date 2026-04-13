import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingNavigator from './OnboardingNavigator';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      {/* Main app tab navigator will be added later */}
    </Stack.Navigator>
  );
}
