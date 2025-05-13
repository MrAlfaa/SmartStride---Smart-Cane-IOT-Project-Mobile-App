import React from 'react';
import { ScrollView, Switch } from 'react-native';
import styled from 'styled-components/native';
import { H1, Paragraph, Card, SecondaryButton, SecondaryButtonText } from '../components/common/StyledComponents';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../styles/theme';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const SettingCard = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const SettingRow = styled.View<{isLast?: boolean}>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  border-bottom-width: ${(props: { isLast?: boolean; theme: Theme }) => (props.isLast ? 0 : 1)}px;
  border-bottom-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
`;

const SettingLabel = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
`;

const SettingDescription = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
  margin-top: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
`;

const SettingIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.primary}20;
  justify-content: center;
  align-items: center;
  margin-right: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const SettingContent = styled.View`
  flex: 1;
`;

const SettingRowInner = styled.View`
  flex-direction: row;
  align-items: center;
`;

const VersionText = styled.Text`
  text-align: center;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
  margin-top: ${(props: { theme: Theme }) => props.theme.spacing.xl}px;
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
`;

const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [locationTracking, setLocationTracking] = React.useState(true);
  const [batterySaver, setBatterySaver] = React.useState(false);
  
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <H1>Settings</H1>
        <Paragraph>
          Configure your SmartStride cane and application preferences.
        </Paragraph>
        
        <SettingCard>
          <SettingRow>
            <SettingRowInner>
              <SettingIcon>
                <Ionicons name="notifications" size={24} color="#2196F3" />
              </SettingIcon>
              <SettingContent>
                <SettingLabel>Notifications</SettingLabel>
                <SettingDescription>
                  Receive alerts about battery level and obstacles
                </SettingDescription>
              </SettingContent>
            </SettingRowInner>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: "#2196F3" }}
              thumbColor={notifications ? "#ffffff" : "#f4f3f4"}
            />
          </SettingRow>
          
          <SettingRow>
            <SettingRowInner>
              <SettingIcon>
                <Ionicons name="location" size={24} color="#2196F3" />
              </SettingIcon>
              <SettingContent>
                <SettingLabel>Location Tracking</SettingLabel>
                <SettingDescription>
                  Enable real-time location monitoring
                </SettingDescription>
              </SettingContent>
            </SettingRowInner>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: "#767577", true: "#2196F3" }}
              thumbColor={locationTracking ? "#ffffff" : "#f4f3f4"}
            />
          </SettingRow>
          
          <SettingRow isLast={true}>
            <SettingRowInner>
              <SettingIcon>
                <Ionicons name="battery-half" size={24} color="#2196F3" />
              </SettingIcon>
              <SettingContent>
                <SettingLabel>Battery Saver</SettingLabel>
                <SettingDescription>
                  Reduce functionality to extend battery life
                </SettingDescription>
              </SettingContent>
            </SettingRowInner>
            <Switch
              value={batterySaver}
              onValueChange={setBatterySaver}
              trackColor={{ false: "#767577", true: "#2196F3" }}
              thumbColor={batterySaver ? "#ffffff" : "#f4f3f4"}
            />
          </SettingRow>
        </SettingCard>
        
        <SettingCard>
          <SettingRow>
            <SettingRowInner>
              <SettingIcon>
                <Ionicons name="sync" size={24} color="#2196F3" />
              </SettingIcon>
              <SettingContent>
                <SettingLabel>Calibrate Sensors</SettingLabel>
                <SettingDescription>
                  Reset and calibrate device sensors
                </SettingDescription>
              </SettingContent>
            </SettingRowInner>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </SettingRow>
          
          <SettingRow isLast={true}>
            <SettingRowInner>
              <SettingIcon>
                <Ionicons name="information-circle" size={24} color="#2196F3" />
              </SettingIcon>
              <SettingContent>
                <SettingLabel>About Device</SettingLabel>
                <SettingDescription>
                  View device information and serial number
                </SettingDescription>
              </SettingContent>
            </SettingRowInner>
            <Ionicons name="chevron-forward" size={20} color="#757575" />
          </SettingRow>
        </SettingCard>
        
        <SecondaryButton onPress={() => console.log('Support pressed')}>
          <SecondaryButtonText>Contact Support</SecondaryButtonText>
        </SecondaryButton>
        
        <VersionText>SmartStride v1.0.0</VersionText>
      </ScrollView>
    </Container>
  );
};

export default SettingsScreen;