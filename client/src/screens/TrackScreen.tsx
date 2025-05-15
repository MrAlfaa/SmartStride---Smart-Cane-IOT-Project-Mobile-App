import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, ActivityIndicator, Dimensions, Alert, TouchableOpacity, Platform, StyleSheet,Text  } from 'react-native';
import styled from 'styled-components/native';
import { H1, H2, Paragraph, Card, PrimaryButton, ButtonText, IconButton, Row, Badge, BadgeText, Caption } from '../components/common/StyledComponents';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../styles/theme';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Circle, Callout, MapType } from 'react-native-maps';
import * as Location from 'expo-location';
import { subscribeToDeviceData, getLatestReading, getHistoricalData } from '../services/deviceDataService';
import { DeviceData, Location as DeviceLocation } from '../types/deviceData';
import { isConnected } from '../config/firebase';
import { useIsFocused } from '@react-navigation/native';
import { showPrompt } from '../components/common/AlertPrompt';


const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const MapContainer = styled.View`
  height: 350px;
  width: 100%;
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  overflow: hidden;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  position: relative;
`;

const MapControls = styled.View`
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 10;
  background-color: white;
  border-radius: 8px;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
`;

const MapControlButton = styled.TouchableOpacity`
  padding: 8px;
  border-bottom-width: ${(props: { isLast?: boolean }) => (props.isLast ? 0 : 1)}px;
  border-bottom-color: #eee;
  align-items: center;
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

const TabContainer = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

const Tab = styled.TouchableOpacity<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  margin-right: 8px;
  background-color: ${(props: { active: boolean; theme: Theme }) => 
    props.active ? props.theme.colors.primary : '#E0E0E0'};
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${(props: { active: boolean }) => (props.active ? 'white' : '#757575')};
  font-weight: ${(props: { active: boolean }) => (props.active ? 'bold' : 'normal')};
`;

const ButtonRow = styled.View`
  flex-direction: row;
  margin-top: 10px;
  justify-content: space-between;
`;

const HalfButton = styled(PrimaryButton)`
  flex: 0.48;
  padding: 8px;
`;

const LogPointButton = styled(IconButton)`
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
  background-color: white;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  elevation: 5;
`;

const MapTypeBar = styled.View`
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 10;
  background-color: white;
  border-radius: 20px;
  padding: 4px;
  flex-direction: row;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
  elevation: 5;
`;

const MapTypeButton = styled.TouchableOpacity<{ active: boolean }>`
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${(props: { active: boolean }) => 
    props.active ? '#2196F3' : 'transparent'};
`;

const MapTypeText = styled.Text<{ active: boolean }>`
  color: ${(props: { active: boolean }) => (props.active ? 'white' : '#757575')};
  font-size: 12px;
  font-weight: ${(props: { active: boolean }) => (props.active ? 'bold' : 'normal')};
`;

// Default location (use a meaningful default, like a city center)
const DEFAULT_LATITUDE = 7.8731;  // Example: Colombo, Sri Lanka
const DEFAULT_LONGITUDE = 80.7718;

type PathPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
  title?: string;
  description?: string;
};

