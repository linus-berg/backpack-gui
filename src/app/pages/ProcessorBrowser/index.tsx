/**
 *
 * ModuleBrowser
 *
 */
import { Spinner, Tab, Tabs } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';
import { GetAllProcessors } from 'api/apc';
import React, { memo } from 'react';
import styled from 'styled-components/macro';
import { ProcessorPanel } from './ProcessorPanel';

interface Props {}

export const ProcessorBrowser = memo((props: Props) => {
  const query = useQuery(['processor_browser'], GetAllProcessors);

  if (query.isLoading) {
    return <Spinner />;
  }

  if (query.data === undefined) {
    return <Div>Oops</Div>;
  }

  return (
    <Div>
      <Tabs id="processor-tabs" renderActiveTabPanelOnly>
        {query?.data?.data.map((processor: string) => (
          <Tab
            key={processor}
            id={processor}
            title={processor}
            panel={<ProcessorPanel processor={processor} />}
          />
        ))}
      </Tabs>
    </Div>
  );
});

const Div = styled.div`
  padding: 1rem;
`;
