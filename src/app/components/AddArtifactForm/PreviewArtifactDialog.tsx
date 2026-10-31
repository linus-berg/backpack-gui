import React, { useMemo } from 'react';
import {
  Button,
  Callout,
  Classes,
  Code,
  Dialog,
  HTMLTable,
  Icon,
  Intent,
  Tag,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { sortBy } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { compareVersionsDesc } from 'utils/versions';
import { compileFilter, matchesFilter } from 'utils/versionFilter';
import { LoadingState, QueryErrorState } from 'app/components/common/States';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  artifactId: string;
  processor: string;
  config: Record<string, string>;
  filter: string;
  onAdd: () => void;
  addLabel: string;
  canAdd: boolean;
  isAdding: boolean;
}

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
`;

const SectionTitle = styled.h6`
  margin: 0 0 8px;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  font-weight: 600;
`;

export const PreviewArtifactDialog = ({
  isOpen,
  onClose,
  artifactId,
  processor,
  config,
  filter,
  onAdd,
  addLabel,
  canAdd,
  isAdding,
}: Props) => {
  const backpack = useBackpackApi();

  // The preview depends on the ID and config; the filter is applied here.
  const query = useQuery({
    queryKey: queryKeys.preview(processor, artifactId, config),
    queryFn: () =>
      backpack
        .PreviewArtifact({ id: artifactId, processor, filter, config })
        .then(r => r.data),
    enabled: isOpen && artifactId !== '',
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const artifact = query.data;
  const compiled = useMemo(() => compileFilter(filter), [filter]);
  const versions = useMemo(
    () =>
      Object.entries(artifact?.versions ?? {}).sort(([a], [b]) =>
        compareVersionsDesc(a, b),
      ),
    [artifact],
  );
  const matching = versions.filter(([v]) => matchesFilter(compiled, v)).length;
  const dependencies = useMemo(
    () =>
      sortBy(Object.values(artifact?.dependencies ?? {}), [
        d => d.processor,
        d => d.id.toLowerCase(),
      ]),
    [artifact],
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${processor}/${artifactId}`}
      icon="eye-open"
      style={{ width: 'min(1200px, 95vw)' }}
    >
      <div className={Classes.DIALOG_BODY}>
        {query.isFetching && !artifact && (
          <LoadingState label="Querying the upstream registry…" />
        )}

        {query.isError && (
          <QueryErrorState
            title="Preview failed"
            error={query.error}
            onRetry={() => query.refetch()}
          />
        )}

        {artifact && (
          <>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                {compiled.kind === 'all' ? (
                  <>
                    No filter: all <b>{versions.length}</b> versions will be
                    mirrored.
                  </>
                ) : compiled.kind === 'regex' ? (
                  <>
                    <b>{matching}</b> of {versions.length} versions match{' '}
                    <Code>{filter}</Code> and will be mirrored.
                  </>
                ) : null}
              </div>
              <Button
                small
                minimal
                icon="refresh"
                text="Refresh"
                loading={query.isFetching}
                onClick={() => query.refetch()}
              />
            </div>

            {compiled.kind === 'invalid' && (
              <Callout intent={Intent.DANGER} style={{ marginBottom: 16 }}>
                The version filter is invalid: {compiled.error}
              </Callout>
            )}

            <Columns>
              <div>
                <SectionTitle className={Classes.TEXT_MUTED}>
                  Discovered versions ({versions.length})
                </SectionTitle>
                <ScrollTableContainer style={{ maxHeight: '50vh' }}>
                  <HTMLTable striped condensed style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: 40 }} />
                        <th>Version</th>
                        <th>Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map(([v, data]) => {
                        const isMatch = matchesFilter(compiled, v);
                        const label = isMatch
                          ? 'Matches the filter: will be mirrored'
                          : 'Filtered out: will not be mirrored';
                        return (
                          <tr key={v} style={{ opacity: isMatch ? 1 : 0.55 }}>
                            <td>
                              <Icon
                                icon={isMatch ? 'tick-circle' : 'disable'}
                                intent={isMatch ? Intent.SUCCESS : Intent.NONE}
                                title={label}
                                htmlTitle={label}
                              />
                            </td>
                            <td style={{ fontWeight: 600 }}>{v}</td>
                            <td>
                              {Object.values(data.files ?? {}).map(f => (
                                <div
                                  key={f.uri}
                                  style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    overflowWrap: 'anywhere',
                                  }}
                                >
                                  {f.uri}
                                </div>
                              ))}
                            </td>
                          </tr>
                        );
                      })}
                      {versions.length === 0 && (
                        <tr>
                          <td colSpan={3} className={Classes.TEXT_MUTED}>
                            The registry returned no versions.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </HTMLTable>
                </ScrollTableContainer>
              </div>

              <div>
                <SectionTitle className={Classes.TEXT_MUTED}>
                  Direct dependencies ({dependencies.length})
                </SectionTitle>
                <ScrollTableContainer style={{ maxHeight: '50vh' }}>
                  <HTMLTable striped condensed style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Processor</th>
                        <th>Artifact ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dependencies.map(dep => (
                        <tr key={`${dep.processor}/${dep.id}`}>
                          <td>
                            <Tag minimal>{dep.processor}</Tag>
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>{dep.id}</td>
                        </tr>
                      ))}
                      {dependencies.length === 0 && (
                        <tr>
                          <td colSpan={2} className={Classes.TEXT_MUTED}>
                            No direct dependencies identified.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </HTMLTable>
                </ScrollTableContainer>
              </div>
            </Columns>
          </>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
          <Button
            intent={Intent.PRIMARY}
            icon="cube-add"
            onClick={onAdd}
            disabled={!artifact || !canAdd}
            loading={isAdding}
          >
            {addLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
