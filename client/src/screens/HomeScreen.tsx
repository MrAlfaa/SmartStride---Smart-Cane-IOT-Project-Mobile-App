import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  H1, 
  H2, 
  Paragraph, 
  Card, 
  PrimaryButton, 
  ButtonText, 
  Row,
  Badge,
  BadgeText
} from '../components/common/StyledComponents';
import { getLatestReading } from '../services/deviceDataService';
import { subscribeTofallDetection } from '../services/notificationService';
import { DeviceData } from '../types/deviceData';
import { Theme } from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
// Add these imports for navigation types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const StatusIndicator = styled.View<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${(props: { active: boolean; theme: Theme }) => 
    props.active ? props.theme.colors.success : props.theme.colors.error};
  margin-right: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const StatusRow = styled(Row)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const StatusText = styled(Paragraph)`
  margin-bottom: 0;
`;

const DeviceCard = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
`;

const StatsCard = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
`;

const StatItem = styled(View)`
  align-items: center;
  flex: 1;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const StatValue = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.xxl}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  color: ${(props: { theme: Theme }) => props.theme.colors.primary};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
`;

const StatLabel = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
`;

const IconContainer = styled.View`
  margin-right: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const QuickActionButton = styled(PrimaryButton)`
  flex: 1;
  margin-horizontal: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
`;

const AlertBanner = styled.View`
  background-color: ${(props: { theme: Theme }) => props.theme.colors.error};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
`;

const AlertText = styled.Text`
  color: white;
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  flex: 1;
  margin-left: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<ParamListBase>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fallDetected, setFallDetected] = useState<boolean>(false);
  const [fallLocation, setFallLocation] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLatestReading();
        setDeviceData(data);
        
        // Check if fall is detected from the data
        if (data?.status?.fall === 'detected') {
          setFallDetected(true);
          setFallLocation(data.location);
          showFallAlert();
        }
      } catch (error) {
        console.error('Error fetching device data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // Set up a timer to refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    // Subscribe to fall detection
    const unsubscribe = subscribeTofallDetection((detected, location) => {
      if (detected) {
        setFallDetected(true);
        setFallLocation(location);
        showFallAlert();
      } else {
        setFallDetected(false);
      }
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const showFallAlert = () => {
    Alert.alert(
      "Fall Detected!",
      "A fall has been detected. Do you need emergency assistance?",
      [
        {
          text: "I'm OK",
          onPress: () => setFallDetected(false),
          style: "cancel"
        },
        { 
          text: "Get Help", 
          onPress: () => {
            // This would typically trigger an emergency call or message
            Alert.alert("Help is on the way", "Emergency contacts have been notified.");
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleViewOnMap = () => {
    if (fallLocation) {
      navigation.navigate('Track', { 
        initialLocation: fallLocation 
      });
    }
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </Container>
    );
  }

  // Sample data for the stats (replace with real data from deviceData when available)
  const battery = deviceData?.battery || 85;
  const steps = deviceData?.steps || 6254;
  const distance = deviceData?.distance || 3.2;

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <H1>Welcome to SmartStride</H1>
        <Paragraph>
          Monitor and control your Smart Cane to enhance mobility and safety.
        </Paragraph>
        
        {fallDetected && (
          <AlertBanner>
            <Ionicons name="warning" size={24} color="white" />
            <AlertText>Fall detected! Check on the user and take action if needed.</AlertText>
          </AlertBanner>
        )}
        
        <DeviceCard>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <H2 style={{ marginBottom: 0 }}>Device Status</H2>
            <IconContainer>
              <Ionicons name="bluetooth" size={24} color="#2196F3" />
            </IconContainer>
          </Row>
          
          <StatusRow>
            <StatusIndicator active={deviceData?.status?.connected || false} />
            <StatusText>
              {deviceData?.status?.connected 
                ? "Your SmartStride cane is active" 
                : "Your SmartStride cane is inactive"}
            </StatusText>
          </StatusRow>
          
          {fallDetected && (
            <PrimaryButton 
              onPress={handleViewOnMap}
              style={{ backgroundColor: '#F44336', marginBottom: 8 }}
            >
              <ButtonText>View Fall Location on Map</ButtonText>
            </PrimaryButton>
          )}
          
          <PrimaryButton onPress={() => console.log('Checking status')}>
            <ButtonText>Refresh Status</ButtonText>
          </PrimaryButton>
        </DeviceCard>
        
        <StatsCard>
          <H2>Today's Statistics</H2>
          <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <StatItem>
              <StatValue>{battery}%</StatValue>
              <StatLabel>Battery</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{steps}</StatValue>
              <StatLabel>Steps</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{distance}km</StatValue>
              <StatLabel>Distance</StatLabel>
            </StatItem>
          </Row>
        </StatsCard>
        
        <Card>
          <H2>Quick Actions</H2>
          <Row style={{ marginTop: 8 }}>
            <QuickActionButton onPress={() => console.log('Finding cane')}>
              <ButtonText>Find Cane</ButtonText>
            </QuickActionButton>
            <QuickActionButton onPress={() => console.log('Calibrating')}>
              <ButtonText>Calibrate</ButtonText>
            </QuickActionButton>
          </Row>
        </Card>
      </ScrollView>
    </Container>
  );
};

export default HomeScreen;
