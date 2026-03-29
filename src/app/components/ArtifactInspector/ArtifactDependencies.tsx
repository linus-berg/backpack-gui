/**
 *
 * Artifact field
 *
 */
import React, { memo } from 'react';
import { Artifact } from 'types';
import { map } from 'lodash-es';
import { HTMLTable, Tag } from '@blueprintjs/core';
import { ArtifactDependency } from 'types/ArtifactDependency';
import styled from 'styled-components';

interface Props {
  artifact: Artifact;
}

const ScrollContainer = styled.div`
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid var(--table-border);
  border-radius: 3px;
  margin-top: 10px;
`;

export const ArtifactDependencies = memo((props: Props) => {
  const dependencies = props.artifact.dependencies;

  return (
    <div>
      <ScrollContainer>
        <HTMLTable condensed striped style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Processor</th>
              <th>Artifact ID</th>
            </tr>
          </thead>
          <tbody>
            {map(
              dependencies,
              (dependency: ArtifactDependency, idx: number) => (
                <tr key={idx}>
                  <td>
                    <Tag minimal>{dependency.processor}</Tag>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{dependency.id}</td>
                </tr>
              ),
            )}
            {(!dependencies || Object.keys(dependencies).length === 0) && (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#abb3bf',
                  }}
                >
                  No dependencies discovered.
                </td>
              </tr>
            )}
          </tbody>
        </HTMLTable>
      </ScrollContainer>
    </div>
  );
});
