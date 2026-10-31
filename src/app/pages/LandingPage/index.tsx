import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Page } from 'app/components/common/PageHeader';
import { ErrorBoundary } from 'app/components/common/ErrorBoundary';
import { LandingDescription } from './components/LandingDescription';
import { NewsFeed } from './components/NewsFeed';
import { OverviewStats } from './components/OverviewStats';
import { ProcessorOverview } from './components/ProcessorOverview';
import { RecentProblems } from './components/RecentProblems';

const Content = styled(Page)`
  gap: 20px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;

  @media (max-width: 1000px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const LandingPage = () => (
  <>
    <Helmet>
      <title>Home</title>
    </Helmet>
    <Content>
      <LandingDescription />
      <ErrorBoundary>
        <OverviewStats />
      </ErrorBoundary>
      <Columns>
        <Stack>
          <ErrorBoundary>
            <ProcessorOverview />
          </ErrorBoundary>
          <ErrorBoundary>
            <RecentProblems />
          </ErrorBoundary>
        </Stack>
        <ErrorBoundary>
          <NewsFeed />
        </ErrorBoundary>
      </Columns>
    </Content>
  </>
);
