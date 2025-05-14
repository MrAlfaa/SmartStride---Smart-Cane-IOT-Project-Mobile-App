import React, { useState } from 'react';
import { Alert, Keyboard, TouchableWithoutFeedback, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  H1, 
  Paragraph, 
  TextInput,
  PrimaryButton, 
  ButtonText, 
  Container
} from '../components/common/StyledComponents';
import { verifyDeviceId } from '../services/authService';
import { Theme } from '../styles/theme';

const LoginContainer = styled(Container)`
  justify-content: center;
  padding-horizontal: ${(props: { theme: Theme }) => props.theme.spacing.xl}px;
`;

const LogoContainer = styled.View`
  align-items: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xxl}px;
`;

const Title = styled(H1)`
  text-align: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const Subtitle = styled(Paragraph)`
  text-align: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xl}px;
`;

const InputContainer = styled.View`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xl}px;
`;

const InputLabel = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
`;

const DeviceIdInput = styled(TextInput)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const Logo = styled.Image`
  width: 150px;
  height: 150px;
  resize-mode: contain;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
`;

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<ParamListBase>;
};

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [deviceId, setDeviceId] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Reset the form when screen is focused
      setDeviceId('');
      setLoading(false);
      
      return () => {};
    }, [])
  );

  const handleLogin = async () => {
    if (!deviceId.trim()) {
      Alert.alert('Error', 'Please enter your Device ID');
      return;
    }
    
    setLoading(true);
    
    try {
      const isValid = await verifyDeviceId(deviceId.trim());
      
      if (isValid) {
        // Store device ID in local storage or context for future use
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'No registered device found with this Device ID');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to verify device ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LoginContainer>
        <LogoContainer>
          <Logo source={require('../../assets/icon.png')} />
          <Title>SmartStride</Title>
          <Subtitle>
            Enter your Device ID to connect to your Smart Cane
          </Subtitle>
        </LogoContainer>

        <InputContainer>
          <InputLabel>Device ID</InputLabel>
          <DeviceIdInput
            placeholder="Enter your Device ID (e.g., SC-2334)"
            value={deviceId}
            onChangeText={setDeviceId}
            autoCapitalize="characters"
          />
        </InputContainer>

        <PrimaryButton 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ButtonText>Verifying...</ButtonText>
          ) : (
            <ButtonText>Connect to Device</ButtonText>
          )}
        </PrimaryButton>
      </LoginContainer>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
