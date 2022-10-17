/**
 *
 * ModuleBrowser
 *
 */
import { Button, Spinner, Tab, Tabs } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';
import { GetAllModules } from 'api/apc';
import { ArtifactTable } from 'app/components/ArtifactTable';
import React, { memo } from 'react';
import styled from 'styled-components/macro';

interface Props {}

export const ModuleBrowser = memo((props: Props) => {
  const query = useQuery(['module_browser'], GetAllModules);

  if (query.isLoading) {
    return <Spinner />;
  }

  if (query.data === undefined) {
    return <Div>Oops</Div>;
  }

  const GetPanel = (artifact_module: string) => {
    return <ArtifactTable module={artifact_module} />;
  };

  return (
    <Div>
      <Tabs id="module-tabs">
        {query?.data?.data.map((artifact_module: string) => (
          <Tab
            key={artifact_module}
            id={artifact_module}
            title={artifact_module}
            panel={GetPanel(artifact_module)}
          />
        ))}
      </Tabs>
    </Div>
  );
});

const Div = styled.div`
  padding: 1rem;
`;
