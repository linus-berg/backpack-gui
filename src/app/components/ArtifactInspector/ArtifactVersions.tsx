/**
 *
 * Artifact field
 *
 */
import React, { memo, useState } from 'react';
import { Artifact } from 'types';
import _ from 'lodash';
import { Button, HTMLTable, IconName, Intent, Tag } from '@blueprintjs/core';
import { ArtifactVersion } from 'types/ArtifactVersion';
import { ArtifactFileInspector } from './ArtifactFileInspector';

interface Props {
  artifact: Artifact;
}

const GetMatchTag = (
  filter: string,
  regex: RegExp,
  version: ArtifactVersion,
) => {
  let icon: IconName = 'tick';
  let intent: Intent = 'success';
  if (filter !== '' && filter !== null) {
    if (!regex.test(version.version)) {
      icon = 'cross';
      intent = 'danger';
    }
  }
  return <Tag intent={intent} icon={icon} />;
};
export const ArtifactVersions = memo((props: Props) => {
  const versions = props.artifact.versions;
  const regex = new RegExp(props.artifact.filter);
  const [v, SetVersion] = useState<ArtifactVersion | null>(null);

  const MapRow = (version: ArtifactVersion) => {
    const OnClickFiles = () => {
      SetVersion(version);
    };
    const files = Object.keys(version.files).length;
    return (
      <tr>
        <td>{version.version}</td>
        <td>{GetMatchTag(props.artifact.filter, regex, version)}</td>
        <td>
          <Button icon={'folder-open'} intent="primary" onClick={OnClickFiles}>
            {files}
          </Button>
        </td>
      </tr>
    );
  };
  return (
    <div className="artifact-table-wrapper">
      <HTMLTable
        className="artifact-table"
        condensed
        striped
        bordered
        interactive
      >
        <thead>
          <tr>
            <th>Version</th>
            <th>Match (filter)</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>{_.map(versions, MapRow)}</tbody>
      </HTMLTable>
      <ArtifactFileInspector version={v} onClose={() => SetVersion(null)} />
    </div>
  );
});
