import React, { useState } from 'react';
import { ScrollView, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { H1, Card } from '../components/common/StyledComponents';
import HistoricalDataView from '../components/HistoricalDataView';
import DateRangeFilter from '../components/DateRangeFilter';
import { Theme } from '../styles/theme';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${(props: { theme: Theme }) => props.theme.colors.background};
`;

const ScrollContainer = styled(ScrollView)`
  flex: 1;
  padding: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
`;

const Header = styled(Card)`
  margin-bottom: ${(props: { theme: Theme }) => props.theme.spacing.md}px;
  align-items: center;
`;

const ReportScreen: React.FC = () => {
  const [filteredData, setFilteredData] = useState<any[] | null>(null);

  const handleDataFetched = (data: any[]) => {
    setFilteredData(data);
  };

  return (
    <Container>
      <ScrollContainer>
        <Header>
          <H1>SmartStride Reports</H1>
        </Header>

        <DateRangeFilter onDataFetched={handleDataFetched} />

        {filteredData ? (
          // If we have filtered data from the date range filter
          <HistoricalDataView initialData={filteredData} />
        ) : (
          // Default historical data view
          <HistoricalDataView />
        )}
      </ScrollContainer>
    </Container>
  );
};

export default ReportScreen;