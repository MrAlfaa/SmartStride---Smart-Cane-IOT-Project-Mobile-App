import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import StyledProvider from './src/styles/StyledProvider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider>
      <StyledProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </StyledProvider>
    </PaperProvider>
  );
}
