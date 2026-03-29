import React from 'react';
import {
  Dialog,
  Classes,
  Button,
  Intent,
  Spinner,
  HTMLTable,
  Tag,
  H5,
  Callout,
  Icon,
  Tooltip,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { map } from 'lodash-es';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  artifactId: string;
  processor: string;
  filter: string;
}

const ScrollDiv = styled.div`
  max-height: 350px;
  overflow-y: auto;
  margin-top: 10px;
  border: 1px solid var(--table-border);
  border-radius: 3px;
`;

const FlexContainer = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
`;

const TableSection = styled.div`
  flex: 1;
  min-width: 0;
`;

export const PreviewArtifactDialog = ({
  isOpen,
  onClose,
  artifactId,
  processor,
  filter,
}: Props) => {
  const backpack = useBackpackApi();

  const { data, isLoading, error } = useQuery(
    ['artifact_preview', artifactId, processor],
    () => backpack.PreviewArtifact(artifactId, processor),
    {
      enabled: isOpen && artifactId !== '',
      retry: false,
      refetchOnWindowFocus: false,
    },
  );

  const artifact = data?.data || null;

  const matchesFilter = (version: string) => {
    if (!filter || filter === '*') return true;
    try {
      const regex = new RegExp(filter);
      return regex.test(version);
    } catch (e) {
      return false;
    }
  };

  const previewError = error
    ? (error as any).response?.data || 'Failed to fetch preview'
    : null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Artifact Preview"
      icon="eye-open"
      style={{ width: '90%' }}
    >
      <div className={Classes.DIALOG_BODY}>
        {isLoading && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Spinner size={50} />
            <div style={{ marginTop: '10px', fontSize: '1.1rem' }}>
              Querying upstream registry...
            </div>
          </div>
        )}

        {previewError && (
          <Callout intent={Intent.DANGER} icon="error" title="Preview Failed">
            {previewError}
          </Callout>
        )}

        {artifact && !isLoading && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}
            >
              <div>
                <H5 style={{ margin: 0, fontSize: '1.4rem' }}>{artifact.id}</H5>
                <div style={{ color: '#abb3bf', marginTop: '4px' }}>
                  Processor: <Tag minimal>{artifact.processor}</Tag>
                </div>
              </div>
              {filter && (
                <Tag large icon="filter" intent={Intent.PRIMARY} minimal>
                  Active Filter: <code>{filter}</code>
                </Tag>
              )}
            </div>

            <FlexContainer>
              <TableSection>
                <H6>
                  {' '}
                  Discovered Versions (
                  {Object.keys(artifact.versions || {}).length}){' '}
                </H6>
                <ScrollDiv>
                  <HTMLTable striped condensed style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Version</th>
                        <th>Files / Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(artifact.versions || {}).map(
                        ([v, data]) => {
                          const isMatch = matchesFilter(v);
                          return (
                            <tr key={v} style={{ opacity: isMatch ? 1 : 0.5 }}>
                              <td>
                                <Tooltip
                                  content={
                                    isMatch ? 'Matches Filter' : 'Filtered Out'
                                  }
                                  position="left"
                                >
                                  <Icon
                                    icon={isMatch ? 'tick-circle' : 'disable'}
                                    intent={
                                      isMatch ? Intent.SUCCESS : Intent.NONE
                                    }
                                  />
                                </Tooltip>
                              </td>
                              <td style={{ fontWeight: 'bold' }}>{v}</td>
                              <td>
                                {data.files && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '2px',
                                    }}
                                  >
                                    {map(data.files, (f, i) => (
                                      <code
                                        key={i}
                                        style={{
                                          fontSize: '0.75rem',
                                          color: '#2d72d2',
                                        }}
                                      >
                                        {f.uri}
                                      </code>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </HTMLTable>
                </ScrollDiv>
              </TableSection>

              <TableSection>
                <H6>
                  {' '}
                  Discovered Dependencies (
                  {Object.keys(artifact.dependencies).length || 0}){' '}
                </H6>
                <ScrollDiv>
                  <HTMLTable striped condensed style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Processor</th>
                        <th>Artifact ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {map(artifact.dependencies, (dep, idx) => (
                        <tr key={idx}>
                          <td>
                            <Tag minimal>{dep.processor}</Tag>
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>{dep.id}</td>
                        </tr>
                      ))}
                      {(!artifact.dependencies ||
                        Object.keys(artifact.dependencies).length === 0) && (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              textAlign: 'center',
                              padding: '2rem',
                              color: '#abb3bf',
                            }}
                          >
                            No direct dependencies identified.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </HTMLTable>
                </ScrollDiv>
              </TableSection>
            </FlexContainer>
          </>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose} intent={Intent.PRIMARY} large>
            Close Preview
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const H6 = styled.h6`
  margin: 0;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #abb3bf;
  letter-spacing: 1px;
  font-weight: 600;
`;
