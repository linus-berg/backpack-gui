import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { QueueStatusTable } from '../../components/QueueStatusTable/Loadable';

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: auto;
`;
export function StatusPage() {
  return (
    <>
      <Helmet>
        <title>StatusPage</title>
        <meta name="description" content="A Boilerplate application homepage" />
      </Helmet>
      <PageGrid>
        <QueueStatusTable />
      </PageGrid>
    </>
  );
}
