import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from './src/context/OnboardingContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
