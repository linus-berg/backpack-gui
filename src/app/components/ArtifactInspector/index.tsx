/**
 *
 * Inspection Drawer
 *
 */
import { Button, Classes, Drawer } from '@blueprintjs/core';
import React, { memo } from 'react';
import { Artifact } from 'types';
import { ArtifactInspectorBody } from './ArtifactInspectorBody';
import './ArtifactInspector.scss';

interface Props {
  artifact: Artifact | null;
  onClose: () => void;
}

export const ArtifactInspector = memo((props: Props) => {
  return (
    <Drawer
      title={props.artifact?.id}
      onClose={props.onClose}
      isOpen={props.artifact !== null}
    >
      <div className={Classes.DRAWER_BODY}>
        <ArtifactInspectorBody artifact={props.artifact} />
      </div>
      <div className={Classes.DRAWER_FOOTER}></div>
    </Drawer>
  );
});
