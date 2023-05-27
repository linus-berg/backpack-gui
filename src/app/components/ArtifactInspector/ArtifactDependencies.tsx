/**
 *
 * Artifact field
 *
 */
import React, { memo } from 'react';
import { Artifact } from 'types';
import _ from 'lodash';
import { HTMLTable } from '@blueprintjs/core';
import { ArtifactDependency } from 'types/ArtifactDependency';

interface Props {
  artifact: Artifact;
}

export const ArtifactDependencies = memo((props: Props) => {
  const dependencies = props.artifact.dependencies;
  const MapRow = (dependency: ArtifactDependency) => {
    return (
      <tr>
        <td>{dependency.id}</td>
        <td>{dependency.processor}</td>
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
            <th>Dependency</th>
            <th>Processor</th>
          </tr>
        </thead>
        <tbody>{_.map(dependencies, MapRow)}</tbody>
      </HTMLTable>
    </div>
  );
});
