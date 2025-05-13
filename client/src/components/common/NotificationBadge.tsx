import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { NotificationBadge as Badge, NotificationBadgeText } from './StyledComponents';

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
  
  // Simulate getting notification count - replace with actual implementation
  useEffect(() => {
    // This would be your actual notification counting logic
    const randomCount = Math.floor(Math.random() * 5);
    setCount(randomCount);
    
    // Set up a notification listener
    return () => {
      // Clean up notification listener
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