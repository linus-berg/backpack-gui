/**
 *
 * Inspection Drawer
 *
 */
import { Tag } from '@blueprintjs/core';
import React, { memo } from 'react';
import { Artifact } from 'types';
import { ArtifactDependencies } from './ArtifactDependencies';
import { ArtifactField } from './ArtifactField';
import { ArtifactVersions } from './ArtifactVersions';

interface Props {
  artifact: Artifact | null;
}
const GetRootTag = (is_root: boolean) => {
  return (
    <Tag
      intent={is_root ? 'success' : 'warning'}
      icon={is_root ? 'tick' : 'cross'}
    />
  );
};

export const ArtifactInspectorBody = memo((props: Props) => {
  const artifact = props.artifact;
  if (artifact === null) {
    return null;
  }
  const versions = artifact.versions;
  const dependencies = artifact.dependencies;

  return (
    <div className="inspection-drawer-body">
      <div className="artifact-metadata">
        <ArtifactField name="Id" value={artifact.id} />
        <ArtifactField name="Processor" value={artifact.processor} />
        <ArtifactField name="Versions" value={Object.keys(versions).length} />
        <ArtifactField name="Filter" value={artifact.filter} />
        <ArtifactField name="Root" value={GetRootTag(artifact.root)} />
        <ArtifactField
          name="Dependencies"
          value={Object.keys(dependencies).length}
        />
      </div>
      <div className="artifact-grid">
        <ArtifactVersions artifact={artifact} />
        <ArtifactDependencies artifact={artifact} />
      </div>
    </div>
  );
});
