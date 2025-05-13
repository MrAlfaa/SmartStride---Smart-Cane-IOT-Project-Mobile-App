import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TrackScreen from '../screens/TrackScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationBadge from '../components/common/NotificationBadge';
import { useTheme } from 'styled-components/native';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const theme = useTheme();

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
    // Navigate to notifications screen or show notifications modal
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Track') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
          headerRight: () => (
            <NotificationBadge 
              onPress={handleNotificationPress} 
              color={theme.colors.primary}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Track" component={TrackScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;