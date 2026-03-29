/**
 *
 * Artifact field
 *
 */
import React, { memo, useState } from 'react';
import { Artifact } from 'types';
import { map } from 'lodash-es';
import { Button, HTMLTable, IconName, Intent, Tag, Tooltip, Icon } from '@blueprintjs/core';
import { ArtifactVersion } from 'types/ArtifactVersion';
import { ArtifactFileInspector } from './ArtifactFileInspector';
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

const GetMatchIcon = (
  filter: string,
  regex: RegExp,
  version: string,
) => {
  if (!filter || filter === '*') {
    return <Icon icon="tick-circle" intent={Intent.SUCCESS} />;
  }
  
  const isMatch = regex.test(version);
  return (
    <Tooltip content={isMatch ? "Matches Filter" : "Filtered Out"} position="left">
      <Icon 
        icon={isMatch ? 'tick-circle' : 'disable'} 
        intent={isMatch ? Intent.SUCCESS : Intent.NONE} 
      />
    </Tooltip>
  );
};

export const ArtifactVersions = memo((props: Props) => {
  const versions = props.artifact.versions;
  const regex = new RegExp(props.artifact.filter || '.*');
  const [v, SetVersion] = useState<ArtifactVersion | null>(null);

  return (
    <div>
      <ScrollContainer>
        <HTMLTable
          condensed
          striped
          style={{ width: '100%' }}
        >
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Version</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Files</th>
            </tr>
          </thead>
          <tbody>
            {map(versions, (version: ArtifactVersion) => (
              <tr key={version.version}>
                <td>{GetMatchIcon(props.artifact.filter, regex, version.version)}</td>
                <td style={{ fontWeight: 600 }}>{version.version}</td>
                <td>
                  <Tag minimal intent={version.collected ? Intent.SUCCESS : Intent.WARNING}>
                    {version.collected ? 'mirrored' : 'pending'}
                  </Tag>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Button 
                    small
                    minimal
                    icon={'folder-open'} 
                    intent={Intent.PRIMARY} 
                    onClick={() => SetVersion(version)}
                    text={Object.keys(version.files || {}).length}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </ScrollContainer>
      <ArtifactFileInspector version={v} onClose={() => SetVersion(null)} />
    </div>
  );
});
