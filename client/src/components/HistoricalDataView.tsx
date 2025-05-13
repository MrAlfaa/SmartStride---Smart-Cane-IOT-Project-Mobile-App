import React, { useState, useEffect } from 'react';
import { FlatList, ActivityIndicator, View, Text } from 'react-native';
import { getHistoricalData } from '../services/deviceDataService';
import { Card, H2, Paragraph, PrimaryButton } from './common/StyledComponents';
import styled from 'styled-components/native';
import { Theme } from '../styles/theme';

const Container = styled.View`
  flex: 1;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const DataCard = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const DateText = styled(Paragraph)`
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.medium};
  color: ${(props: { theme: Theme }) => props.theme.colors.primary};
`;

const Separator = styled.View`
  height: 1px;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.disabled};
  margin-vertical: ${(props: { theme: Theme }) => props.theme.spacing.sm}px;
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

interface HistoricalDataProps {
  initialLimit?: number;
  initialData?: any[];
}

const HistoricalDataView: React.FC<HistoricalDataProps> = ({ 
  initialLimit = 10, 
  initialData = null 
}) => {
  const [data, setData] = useState<any[]>(initialData || []);
  const [loading, setLoading] = useState(initialData ? false : true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(initialLimit);

  const loadData = async () => {
    // Skip loading if we already have initialData
    if (initialData) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await getHistoricalData(page, limit);
      setData(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, [page, limit, initialData]);

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Format the timestamp for display
    const timestamp = new Date(item.location.timestamp).toLocaleString();
    
    return (
      <DataCard>
        <DateText>{timestamp}</DateText>
        <Separator />
        <Paragraph>
          Location: {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
        </Paragraph>
        <Paragraph>
          Sensors: Ultrasonic1: {item.sensors.ultrasonic1}, Ultrasonic2: {item.sensors.ultrasonic2}
        </Paragraph>
        <Paragraph>
          Fall Status: {item.status.fall}
        </Paragraph>
        <Paragraph>
          Orientation: Pitch: {item.orientation.pitch.toFixed(2)}°, Roll: {item.orientation.roll.toFixed(2)}°
        </Paragraph>
      </DataCard>
    );
  };

  if (loading && data.length === 0) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#2196F3" />
        <Paragraph>Loading historical data...</Paragraph>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <H2>Historical Device Data</H2>
      
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id || item.firebaseId}
        ListEmptyComponent={
          <Card>
            <Paragraph>No historical data available</Paragraph>
          </Card>
        }
      />
      
      {data.length > 0 && (
        <PaginationContainer>
          <PrimaryButton 
            onPress={prevPage} 
            disabled={page === 1}
            style={{ opacity: page === 1 ? 0.5 : 1 }}
          >
            <Text style={{ color: 'white' }}>Previous</Text>
          </PrimaryButton>
          
          <Paragraph>Page {page} of {totalPages}</Paragraph>
          
          <PrimaryButton 
            onPress={nextPage} 
            disabled={page === totalPages}
            style={{ opacity: page === totalPages ? 0.5 : 1 }}
          >
            <Text style={{ color: 'white' }}>Next</Text>
          </PrimaryButton>
        </PaginationContainer>
      )}
    </Container>
  );
};

export default HistoricalDataView;