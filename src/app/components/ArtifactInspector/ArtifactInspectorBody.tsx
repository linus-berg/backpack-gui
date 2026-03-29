/**
 *
 * Inspection Drawer
 *
 */
import { Spinner, Tag, Tabs, Tab, H5, Card, Elevation, Icon, Intent } from '@blueprintjs/core';
import React, { memo, useState } from 'react';
import { Artifact } from 'types';
import { ArtifactDependencies } from './ArtifactDependencies';
import { ArtifactVersions } from './ArtifactVersions';
import { useBackpackApi } from 'api/backpack';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';

interface Props {
  artifact: Artifact | null;
}

const StatCard = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background-color: var(--card-bg);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #abb3bf;
  letter-spacing: 0.5px;
`;

const MetadataRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

export const ArtifactInspectorBody = memo((props: Props) => {
  const backpack = useBackpackApi();
  const [activeTab, setActiveTab] = useState<string>('versions');

  const query = useQuery(
    ['get-artifact', props.artifact?.processor, props.artifact?.id],
    backpack.GetArtifact,
    {
      enabled: props.artifact !== null,
    },
  );

  if (query.isLoading || !query.data || props.artifact === null) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <Spinner size={50} />
      </div>
    );
  }

  const artifact: Artifact = query.data.data;
  const versionCount = Object.keys(artifact.versions || {}).length;
  const depCount = artifact.dependencies?.length || 0;

  return (
    <div style={{ padding: '20px' }}>
      <MetadataRow>
        <StatCard elevation={Elevation.ZERO}>
          <StatValue>{artifact.processor}</StatValue>
          <StatLabel>Processor</StatLabel>
        </StatCard>
        <StatCard elevation={Elevation.ZERO}>
          <StatValue>{versionCount}</StatValue>
          <StatLabel>Versions</StatLabel>
        </StatCard>
        <StatCard elevation={Elevation.ZERO}>
          <StatValue>{depCount}</StatValue>
          <StatLabel>Dependencies</StatLabel>
        </StatCard>
        <StatCard elevation={Elevation.ZERO}>
          <Icon 
            icon={artifact.root ? 'tick-circle' : 'git-branch'} 
            size={24} 
            intent={artifact.root ? Intent.SUCCESS : Intent.WARNING}
            style={{ marginBottom: '8px' }}
          />
          <StatLabel>{artifact.root ? 'Root Artifact' : 'Dependency'}</StatLabel>
        </StatCard>
      </MetadataRow>

      <Card elevation={Elevation.ZERO} style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
          <StatLabel style={{ alignSelf: 'center' }}>Filter:</StatLabel>
          <code>{artifact.filter || '*'}</code>
          
          <StatLabel style={{ alignSelf: 'center' }}>Config:</StatLabel>
          <pre style={{ margin: 0, fontSize: '0.85em' }}>
            {JSON.stringify(artifact.config, null, 2)}
          </pre>
        </div>
      </Card>

      <Tabs
        id="artifact-inspector-tabs"
        onChange={id => setActiveTab(id as string)}
        selectedTabId={activeTab}
        large
      >
        <Tab
          id="versions"
          title={
            <span>
              <Icon icon="versions" style={{ marginRight: '8px' }} />
              Versions
            </span>
          }
          panel={<ArtifactVersions artifact={artifact} />}
        />
        <Tab
          id="dependencies"
          title={
            <span>
              <Icon icon="inheritance" style={{ marginRight: '8px' }} />
              Dependencies
            </span>
          }
          panel={<ArtifactDependencies artifact={artifact} />}
        />
      </Tabs>
    </div>
  );
});
