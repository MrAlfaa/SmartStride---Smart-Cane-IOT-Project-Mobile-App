import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  H1, 
  H2, 
  H3,
  Paragraph, 
  Card, 
  PrimaryButton, 
  ButtonText, 
  Row,
  Badge,
  BadgeText,
  Caption
} from '../components/common/StyledComponents';
import { getLatestReading } from '../services/deviceDataService';
import { subscribeTofallDetection } from '../services/notificationService';
import { DeviceData } from '../types/deviceData';
import { Theme } from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const WelcomeContainer = styled.View`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
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
  border-left-width: 4px;
  border-left-color: ${(props: { theme: Theme }) => props.theme.colors.primary};
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
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const QuickActionButtonText = styled(ButtonText)`
  margin-left: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
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

const InfoCard = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
  border-left-width: 4px;
  border-left-color: ${(props: { theme: Theme; color?: string }) => 
    props.color || props.theme.colors.info};
`;

const CardHeader = styled(Row)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const BatteryContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const BatteryLevel = styled.View<{ level: number }>`
  height: 12px;
  width: ${(props: { level: number }) => Math.min(Math.max(props.level, 0), 100)}%;
  background-color: ${(props: { level: number; theme: Theme }) => {
    if (props.level > 50) return props.theme.colors.success;
    if (props.level > 20) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  border-radius: 6px;
`;

const BatteryBackground = styled.View`
  height: 12px;
  width: 100%;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
  border-radius: 6px;
  overflow: hidden;
  margin-top: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const ActionsCardRow = styled(Row)`
  flex-wrap: wrap;
  margin-top: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
  justify-content: space-between;
`;

const LastSyncText = styled(Caption)`
  text-align: right;
  font-style: italic;
`;

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<ParamListBase>;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fallDetected, setFallDetected] = useState<boolean>(false);
  const [fallLocation, setFallLocation] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLatestReading();
        setDeviceData(data);
        setLastUpdated(new Date());
        
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
      "Your care recipient may have fallen. Do they need emergency assistance?",
      [
        {
          text: "False Alarm",
          onPress: () => setFallDetected(false),
          style: "cancel"
        },
        { 
          text: "Respond Now", 
          onPress: () => {
            // This would typically trigger an emergency call or message
            Alert.alert("Emergency Response", "Emergency contacts have been notified.");
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

  const handleRefreshStatus = async () => {
    setLoading(true);
    try {
      const data = await getLatestReading();
      setDeviceData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing status:', error);
      Alert.alert("Error", "Failed to refresh device status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </Container>
    );
  }

  // Format the last updated time
  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Updated just now';
    if (diff === 1) return 'Updated 1 minute ago';
    if (diff < 60) return `Updated ${diff} minutes ago`;
    
    const hours = Math.floor(diff / 60);
    if (hours === 1) return 'Updated 1 hour ago';
    if (hours < 24) return `Updated ${hours} hours ago`;
    
    return `Updated ${lastUpdated.toLocaleDateString()}`;
  };

  // Sample data for the stats (replace with real data from deviceData when available)
  const battery = deviceData?.battery || 85;
  const steps = deviceData?.steps || 6254;
  const distance = deviceData?.distance || 3.2;

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <WelcomeContainer>
          <H1>Welcome to SmartStride</H1>
          <Paragraph>
            Monitor and control your Smart Cane to enhance mobility and safety.
          </Paragraph>
        </WelcomeContainer>
        
        {fallDetected && (
          <AlertBanner>
            <Ionicons name="warning" size={28} color="white" />
            <AlertText>Fall detected! Check on the user and take action if needed.</AlertText>
          </AlertBanner>
        )}
        
        <DeviceCard>
          <CardHeader>
            <H2 style={{ marginBottom: 0 }}>Device Status</H2>
            <IconContainer>
              <Ionicons name="bluetooth" size={24} color="#2196F3" />
            </IconContainer>
          </CardHeader>
          
          <StatusRow>
            <StatusIndicator active={deviceData?.status?.connected || false} />
            <StatusText>
              {deviceData?.status?.connected 
                ? "Your SmartStride cane is active" 
                : "Your SmartStride cane is inactive"}
            </StatusText>
          </StatusRow>
          
          <BatteryContainer>
            <H3 style={{ marginBottom: 0, fontSize: 16 }}>Battery</H3>
            <Paragraph style={{ marginLeft: 10, marginBottom: 0 }}>{battery}%</Paragraph>
          </BatteryContainer>
          <BatteryBackground>
            <BatteryLevel level={battery} />
          </BatteryBackground>
          
          {fallDetected && (
            <PrimaryButton 
              onPress={handleViewOnMap}
              style={{ backgroundColor: '#F44336', marginBottom: 12 }}
            >
              <Ionicons name="location" size={20} color="white" style={{ marginRight: 8 }} />
              <ButtonText>Locate Your Care Recipient</ButtonText>
            </PrimaryButton>
          )}
          
          <PrimaryButton onPress={handleRefreshStatus}>
            <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
            <ButtonText>Refresh Status</ButtonText>
          </PrimaryButton>
          
          <LastSyncText>{formatLastUpdated()}</LastSyncText>
        </DeviceCard>
        
        <InfoCard color="#4CAF50">
          <CardHeader>
            <H2 style={{ marginBottom: 0 }}>Today's Statistics</H2>
            <IconContainer>
              <Ionicons name="stats-chart" size={24} color="#4CAF50" />
            </IconContainer>
          </CardHeader>
          
          <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <StatItem>
                            <Ionicons name="battery-full" size={24} color="#4CAF50" />
              <StatValue>{battery}%</StatValue>
              <StatLabel>Battery</StatLabel>
            </StatItem>
            <StatItem>
              <Ionicons name="footsteps" size={24} color="#2196F3" />
              <StatValue>{steps.toLocaleString()}</StatValue>
              <StatLabel>Steps</StatLabel>
            </StatItem>
            <StatItem>
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#FF9800" />
              <StatValue>{distance}km</StatValue>
              <StatLabel>Distance</StatLabel>
            </StatItem>
          </Row>
        </InfoCard>
        
        <InfoCard color="#FF9800">
          <CardHeader>
            <H2 style={{ marginBottom: 0 }}>Health Insights</H2>
            <IconContainer>
              <Ionicons name="pulse" size={24} color="#FF9800" />
            </IconContainer>
          </CardHeader>
          
          <Paragraph>
            Based on today's activity, your care recipient is having a normal day with regular movement patterns.
          </Paragraph>
          
          <Row style={{ marginTop: 8, alignItems: 'center' }}>
            <Badge variant="info">
              <BadgeText>ACTIVE</BadgeText>
            </Badge>
            <Paragraph style={{ marginLeft: 8, marginBottom: 0 }}>
              Movement detected in the last hour
            </Paragraph>
          </Row>
        </InfoCard>
        
        <InfoCard color="#2196F3">
          <CardHeader>
            <H2 style={{ marginBottom: 0 }}>Quick Actions</H2>
            <IconContainer>
              <Ionicons name="flash" size={24} color="#2196F3" />
            </IconContainer>
          </CardHeader>
          
          <ActionsCardRow>
            <QuickActionButton 
              onPress={() => console.log('Finding cane')}
              style={{ marginBottom: 8, maxWidth: (windowWidth - 80) / 2 }}
            >
              <Ionicons name="locate" size={20} color="white" />
              <QuickActionButtonText>Find Cane</QuickActionButtonText>
            </QuickActionButton>
            
            <QuickActionButton 
              onPress={() => console.log('Calibrating')}
              style={{ marginBottom: 8, maxWidth: (windowWidth - 80) / 2 }}
            >
              <Ionicons name="options" size={20} color="white" />
              <QuickActionButtonText>Calibrate</QuickActionButtonText>
            </QuickActionButton>
          </ActionsCardRow>
          
          <ActionsCardRow>
            <QuickActionButton 
              onPress={() => navigation.navigate('Track')}
              style={{ marginBottom: 8, maxWidth: (windowWidth - 80) / 2 }}
            >
              <Ionicons name="map" size={20} color="white" />
              <QuickActionButtonText>Track</QuickActionButtonText>
            </QuickActionButton>
            
            <QuickActionButton 
              onPress={() => navigation.navigate('Notifications')}
              style={{ marginBottom: 8, maxWidth: (windowWidth - 80) / 2 }}
            >
              <Ionicons name="notifications" size={20} color="white" />
              <QuickActionButtonText>Alerts</QuickActionButtonText>
            </QuickActionButton>
          </ActionsCardRow>
        </InfoCard>
        
        <InfoCard color="#673AB7">
          <CardHeader>
            <H2 style={{ marginBottom: 0 }}>Recent Activity</H2>
            <IconContainer>
              <Ionicons name="time" size={24} color="#673AB7" />
            </IconContainer>
          </CardHeader>
          
          <View style={{ borderLeftWidth: 2, borderLeftColor: '#673AB7', paddingLeft: 12 }}>
            <View style={{ marginBottom: 16 }}>
              <Caption>Today, 10:30 AM</Caption>
              <Paragraph style={{ marginBottom: 4 }}>Device connected</Paragraph>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Caption>Today, 9:15 AM</Caption>
              <Paragraph style={{ marginBottom: 4 }}>Walking detected - 15 minutes</Paragraph>
            </View>
            
            <View style={{ marginBottom: 8 }}>
              <Caption>Today, 8:00 AM</Caption>
              <Paragraph style={{ marginBottom: 4 }}>Device activated</Paragraph>
            </View>
          </View>
          
          <PrimaryButton 
            onPress={() => console.log('View all activity')}
            style={{ backgroundColor: '#673AB7', marginTop: 12 }}
          >
            <ButtonText>View All Activity</ButtonText>
          </PrimaryButton>
        </InfoCard>
      </ScrollView>
    </Container>
  );
};

export default HomeScreen;
