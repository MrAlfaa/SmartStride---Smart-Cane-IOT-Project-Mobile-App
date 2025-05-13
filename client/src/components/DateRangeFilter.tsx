import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDataByDateRange } from '../services/deviceDataService';
import { Card, H2, Paragraph, PrimaryButton, Row } from './common/StyledComponents';
import styled from 'styled-components/native';
import { Theme } from '../styles/theme';


const Container = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const Label = styled(Paragraph)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.xs}px;
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeights.medium};
`;

const ButtonText = styled.Text`
  color: white;
  font-size: ${(props: { theme: Theme }) => props.theme.fontSizes.md}px;
`;

interface DateRangeFilterProps {
  onDataFetched: (data: any[]) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onDataFetched }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async () => {
    try {
      setLoading(true);
      // Format dates to ISO string for API request
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      
      const data = await getDataByDateRange(formattedStartDate, formattedEndDate);
      onDataFetched(data);
    } catch (error) {
      console.error('Error fetching data by date range:', error);
    } finally {
      setLoading(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <Container>
      <H2>Filter by Date Range</H2>
      
      <View>
        <Label>Start Date:</Label>
        <PrimaryButton onPress={() => setShowStartPicker(true)}>
          <ButtonText>{startDate.toLocaleDateString()}</ButtonText>
        </PrimaryButton>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}
      </View>
      
      <View style={{ marginTop: 16 }}>
        <Label>End Date:</Label>
        <PrimaryButton onPress={() => setShowEndPicker(true)}>
          <ButtonText>{endDate.toLocaleDateString()}</ButtonText>
        </PrimaryButton>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </View>
      
      <PrimaryButton 
        onPress={handleFetchData} 
        style={{ marginTop: 24 }}
        disabled={loading}
      >
        <ButtonText>{loading ? 'Loading...' : 'Apply Filter'}</ButtonText>
      </PrimaryButton>
    </Container>
  );
};

export default DateRangeFilter;