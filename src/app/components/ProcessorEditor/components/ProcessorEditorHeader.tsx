import React, { useState } from 'react';
import { Alert, Button, H3, Intent } from '@blueprintjs/core';

interface Props {
  processorId: string;
  onSave: () => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  isAdmin: boolean;
}

export const ProcessorEditorHeader = ({
  processorId,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  isAdmin,
}: Props) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <H3 style={{ margin: 0 }}>Processor: {processorId}</H3>
      <Button
        onClick={onSave}
        loading={isSaving}
        intent={Intent.SUCCESS}
      >
        Save
      </Button>
      {isAdmin && (
        <Button
          onClick={() => setShowDeleteAlert(true)}
          loading={isDeleting}
          intent={Intent.DANGER}
        >
          Delete
        </Button>
      )}
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        icon="trash"
        intent={Intent.DANGER}
        isOpen={showDeleteAlert}
        onCancel={() => setShowDeleteAlert(false)}
        onConfirm={() => {
          setShowDeleteAlert(false);
          onDelete();
        }}
      >
        <p>
          Are you sure you want to delete the processor <b>{processorId}</b>?
          This action cannot be undone.
        </p>
      </Alert>
    </div>
  );
};