const TrackScreen = ({ navigation, route }: any) => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [previousLocation, setPreviousLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [showPath, setShowPath] = useState(false);
  const [pathHistory, setPathHistory] = useState<PathPoint[]>([]);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [mapType, setMapType] = useState<MapType>('standard');
  const [savedLocations, setSavedLocations] = useState<PathPoint[]>([]);
  const [showSavedLocations, setShowSavedLocations] = useState(true);
  const mapRef = useRef<MapView>(null);
  const isFocused = useIsFocused();

  // Check for route params for initial location
  useEffect(() => {
    if (route.params?.initialLocation) {
      const { latitude, longitude } = route.params.initialLocation;
      if (latitude && longitude) {
        console.log('Setting initial location from route params:', route.params.initialLocation);
        
        // Animate to the location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }, 1000);
        }

        // If it's a fall detection, show an alert
        if (route.params?.isFall) {
          Alert.alert(
            "Fall Detected",
            "The map has been centered on the fall location.",
            [{ text: "OK" }]
          );
        }
      }
    }
  }, [route.params?.initialLocation]);

  useEffect(() => {
    // Get user's current location
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error('Error getting user location:', error);
      }
    })();

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

        // Fetch path history
        if (showPath) {
          fetchPathHistory();
        }
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

    // Subscribe to real-time updates when component is focused
    if (isFocused) {
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
        
        // Add to path history if we have a valid location
        if (data.location && data.location.latitude && data.location.longitude) {
          setPathHistory(prev => [...prev, {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            timestamp: typeof data.location.timestamp === 'number' 
              ? data.location.timestamp 
              : Date.now()
          }]);
        }
      });

      return () => {
        // Cleanup subscription when component unmounts or loses focus
        console.log('Cleaning up Firebase subscription');
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [isFocused, showPath]);

  // Fetch path history from the last 24 hours
  const fetchPathHistory = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // This assumes you have a method to fetch historical data by date range
      const result = await getHistoricalData(1, 100); // Get the last 100 readings
      
      if (result.data && result.data.length > 0) {
        const points: PathPoint[] = result.data
          .filter((item: any) => (
            item.location && item.location.latitude && item.location.longitude
          ))
          .map((item: any) => ({
            latitude: item.location.latitude,
            longitude: item.location.longitude,
            timestamp: new Date(item.createdAt).getTime()
          }));
        
        setPathHistory(points);
      }
    } catch (error) {
      console.error('Error fetching path history:', error);
    }
  };

  // Update map view when we get new location data
  useEffect(() => {
    if (deviceData && deviceData.location && mapRef.current && activeTab === 'current') {
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
  }, [deviceData, activeTab]);

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

  // Handle saving current location with a custom note
const handleSaveLocation = () => {
  if (!deviceData || !deviceData.location) {
    Alert.alert('Error', 'No valid device location available to save');
    return;
  }

  // Use the cross-platform showPrompt utility
  showPrompt(
    'Save Location',
    'Enter a note for this location',
    (note) => {
      const newSavedLocation: PathPoint = {
        latitude: deviceData.location.latitude,
        longitude: deviceData.location.longitude,
        timestamp: Date.now(),
        title: 'Saved Location',
        description: note || 'No description'
      };

      setSavedLocations(prev => [...prev, newSavedLocation]);
      Alert.alert('Success', 'Location saved successfully!');
    },
    'No description' // Default value
  );
};

  // Recenter map on the current device location
  const handleCenterOnDevice = () => {
    if (!deviceData || !deviceData.location) {
      Alert.alert('Error', 'No valid device location available');
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: deviceData.location.latitude,
      longitude: deviceData.location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    }, 1000);
  };

  // Center map on user's location
  const handleCenterOnUser = () => {
    if (!userLocation) {
      Alert.alert('Error', 'Your location is not available');
      return;
    }

    mapRef.current?.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    }, 1000);
  };

  // Show both device and user on map
  const handleShowBoth = () => {
    if (!userLocation || !deviceData?.location) {
      Alert.alert('Error', 'Both locations are not available');
      return;
    }

    const points = [
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: deviceData.location.latitude, longitude: deviceData.location.longitude }
    ];

    // Calculate bounds to fit both points
    const minLat = Math.min(userLocation.latitude, deviceData.location.latitude);
    const maxLat = Math.max(userLocation.latitude, deviceData.location.latitude);
    const minLng = Math.min(userLocation.longitude, deviceData.location.longitude);
    const maxLng = Math.max(userLocation.longitude, deviceData.location.longitude);

    // Add padding
    const PADDING = 0.02;
    mapRef.current?.animateToRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + PADDING,
      longitudeDelta: (maxLng - minLng) + PADDING
    }, 1000);
  };

  // Calculate distance between user and device
  const calculateDistance = () => {
    if (!userLocation || !deviceData?.location) {
      return null;
    }

    // Haversine formula to calculate distance
    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    
    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = deviceData.location.latitude;
    const lon2 = deviceData.location.longitude;
    
    const R = 6371; // Radius of earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(2);
  };

  // Toggle path visibility
  const togglePath = () => {
    const newState = !showPath;
    setShowPath(newState);
    
    if (newState && pathHistory.length === 0) {
      fetchPathHistory();
    }
  };

  // Clear the path history
  const clearPath = () => {
    Alert.alert(
      'Clear Path History',
      'Are you sure you want to clear the path history?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setPathHistory([])
        }
      ]
    );
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

        <TabContainer>
          <Tab active={activeTab === 'current'} onPress={() => setActiveTab('current')}>
            <TabText active={activeTab === 'current'}>Current</TabText>
          </Tab>
          <Tab active={activeTab === 'history'} onPress={() => setActiveTab('history')}>
            <TabText active={activeTab === 'history'}>Path History</TabText>
          </Tab>
        </TabContainer>
        
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
            mapType={mapType}
            initialRegion={{
              latitude: (deviceData?.location?.latitude || DEFAULT_LATITUDE),
              longitude: (deviceData?.location?.longitude || DEFAULT_LONGITUDE),
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            toolbarEnabled={true}
          >
            {deviceData?.location && (
              <Marker
  coordinate={{
    latitude: (deviceData.location.latitude || DEFAULT_LATITUDE),
    longitude: (deviceData.location.longitude || DEFAULT_LONGITUDE),
  }}
  title="Current Location"
>
  <Ionicons name="locate" size={32} color="#2196F3" />
  <Callout>
    <View style={{ width: 200, padding: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>SmartStride Cane</Text>
      <Text>Your SmartStride cane is here</Text>
      <Text>Last updated: {formatTimestamp(deviceData.location.timestamp)}</Text>
      <Text>Battery: {deviceData.battery}%</Text>
      {userLocation && (
        <Text>Distance from you: {calculateDistance()} km</Text>
      )}
    </View>
  </Callout>
</Marker>
            )}
            
            {/* Previous location marker */}
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
  <Callout>
    <View style={{ padding: 10 }}>
      <Text>Previous location of your device</Text>
    </View>
  </Callout>
</Marker>
            )}

            {/* User location with surrounding circle */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={100}
                strokeWidth={1}
                strokeColor="rgba(33, 150, 243, 0.5)"
                fillColor="rgba(33, 150, 243, 0.1)"
              />
            )}

            {/* Path line connecting points */}
            {showPath && pathHistory.length > 1 && (
              <Polyline
                coordinates={pathHistory}
                strokeColor="#2196F3"
                strokeWidth={4}
                lineDashPattern={[1]}
              />
            )}

            {/* Path history points */}
            {showPath && pathHistory.map((point, index) => (
              <Marker
  key={`path-${index}`}
  coordinate={{
    latitude: point.latitude,
    longitude: point.longitude,
  }}
  opacity={0.4}
  anchor={{ x: 0.5, y: 0.5 }}
  // Remove any implicit title/description that might be coming from the point
  title={undefined}
  description={undefined}
>
  <View style={{ 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#2196F3' 
  }} />
  {/* If you want to show information for these points, use an explicit Callout with Text components */}
  {(point.title || point.description) && (
    <Callout>
      <View style={{ padding: 8 }}>
        {point.title && <Text style={{ fontWeight: 'bold' }}>{point.title}</Text>}
        {point.description && <Text>{point.description}</Text>}
        <Text>Time: {formatTimestamp(point.timestamp)}</Text>
      </View>
    </Callout>
  )}
</Marker>
            ))}

            {/* Saved location markers */}
            {showSavedLocations && savedLocations.map((location, index) => (
              <Marker
  key={`saved-${index}`}
  coordinate={{
    latitude: location.latitude,
    longitude: location.longitude,
  }}
>
  <Ionicons name="bookmark" size={28} color="#4CAF50" />
  <Callout>
    <View style={{ padding: 10 }}>
      <Text style={{ fontWeight: 'bold' }}>{location.title || 'Saved Location'}</Text>
      <Text>{location.description || 'No description'}</Text>
      <Text>{formatTimestamp(location.timestamp)}</Text>
    </View>
  </Callout>
</Marker>
            ))}

            {/* Show a line between user and device if both exist */}
            {userLocation && deviceData?.location && (
              <Polyline
                coordinates={[
                  userLocation,
                  {
                    latitude: deviceData.location.latitude,
                    longitude: deviceData.location.longitude
                  }
                ]}
                strokeColor="#FF9800"
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>

          {/* Map controls */}
          <MapControls>
            <MapControlButton onPress={handleCenterOnDevice}>
              <Ionicons name="locate" size={24} color="#2196F3" />
            </MapControlButton>
            <MapControlButton onPress={handleCenterOnUser}>
              <Ionicons name="person" size={24} color="#4CAF50" />
            </MapControlButton>
            <MapControlButton onPress={handleShowBoth}>
              <Ionicons name="git-compare" size={24} color="#FF9800" />
            </MapControlButton>
            <MapControlButton isLast>
              <Ionicons 
                name={showPath ? "footsteps" : "footsteps-outline"} 
                size={24} 
                color={showPath ? "#2196F3" : "#757575"} 
                onPress={togglePath}
              />
            </MapControlButton>
          </MapControls>

          {/* Map type selector */}
          <MapTypeBar>
            <MapTypeButton active={mapType === 'standard'} onPress={() => setMapType('standard')}>
              <MapTypeText active={mapType === 'standard'}>Standard</MapTypeText>
            </MapTypeButton>
            <MapTypeButton active={mapType === 'satellite'} onPress={() => setMapType('satellite')}>
              <MapTypeText active={mapType === 'satellite'}>Satellite</MapTypeText>
            </MapTypeButton>
            <MapTypeButton active={mapType === 'hybrid'} onPress={() => setMapType('hybrid')}>
              <MapTypeText active={mapType === 'hybrid'}>Hybrid</MapTypeText>
            </MapTypeButton>
          </MapTypeBar>

          {/* Save location button */}
          <LogPointButton onPress={handleSaveLocation}>
            <Ionicons name="bookmark" size={24} color="#4CAF50" />
          </LogPointButton>
        </MapContainer>
        
        {/* Display distance between user and device */}
        {userLocation && deviceData?.location && (
          <Card style={{ marginBottom: 16, backgroundColor: '#E3F2FD' }}>
            <Row>
              <Ionicons name="git-compare" size={24} color="#1976D2" style={{ marginRight: 8 }} />
              <View>
                <H2 style={{ marginBottom: 4 }}>Distance Information</H2>
                <Paragraph style={{ marginBottom: 0 }}>
                  Your device is approximately {calculateDistance()} km away from you
                </Paragraph>
              </View>
            </Row>
          </Card>
        )}

        {/* Map actions */}
        <ButtonRow>
          <HalfButton onPress={handleRefreshLocation} disabled={loading}>
            <Row>
              <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 4 }} />
              <ButtonText>{loading ? 'Loading...' : 'Refresh'}</ButtonText>
            </Row>
          </HalfButton>
          
                    <HalfButton 
            onPress={togglePath}
            style={{ backgroundColor: showPath ? '#FF9800' : undefined }}
          >
            <Row>
              <Ionicons 
                name={showPath ? "footsteps" : "footsteps-outline"} 
                size={20} 
                color="white" 
                style={{ marginRight: 4 }} 
              />
              <ButtonText>{showPath ? 'Hide Path' : 'Show Path'}</ButtonText>
            </Row>
          </HalfButton>
        </ButtonRow>

        {showPath && pathHistory.length > 0 && (
          <PrimaryButton 
            onPress={clearPath} 
            style={{ marginTop: 8, backgroundColor: '#F44336' }}
          >
            <Row>
              <Ionicons name="trash" size={20} color="white" style={{ marginRight: 4 }} />
              <ButtonText>Clear Path History</ButtonText>
            </Row>
          </PrimaryButton>
        )}
        
        <H2 style={{ marginTop: 24 }}>Last Known Locations</H2>
        
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

        {/* User's current location card */}
        {userLocation && (
          <LocationCard style={{ borderLeftColor: '#4CAF50', borderLeftWidth: 4 }}>
            <Ionicons name="person" size={32} color="#4CAF50" />
            <LocationDetails>
              <LocationTitle>Your Location</LocationTitle>
              <LocationAddress>
                {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
              </LocationAddress>
            </LocationDetails>
          </LocationCard>
        )}
        
        {/* Saved locations list */}
        {savedLocations.length > 0 && (
          <>
            <H2 style={{ marginTop: 16 }}>Saved Locations</H2>
            {savedLocations.map((location, index) => (
              <LocationCard key={`saved-card-${index}`} style={{ borderLeftColor: '#4CAF50', borderLeftWidth: 4 }}>
                <Ionicons name="bookmark" size={32} color="#4CAF50" />
                <LocationDetails>
                  <LocationTitle>{location.title || 'Saved Location'}</LocationTitle>
                  <LocationAddress>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </LocationAddress>
                  <Paragraph>{location.description || 'No description'}</Paragraph>
                  <Caption>{formatTimestamp(location.timestamp)}</Caption>
                </LocationDetails>
              </LocationCard>
            ))}
            
            <PrimaryButton 
              onPress={() => setShowSavedLocations(!showSavedLocations)}
              style={{ marginTop: 8 }}
            >
              <Row>
                <Ionicons 
                  name={showSavedLocations ? "eye-off" : "eye"} 
                  size={20} 
                  color="white" 
                  style={{ marginRight: 4 }} 
                />
                <ButtonText>
                  {showSavedLocations ? 'Hide Saved Locations' : 'Show Saved Locations'}
                </ButtonText>
              </Row>
            </PrimaryButton>
          </>
        )}
        
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
          
          {deviceData?.battery && (
            <View style={{ marginTop: 8 }}>
              <Paragraph style={{ marginBottom: 4 }}>Battery: {deviceData.battery}%</Paragraph>
              <View style={{ 
                height: 8, 
                width: '100%', 
                backgroundColor: '#E0E0E0', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <View style={{ 
                  height: '100%', 
                  width: `${deviceData.battery}%`, 
                  backgroundColor: getBatteryColor(deviceData.battery),
                  borderRadius: 4 
                }} />
              </View>
            </View>
          )}
        </Card>

        {/* Map settings card */}
        <Card style={{ marginTop: 16 }}>
          <H2>Map Settings</H2>
          
          <View style={{ marginTop: 8 }}>
            <Paragraph style={{ marginBottom: 4 }}>Map Type</Paragraph>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: mapType === 'standard' ? '#E3F2FD' : 'transparent',
                  borderRadius: 4,
                  borderWidth: mapType === 'standard' ? 1 : 0,
                  borderColor: '#2196F3',
                  flex: 1,
                  marginRight: 4,
                  alignItems: 'center'
                }}
                onPress={() => setMapType('standard')}
              >
                <Caption>Standard</Caption>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: mapType === 'satellite' ? '#E3F2FD' : 'transparent',
                  borderRadius: 4,
                  borderWidth: mapType === 'satellite' ? 1 : 0,
                  borderColor: '#2196F3',
                  flex: 1,
                  marginRight: 4,
                  alignItems: 'center'
                }}
                onPress={() => setMapType('satellite')}
              >
                <Caption>Satellite</Caption>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: mapType === 'hybrid' ? '#E3F2FD' : 'transparent',
                  borderRadius: 4,
                  borderWidth: mapType === 'hybrid' ? 1 : 0,
                  borderColor: '#2196F3',
                  flex: 1,
                  alignItems: 'center'
                }}
                onPress={() => setMapType('hybrid')}
              >
                <Caption>Hybrid</Caption>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Help section */}
        <Card style={{ marginTop: 16, backgroundColor: '#E8F5E9', marginBottom: 24 }}>
          <H2>Tips</H2>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" style={{ marginRight: 8 }} />
            <Paragraph style={{ flex: 1, marginBottom: 0 }}>
              Tap the <Ionicons name="bookmark" size={16} color="#4CAF50" /> button to save a location
            </Paragraph>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" style={{ marginRight: 8 }} />
            <Paragraph style={{ flex: 1, marginBottom: 0 }}>
              Use the <Ionicons name="footsteps" size={16} color="#2196F3" /> button to show path history
            </Paragraph>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" style={{ marginRight: 8 }} />
            <Paragraph style={{ flex: 1, marginBottom: 0 }}>
              The <Ionicons name="git-compare" size={16} color="#FF9800" /> button shows both you and the device on map
            </Paragraph>
          </View>
        </Card>
      </ScrollView>
    </Container>
  );
};

// Helper function to get battery color based on level
const getBatteryColor = (level: number) => {
  if (level > 60) return '#4CAF50';
  if (level > 30) return '#FF9800';
  return '#F44336';
};

export default TrackScreen;
