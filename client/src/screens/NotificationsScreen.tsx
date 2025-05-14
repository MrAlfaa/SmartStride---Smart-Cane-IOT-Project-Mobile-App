import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  H1, 
  Paragraph, 
  Card, 
  PrimaryButton, 
  ButtonText, 
  Row,
  Badge,
  BadgeText
} from '../components/common/StyledComponents';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '../services/notificationService';
import { useTheme } from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../styles/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const NotificationCard = styled(Card)<{ read: boolean }>`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  opacity: ${(props: { read: boolean }) => (props.read ? 0.7 : 1)};
  border-left-width: 4px;
  border-left-color: ${(props: { read: boolean; theme: Theme }) => 
    props.read ? props.theme.colors.disabled : props.theme.colors.error};
`;

const NotificationHeader = styled(Row)`
  justify-content: space-between;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const DateText = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.sm}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.xl}px;
`;

const EmptyText = styled.Text`
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
  color: ${(props: { theme: Theme }) => props.theme.colors.textSecondary};
  text-align: center;
  margin-top: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.lg}px;
`;

type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<ParamListBase>;
};

const NotificationsScreen = ({ navigation }: NotificationsScreenProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const fetchNotifications = async (pageNumber = 1, refresh = false) => {
    setError(null);
    try {
      if (refresh) setRefreshing(true);
      else if (pageNumber === 1) setLoading(true);
      
      const result = await getNotifications(pageNumber);
      
      if (pageNumber === 1) {
        setNotifications(result.data);
      } else {
        setNotifications(prev => [...prev, ...result.data]);
      }
      
      setHasMorePages(pageNumber < result.pagination.pages);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      // markAsRead now emits a notification change event internally
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      // markAllAsRead now emits a notification change event internally
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read.');
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleString();
    
    let iconName: 'information-circle' | 'warning' = 'information-circle';
    
    if (item.type === 'fall_detection') {
      iconName = 'warning';
    }
    
    return (
      <NotificationCard read={item.read} onPress={() => handleMarkAsRead(item._id)}>
        <NotificationHeader>
          <Row>
            <Ionicons 
              name={iconName} 
              size={24} 
              color={item.read ? theme.colors.textSecondary : theme.colors.error} 
              style={{ marginRight: 8 }}
            />
            {!item.read && (
              <Badge variant="error">
                <BadgeText>NEW</BadgeText>
              </Badge>
            )}
          </Row>
          <DateText>{formattedDate}</DateText>
        </NotificationHeader>
        <Paragraph>{item.message}</Paragraph>
      </NotificationCard>
    );
  };

  const handleRefresh = () => {
    fetchNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (hasMorePages && !loading && !refreshing) {
      fetchNotifications(page + 1);
    }
  };

  if (loading && !refreshing) {
    return (
      <Container>
        <H1>Notifications</H1>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </Container>
    );
  }

  return (
    <Container>
      <HeaderContainer>
        <H1>Notifications</H1>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Paragraph style={{ color: theme.colors.primary }}>Mark all as read</Paragraph>
          </TouchableOpacity>
        )}
      </HeaderContainer>
      
      {error ? (
        <EmptyContainer>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <EmptyText>{error}</EmptyText>
          <TouchableOpacity 
            style={{ marginTop: 16 }}
            onPress={() => fetchNotifications()}
          >
            <Paragraph style={{ color: theme.colors.primary }}>Try Again</Paragraph>
          </TouchableOpacity>
        </EmptyContainer>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item._id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyContainer>
              <Ionicons name="notifications-off" size={48} color={theme.colors.disabled} />
              <EmptyText>No notifications yet</EmptyText>
            </EmptyContainer>
          }
        />
      )}
    </Container>
  );
};

export default NotificationsScreen;