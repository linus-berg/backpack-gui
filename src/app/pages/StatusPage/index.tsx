import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { QueueStatusTable } from '../../components/QueueStatusTable/Loadable';
import { EventFeed } from '../../components/EventFeed/Loadable';
import { H3, Icon } from '@blueprintjs/core';

const PageGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  padding: 1rem;
  align-items: flex-start;
`;

export function StatusPage() {
  return (
    <>
      <Helmet>
        <title>Status</title>
        <meta name="description" content="Backpack system status and events" />
      </Helmet>
      <PageGrid>
        <div style={{ flex: 1 }}>
          <H3>
            <Icon icon="pulse" style={{ marginRight: '10px' }} />
            Queue Status
          </H3>
          <QueueStatusTable />
        </div>
        <div style={{ flex: 1 }}>
          <H3>
            <Icon icon="history" style={{ marginRight: '10px' }} />
            System Events
          </H3>
          <EventFeed />
        </div>
      </PageGrid>
    </>
  );
}
