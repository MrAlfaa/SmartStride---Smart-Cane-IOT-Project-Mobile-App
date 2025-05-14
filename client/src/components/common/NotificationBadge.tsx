import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { NotificationBadge as Badge, NotificationBadgeText } from './StyledComponents';
import { getUnreadCount, subscribeTofallDetection, subscribeToNotificationChanges } from '../../services/notificationService';

interface NotificationBadgeProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

const Container = styled.View`
  padding-horizontal: 16px;
  position: relative;
`;

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  onPress, 
  color = "#2196F3", 
  size = 24 
}) => {
  const [count, setCount] = useState<number>(0);
  
  // Get initial notification count and set up poller
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const unreadCount = await getUnreadCount();
        setCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notification count:', error);
        // Don't update count on error to avoid losing current count
      }
    };
    
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  // Subscribe to fall detection events
  useEffect(() => {
    const unsubscribe = subscribeTofallDetection((fallDetected) => {
      if (fallDetected) {
        // Increment notification count when fall is detected
        setCount(prevCount => prevCount + 1);
        
        // You could also trigger a sound or vibration here
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Subscribe to notification changes (read/unread status)
  useEffect(() => {
    const unsubscribe = subscribeToNotificationChanges(() => {
      // Refresh count whenever notifications change
      getUnreadCount().then(newCount => {
        setCount(newCount);
      }).catch(error => {
        console.error('Error updating badge after notification change:', error);
      });
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  return (
    <Container>
      <TouchableOpacity onPress={onPress}>
        <Ionicons name="notifications" size={size} color={color} />
        {count > 0 && (
          <Badge>
            <NotificationBadgeText>{count}</NotificationBadgeText>
          </Badge>
        )}
      </TouchableOpacity>
    </Container>
  );
};

export default NotificationBadge;