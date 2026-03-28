/**
 *
 * ProcessorEditor
 *
 */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import Editor from '@monaco-editor/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Alert, Button, Checkbox, H3, Intent, Tooltip, Icon } from '@blueprintjs/core';
import { useKeycloak } from '@react-keycloak-fork/web';

interface Props {
  processor: Processor;
}

const Div = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HelpIcon = styled(Icon)`
  margin-left: 8px;
  color: #abb3bf;
  cursor: help;
`;

export const ProcessorEditor = memo((props: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();
  const isAdmin = keycloak.hasResourceRole('Administrator');

  const mutation = useMutation(backpack.UpdateProcessor, {
    onSuccess: () => {
      queryClient.invalidateQueries(['processor_list']);
    },
  });

  const deleteMutation = useMutation(backpack.DeleteProcessor, {
    onSuccess: () => {
      queryClient.invalidateQueries(['processor_list']);
    },
  });

  const processor = props.processor;

  const formatJson = (jsonStr: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  const [description, SetDescription] = useState(processor.description);
  const [config, SetConfig] = useState(formatJson(processor.config));
  const [direct_collect, SetDirectCollect] = useState(processor.direct_collect);
  const [requires_approval, SetRequiresApproval] = useState(processor.requires_approval);
  const [multi_add, SetMultiAdd] = useState(processor.multi_add);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const Save = () => {
    mutation.mutate({
      id: processor.id,
      description,
      config,
      direct_collect,
      requires_approval,
      multi_add,
    });
  };

  return (
    <Div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <H3 style={{ margin: 0 }}>Processor: {processor.id}</H3>
        <Button
          onClick={Save}
          loading={mutation.isLoading}
          intent={Intent.SUCCESS}
        >
          Save
        </Button>
        {isAdmin && (
          <Button
            onClick={() => setShowDeleteAlert(true)}
            loading={deleteMutation.isLoading}
            intent={Intent.DANGER}
          >
            Delete
          </Button>
        )}
      </div>
      <Alert
        cancelButtonText="Cancel"
        confirmButtonText="Delete"
        icon="trash"
        intent={Intent.DANGER}
        isOpen={showDeleteAlert}
        onCancel={() => setShowDeleteAlert(false)}
        onConfirm={() => deleteMutation.mutate(processor.id)}
      >
        <p>
          Are you sure you want to delete the processor <b>{processor.id}</b>?
          This action cannot be undone.
        </p>
      </Alert>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            label="Direct Collect"
            checked={direct_collect}
            onChange={() => SetDirectCollect(!direct_collect)}
            style={{ marginBottom: 0, marginTop: '1rem' }}
          />
          <Tooltip content="If enabled, the collector will fetch artifacts directly by ID instead of performing a full repository crawl." position="top">
            <HelpIcon icon="help" size={14} style={{ marginTop: '1rem' }} />
          </Tooltip>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            label="Requires Approval"
            checked={requires_approval}
            onChange={() => SetRequiresApproval(!requires_approval)}
            style={{ marginBottom: 0, marginTop: '1rem' }}
          />
          <Tooltip content="New artifacts added to this processor must be approved by an administrator before they are mirrored." position="top">
            <HelpIcon icon="help" size={14} style={{ marginTop: '1rem' }} />
          </Tooltip>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox
            label="Enable Bulk Add"
            checked={multi_add}
            onChange={() => SetMultiAdd(!multi_add)}
            style={{ marginBottom: 0, marginTop: '1rem' }}
          />
          <Tooltip content="Enables the 'Bulk Add' button in the processor panel for adding multiple artifacts via text input." position="top">
            <HelpIcon icon="help" size={14} style={{ marginTop: '1rem' }} />
          </Tooltip>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flex: 1, marginTop: '1rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <H3 style={{ marginBottom: '0.5rem' }}>Description</H3>
            <Tooltip content="HTML documentation for this processor shown to users when adding artifacts." position="right">
              <HelpIcon icon="help" size={14} style={{ marginBottom: '0.5rem' }} />
            </Tooltip>
          </div>
          <Editor
            theme="vs-dark"
            onChange={value => SetDescription(value ?? '')}
            language="html"
            height="100%"
            value={description}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '20rem',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <H3 style={{ marginBottom: '0.5rem' }}>Configuration (JSON)</H3>
            <Tooltip content="Technical configuration dictionary for the processor logic." position="right">
              <HelpIcon icon="help" size={14} style={{ marginBottom: '0.5rem' }} />
            </Tooltip>
          </div>
          <Editor
            theme="vs-dark"
            onChange={value => SetConfig(value ?? '')}
            language="json"
            height="100%"
            value={config}
          />
        </div>
      </div>
    </Div>
  );
});
