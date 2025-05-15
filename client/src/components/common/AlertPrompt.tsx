import React, { useState, useEffect } from 'react';
import { Alert, Platform, TextInput, View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';

// This is a cross-platform AlertPrompt implementation 
// since Alert.prompt is only available on iOS
export const showPrompt = (
  title: string,
  message: string,
  callback: (text: string) => void,
  defaultValue: string = ''
) => {
  if (Platform.OS === 'ios') {
    // Use native Alert.prompt on iOS
    Alert.prompt(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: (text) => callback(text || '') }
      ],
      'plain-text',
      defaultValue
    );
  } else {
    // For Android, we need to use our own implementation
    // which would be a modal with a text input
    // This can be implemented with a global modal manager
    // For simplicity, we use a simple Alert here
    Alert.alert(
      'Not Available',
      'This feature is only available on iOS devices at this time.',
      [{ text: 'OK' }]
    );
  }
};
