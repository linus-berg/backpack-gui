/**
 *
 * Inspection Drawer
 *
 */
import { Classes, Drawer, Position, Tag } from '@blueprintjs/core';
import React, { memo, useRef } from 'react';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import { CopyButton } from 'app/components/common/CopyButton';
import { ErrorBoundary } from 'app/components/common/ErrorBoundary';
import { ArtifactInspectorBody } from './ArtifactInspectorBody';
import './ArtifactInspector.scss';

interface Props {
  processor: Processor;
  /** ID of the artifact to show; null closes the drawer. */
  artifactId: string | null;
  onClose: () => void;
}

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  .inspector-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ArtifactInspector = memo(
  ({ processor, artifactId, onClose }: Props) => {
    // Keep showing the last artifact while the drawer animates closed.
    const lastId = useRef<string | null>(artifactId);
    if (artifactId !== null) {
      lastId.current = artifactId;
    }
    const shownId = artifactId ?? lastId.current;

    return (
      <Drawer
        title={
          <Title>
            <span className="inspector-title" title={shownId ?? undefined}>
              {shownId}
            </span>
            <Tag minimal>{processor.id}</Tag>
            {shownId && <CopyButton value={shownId} label="artifact ID" />}
          </Title>
        }
        icon="cube"
        onClose={onClose}
        isOpen={artifactId !== null}
        position={Position.RIGHT}
        size="60%"
        className="artifact-inspector-drawer"
      >
        <div className={Classes.DRAWER_BODY}>
          {shownId && (
            <ErrorBoundary resetKey={shownId}>
              <ArtifactInspectorBody
                processor={processor}
                artifactId={shownId}
                onDeleted={onClose}
              />
            </ErrorBoundary>
          )}
        </div>
      </Drawer>
    );
  },
);
