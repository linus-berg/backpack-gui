import React from 'react';
import { Button, H3, Intent, Tag } from '@blueprintjs/core';
import styled from 'styled-components';

interface Props {
  processorId: string;
  isDirty: boolean;
  canSave: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
`;

export const ProcessorEditorHeader = ({
  processorId,
  isDirty,
  canSave,
  onSave,
  onDiscard,
  onDelete,
  isSaving,
  isDeleting,
}: Props) => (
  <Row>
    <H3 style={{ margin: 0 }}>{processorId}</H3>
    {isDirty && (
      <Tag minimal intent={Intent.WARNING} icon="edit">
        Unsaved changes
      </Tag>
    )}
    <div style={{ flex: 1 }} />
    <Button
      text="Discard changes"
      disabled={!isDirty || isSaving}
      onClick={onDiscard}
    />
    <Button
      icon="floppy-disk"
      text="Save"
      intent={Intent.PRIMARY}
      onClick={onSave}
      loading={isSaving}
      disabled={!isDirty || !canSave}
    />
    <Button
      icon="trash"
      text="Delete processor…"
      intent={Intent.DANGER}
      variant="minimal"
      onClick={onDelete}
      loading={isDeleting}
    />
  </Row>
);
