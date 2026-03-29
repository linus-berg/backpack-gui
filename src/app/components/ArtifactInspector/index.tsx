/**
 *
 * Inspection Drawer
 *
 */
import { Classes, Drawer, Position } from '@blueprintjs/core';
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
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Inspection:</span>
          <span style={{ fontWeight: 600 }}>{props.artifact?.id}</span>
        </div>
      }
      icon="info-sign"
      onClose={props.onClose}
      isOpen={props.artifact !== null}
      position={Position.RIGHT}
      size="60%"
    >
      <div className={Classes.DRAWER_BODY}>
        <ArtifactInspectorBody artifact={props.artifact} />
      </div>
    </Drawer>
  );
});
