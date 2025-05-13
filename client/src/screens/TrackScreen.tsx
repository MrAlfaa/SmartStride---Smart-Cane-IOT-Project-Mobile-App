import React from 'react';
import { View, ScrollView } from 'react-native';
import styled from 'styled-components/native';
import { H1, H2, Paragraph, Card, PrimaryButton, ButtonText } from '../components/common/StyledComponents';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../styles/theme';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const MapPlaceholder = styled.View`
  height: 250px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  justify-content: center;
  align-items: center;
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

const TrackScreen = () => {
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <H1>Track Location</H1>
        <Paragraph>
          Monitor the real-time location of your SmartStride cane.
        </Paragraph>
        
        <MapPlaceholder>
          <Ionicons name="map" size={48} color="#757575" />
          <Paragraph style={{ textAlign: 'center', marginTop: 8 }}>
            Map view will be displayed here
          </Paragraph>
        </MapPlaceholder>
        
        <H2>Last Known Locations</H2>
        
        <LocationCard>
          <Ionicons name="location" size={32} color="#2196F3" />
          <LocationDetails>
            <LocationTitle>Current Location</LocationTitle>
            <LocationAddress>123 Main Street, City</LocationAddress>
          </LocationDetails>
        </LocationCard>
        
        <LocationCard>
          <Ionicons name="time" size={32} color="#757575" />
          <LocationDetails>
            <LocationTitle>Previous Location</LocationTitle>
            <LocationAddress>456 Park Avenue, City</LocationAddress>
          </LocationDetails>
        </LocationCard>
        
        <PrimaryButton onPress={() => console.log('Refreshing location')}>
          <ButtonText>Refresh Location</ButtonText>
        </PrimaryButton>
      </ScrollView>
    </Container>
  );
};

export default TrackScreen;