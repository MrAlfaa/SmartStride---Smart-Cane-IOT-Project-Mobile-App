import styled from 'styled-components/native';
import { Theme } from '../../styles/theme';

// Typography
export const H1 = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.xxxl}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

export const H2 = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.xxl}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

export const H3 = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.xl}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

export const Paragraph = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  line-height: 24px;
`;

export const Caption = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

// Layout
export const Card = styled.View`
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 2;
`;

export const CardHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Column = styled.View`
  flex-direction: column;
`;

export const Divider = styled.View`
  height: 1px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
  margin-vertical: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

// Buttons
export const PrimaryButton = styled.TouchableOpacity`
  background-color: ${(props: { theme: Theme }) => props.theme.colors.primary};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  align-items: center;
  justify-content: center;
  margin-vertical: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

export const SecondaryButton = styled.TouchableOpacity`
  background-color: transparent;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  align-items: center;
  justify-content: center;
  margin-vertical: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${(props: { theme: Theme }) => props.theme.colors.primary};
`;

export const IconButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${(props: { theme: Theme; secondary?: boolean }) => 
    props.secondary ? 'transparent' : props.theme.colors.primary + '20'};
`;

export const ButtonText = styled.Text`
  color: white;
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.medium};
`;

export const SecondaryButtonText = styled.Text`
  color: ${(props: { theme: Theme }) => props.theme.colors.primary};
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.medium};
`;

// Inputs
export const TextInput = styled.TextInput`
  border-width: 1px;
  border-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.small}px;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  width: 100%;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

// Status indicators
export const Badge = styled.View<{ variant?: 'success' | 'warning' | 'error' | 'info' }>`
  background-color: ${(props: { theme: Theme; variant?: 'success' | 'warning' | 'error' | 'info' }) => {
    switch (props.variant) {
      case 'success':
        return props.theme.colors.success;
      case 'warning':
        return props.theme.colors.warning;
      case 'error':
        return props.theme.colors.error;
      case 'info':
      default:
        return props.theme.colors.info;
    }
  }};
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.round}px;
  padding-horizontal: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
  padding-vertical: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
  align-self: flex-start;
`;

export const BadgeText = styled.Text`
  color: white;
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.medium};
`;

// List items
export const ListItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
`;

export const ListItemText = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.text};
  flex: 1;
`;

export const Avatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.primary}30;
  justify-content: center;
  align-items: center;
  margin-right: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

// Animation containers
export const AnimatedCard = styled(Card)`
  transform: scale(1);
`;

// Additional components for the dashboard
export const StatCard = styled.View`
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.medium}px;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  min-height: 100px;
  margin: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 1;
  flex: 1;
`;

export const StatValue = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.xl}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
  color: ${(props: { theme: Theme }) => props.theme.colors.primary};
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
`;

export const StatLabel = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
  text-align: center;
`;

// Notification related components
export const NotificationBadge = styled.View`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.error};
  border-radius: ${(props: { theme: Theme }) => props.theme.borderRadius.round}px;
  min-width: 18px;
  height: 18px;
  justify-content: center;
  align-items: center;
  padding-horizontal: 2px;
`;

export const NotificationBadgeText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.bold};
`;
