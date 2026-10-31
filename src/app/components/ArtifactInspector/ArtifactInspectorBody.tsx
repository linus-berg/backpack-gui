/**
 *
 * Inspection Drawer
 *
 */
import {
  Button,
  Callout,
  Card,
  Classes,
  Elevation,
  Icon,
  Intent,
  Tab,
  Tabs,
} from '@blueprintjs/core';
import React, { memo, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useArtifact } from 'api/queries';
import { Processor } from 'types/Processor';
import { isNotFound } from 'utils/errors';
import { parseAuxConfig } from 'utils/processorConfig';
import { compileFilter, matchesFilter } from 'utils/versionFilter';
import { ConfigDisplay } from 'app/components/common/ConfigDisplay';
import { FilterDisplay } from 'app/components/common/FilterDisplay';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ARTIFACT_ACTIONS } from 'app/components/ArtifactActions/actions';
import { useArtifactActions } from 'app/components/ArtifactActions/useArtifactActions';
import { ArtifactDependencies } from './ArtifactDependencies';
import { ArtifactVersions } from './ArtifactVersions';

interface Props {
  processor: Processor;
  artifactId: string;
  onDeleted: () => void;
}

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  min-width: 0;
  background-color: var(--card-bg);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  line-height: 1.3;
  font-weight: 700;
  margin-bottom: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const Details = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  align-items: baseline;
`;

export const ArtifactInspectorBody = memo(
  ({ processor, artifactId, onDeleted }: Props) => {
    const [activeTab, setActiveTab] = useState<string>('versions');
    const query = useArtifact({ processor: processor.id, id: artifactId });
    const { run, canDelete, canCollect, updateAction } =
      useArtifactActions(processor);
    const aux = useMemo(() => parseAuxConfig(processor.config), [processor]);

    const artifact = query.data;
    const compiled = useMemo(
      () => compileFilter(artifact?.filter),
      [artifact?.filter],
    );
    const versionNames = useMemo(
      () => Object.values(artifact?.versions ?? {}).map(v => v.version),
      [artifact],
    );
    const matchingCount = useMemo(
      () => versionNames.filter(v => matchesFilter(compiled, v)).length,
      [versionNames, compiled],
    );

    if (query.isLoading) {
      return <LoadingState label="Loading artifact…" />;
    }
    if (isNotFound(query.error)) {
      return (
        <EmptyState
          icon="search"
          title="Artifact not found"
          description={`${processor.id}/${artifactId} isn't tracked yet. Dependencies show up here once Backpack has ingested them.`}
        />
      );
    }
    if (query.isError || !artifact) {
      return (
        <QueryErrorState
          title="Couldn't load this artifact"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      );
    }

    const versionCount = versionNames.length;
    const depCount = Object.keys(artifact.dependencies ?? {}).length;
    const update = ARTIFACT_ACTIONS[updateAction];

    return (
      <div style={{ padding: 20 }}>
        {(canCollect || canDelete) && (
          <Actions>
            {canCollect && (
              <>
                <Button
                  icon={update.icon}
                  text={update.label}
                  onClick={() => run(updateAction, [artifact.id])}
                />
                <Button
                  icon={ARTIFACT_ACTIONS.validate.icon}
                  text={ARTIFACT_ACTIONS.validate.label}
                  onClick={() => run('validate', [artifact.id])}
                />
              </>
            )}
            {canDelete && (
              <Button
                icon={ARTIFACT_ACTIONS.delete.icon}
                intent={Intent.DANGER}
                minimal
                text={`${ARTIFACT_ACTIONS.delete.label}…`}
                onClick={async () => {
                  if (await run('delete', [artifact.id])) {
                    onDeleted();
                  }
                }}
              />
            )}
          </Actions>
        )}

        <Stats>
          <StatCard elevation={Elevation.ZERO}>
            <StatValue>{versionCount}</StatValue>
            <StatLabel className={Classes.TEXT_MUTED}>Versions</StatLabel>
            {compiled.kind === 'regex' && (
              <div className={Classes.TEXT_MUTED} style={{ fontSize: '0.8em' }}>
                {matchingCount} match the filter
              </div>
            )}
          </StatCard>
          <StatCard elevation={Elevation.ZERO}>
            <StatValue>{depCount}</StatValue>
            <StatLabel className={Classes.TEXT_MUTED}>Dependencies</StatLabel>
          </StatCard>
          <StatCard elevation={Elevation.ZERO}>
            <Icon
              icon={artifact.root ? 'tick-circle' : 'git-branch'}
              size={24}
              intent={artifact.root ? Intent.SUCCESS : Intent.NONE}
              style={{ marginBottom: 8 }}
            />
            <StatLabel className={Classes.TEXT_MUTED}>
              {artifact.root ? 'Root artifact' : 'Dependency'}
            </StatLabel>
          </StatCard>
          <StatCard elevation={Elevation.ZERO}>
            <StatValue title={artifact.processor}>
              {artifact.processor}
            </StatValue>
            <StatLabel className={Classes.TEXT_MUTED}>Processor</StatLabel>
          </StatCard>
        </Stats>

        {compiled.kind === 'invalid' && (
          <Callout
            intent={Intent.DANGER}
            title="This version filter is invalid"
            style={{ marginBottom: 16 }}
          >
            <code>{artifact.filter}</code> isn't a valid regular expression (
            {compiled.error}). Backpack can't decide which versions to collect,
            so collection fails for this artifact. Delete it and add it again
            with a valid filter (leave the filter empty to mirror every
            version).
          </Callout>
        )}

        <Card
          elevation={Elevation.ZERO}
          style={{ marginBottom: 20, padding: 15 }}
        >
          <Details>
            <StatLabel className={Classes.TEXT_MUTED}>Version filter</StatLabel>
            <div>
              <FilterDisplay filter={artifact.filter} />
            </div>
            <StatLabel className={Classes.TEXT_MUTED}>Configuration</StatLabel>
            <ConfigDisplay config={artifact.config} aux={aux} />
          </Details>
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
                <Icon icon="variable" style={{ marginRight: 8 }} />
                Versions ({versionCount})
              </span>
            }
            panel={<ArtifactVersions artifact={artifact} compiled={compiled} />}
          />
          <Tab
            id="dependencies"
            title={
              <span>
                <Icon icon="inheritance" style={{ marginRight: 8 }} />
                Dependencies ({depCount})
              </span>
            }
            panel={<ArtifactDependencies artifact={artifact} />}
          />
        </Tabs>
      </div>
    );
  },
);
