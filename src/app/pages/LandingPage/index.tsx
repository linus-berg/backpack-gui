import React from 'react';
import styled from 'styled-components';
import { LandingDescription } from './components/LandingDescription';
import { NewsFeed } from './components/NewsFeed';

const Container = styled.div`
  padding: 30px;
  height: 100%;
  background-color: var(--page-bg);
  overflow: hidden;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
`;

export const LandingPage = () => {
  return (
    <Container>
      <ContentGrid>
        <LandingDescription />
        <NewsFeed />
      </ContentGrid>
    </Container>
  );
};
