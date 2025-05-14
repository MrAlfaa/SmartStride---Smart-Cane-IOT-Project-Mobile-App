import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import styled from 'styled-components/native';
import { H1, H2, Paragraph, Card, PrimaryButton, ButtonText } from '../components/common/StyledComponents';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../styles/theme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { subscribeToDeviceData, getLatestReading } from '../services/deviceDataService';
import { DeviceData } from '../types/deviceData';
import { isConnected } from '../config/firebase';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const MapContainer = styled.View`
  height: 250px;
  width: 100%;
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  overflow: hidden;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const LocationCard = styled(Card)`
  flex-direction: row;
  align-items: center;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const LocationDetails = styled.View`
  flex: 1;
  margin-left: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const LocationTitle = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.lg}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
`;

const LocationAddress = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1;
`;

// Default location (use a meaningful default, like a city center)
const DEFAULT_LATITUDE = 7.8731;  // Example: Colombo, Sri Lanka
const DEFAULT_LONGITUDE = 80.7718;

const TrackScreen = () => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [previousLocation, setPreviousLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Set offline mode if Firebase isn't connected
    if (!isConnected) {
      setOfflineMode(true);
      setError('Unable to connect to Firebase. Working in offline mode with demo data.');
    }

    // Load initial data
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const data = await getLatestReading();
        console.log('Initial data fetched:', data);
        
        setDeviceData(data);
      } catch (error) {
        console.error('Error fetching initial location data:', error);
        setError('Failed to load initial data. Working with demo data.');
        
        // Set default data in case of error
        setDeviceData({
          deviceId: 'demo-device',
          battery: 85,
          steps: 1234,
          distance: 1.5,
          location: {
            latitude: DEFAULT_LATITUDE,
            longitude: DEFAULT_LONGITUDE,
            timestamp: Date.now()
          },
          status: {
            connected: false,
            lastConnected: Date.now()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to real-time updates
    console.log('Setting up Firebase subscription...');
    const unsubscribe = subscribeToDeviceData((data) => {
      console.log('Real-time data update received:', data);
      
      // Store previous location before updating to new one
      if (deviceData && deviceData.location) {
        setPreviousLocation({
          latitude: deviceData.location.latitude || DEFAULT_LATITUDE,
          longitude: deviceData.location.longitude || DEFAULT_LONGITUDE
        });
      }
      
      setDeviceData(data);
    });

    return () => {
      // Cleanup subscription when component unmounts
      console.log('Cleaning up Firebase subscription');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Update map view when we get new location data
  useEffect(() => {
    if (deviceData && deviceData.location && mapRef.current) {
      // Use default values if coordinates are 0
      const latitude = deviceData.location.latitude || DEFAULT_LATITUDE;
      const longitude = deviceData.location.longitude || DEFAULT_LONGITUDE;
      
      console.log(`Animating map to: ${latitude}, ${longitude}`);
      
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }, 1000);
    }
  }, [deviceData]);

  const handleRefreshLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLatestReading();
      console.log('Refreshed location data:', data);
      
      if (data) {
        // Store previous location
        if (deviceData && deviceData.location) {
          setPreviousLocation({
            latitude: deviceData.location.latitude || DEFAULT_LATITUDE,
            longitude: deviceData.location.longitude || DEFAULT_LONGITUDE
          });
        }
        
        setDeviceData(data);
      }
    } catch (error) {
      console.error('Error refreshing location:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      // If timestamp is already a number (milliseconds), convert directly
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleString();
      }
      
      // If timestamp is a string in format "YYYY-MM-DD HH:MM:SS"
      if (typeof timestamp === 'string') {
        return timestamp; // It's already in a readable format
      }
      
      return 'Invalid timestamp';
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Error formatting time';
    }
  };

  // Check if location has valid coordinates
  const hasValidLocation = (location?: any) => {
    return location && 
           (location.latitude !== 0 || location.longitude !== 0) && 
           (location.latitude !== undefined && location.longitude !== undefined);
  };

  // Add this section to show offline mode warning
  const renderOfflineWarning = () => {
    if (offlineMode) {
      return (
        <Card style={{ backgroundColor: '#fff3e0', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="cloud-offline" size={24} color="#ff9800" style={{ marginRight: 8 }} />
            <Paragraph style={{ color: '#e65100', marginBottom: 0 }}>
              Working in offline mode with demo data
            </Paragraph>
          </View>
        </Card>
      );
    }
    return null;
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <H1>Track Location</H1>
        <Paragraph>
          Monitor the real-time location of your SmartStride cane.
        </Paragraph>
        
        {renderOfflineWarning()}
        
        {error && !offlineMode && (
          <Card style={{ backgroundColor: '#ffebee', marginBottom: 16 }}>
            <Paragraph style={{ color: '#d32f2f' }}>{error}</Paragraph>
          </Card>
        )}
        
        <MapContainer>
          {loading && (
            <LoadingContainer>
              <ActivityIndicator size="large" color="#2196F3" />
            </LoadingContainer>
          )}
          
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: (deviceData?.location?.latitude || DEFAULT_LATITUDE),
              longitude: (deviceData?.location?.longitude || DEFAULT_LONGITUDE),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            {deviceData?.location && (
              <Marker
                coordinate={{
                  latitude: (deviceData.location.latitude || DEFAULT_LATITUDE),
                  longitude: (deviceData.location.longitude || DEFAULT_LONGITUDE),
                }}
                title="Current Location"
                description="Your SmartStride cane is here"
              >
                <Ionicons name="location" size={32} color="#2196F3" />
              </Marker>
            )}
            
            {previousLocation && (
              <Marker
                coordinate={{
                  latitude: previousLocation.latitude,
                  longitude: previousLocation.longitude,
                }}
                title="Previous Location"
                opacity={0.7}
              >
                <Ionicons name="time" size={28} color="#757575" />
              </Marker>
            )}
          </MapView>
        </MapContainer>
        
        <H2>Last Known Locations</H2>
        
        {deviceData?.location ? (
          <LocationCard>
            <Ionicons name="location" size={32} color="#2196F3" />
            <LocationDetails>
              <LocationTitle>Current Location</LocationTitle>
              <LocationAddress>
                {hasValidLocation(deviceData.location) 
                  ? `${deviceData.location.latitude.toFixed(6)}, ${deviceData.location.longitude.toFixed(6)}`
                  : 'Waiting for valid location data'}
              </LocationAddress>
              <Paragraph>
                {deviceData.location.timestamp ? formatTimestamp(deviceData.location.timestamp) : 'Timestamp unavailable'}
              </Paragraph>
            </LocationDetails>
          </LocationCard>
        ) : (
          <LocationCard>
            <Ionicons name="location-outline" size={32} color="#757575" />
            <LocationDetails>
              <LocationTitle>Current Location</LocationTitle>
              <LocationAddress>No location data available</LocationAddress>
            </LocationDetails>
          </LocationCard>
        )}
        
        {previousLocation && hasValidLocation(previousLocation) && (
          <LocationCard>
            <Ionicons name="time" size={32} color="#757575" />
            <LocationDetails>
              <LocationTitle>Previous Location</LocationTitle>
              <LocationAddress>
                {previousLocation.latitude.toFixed(6)}, {previousLocation.longitude.toFixed(6)}
              </LocationAddress>
            </LocationDetails>
          </LocationCard>
        )}
        
        <PrimaryButton onPress={handleRefreshLocation} disabled={loading}>
          <ButtonText>{loading ? 'Loading...' : 'Refresh Location'}</ButtonText>
        </PrimaryButton>
        
        <Card style={{ marginTop: 24 }}>
          <H2>Connection Status</H2>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View 
              style={{ 
                width: 12, 
                height: 12, 
                borderRadius: 6, 
                backgroundColor: deviceData?.status?.connected ? '#4CAF50' : '#F44336',
                marginRight: 8
              }} 
            />
            <Paragraph style={{ marginBottom: 0 }}>
              {deviceData?.status?.connected 
                ? 'Connected to SmartStride cane' 
                : 'Not connected to SmartStride cane'}
            </Paragraph>
          </View>
        </Card>
      </ScrollView>
    </Container>
  );
};

export default TrackScreen;