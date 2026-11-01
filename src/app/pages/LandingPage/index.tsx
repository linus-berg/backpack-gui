import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Page } from 'app/components/common/PageHeader';
import { ErrorBoundary } from 'app/components/common/ErrorBoundary';
import { NewsFeed } from './components/NewsFeed';
import { OverviewStats } from './components/OverviewStats';
import { RecentProblems } from './components/RecentProblems';
import { WelcomeHeader } from './components/WelcomeHeader';

const Content = styled(Page)`
  gap: 16px;
  max-width: 1320px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 24px;

  /* The page scrolls as a whole; sections keep their natural height (the
     header's overflow: hidden would otherwise let it shrink to nothing). */
  > * {
    flex-shrink: 0;
  }
`;

/* Announcements and warnings side by side. */
const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
`;

export const LandingPage = () => (
  <>
    <Helmet>
      <title>Home</title>
    </Helmet>
    <Content>
      <WelcomeHeader />
      <ErrorBoundary>
        <OverviewStats />
      </ErrorBoundary>
      <Columns>
        <ErrorBoundary>
          <NewsFeed />
        </ErrorBoundary>
        <ErrorBoundary>
          <RecentProblems />
        </ErrorBoundary>
      </Columns>
    </Content>
  </>
);
