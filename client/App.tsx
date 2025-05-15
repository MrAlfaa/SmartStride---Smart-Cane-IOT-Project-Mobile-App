import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StyledProvider from './src/styles/StyledProvider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // No direct text strings should be here
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StyledProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </StyledProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
