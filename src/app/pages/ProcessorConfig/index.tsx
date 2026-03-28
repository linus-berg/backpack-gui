/**
 *
 * Administration
 *
 */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import {
  Button,
  Classes,
  Checkbox,
  Dialog,
  FormGroup,
  InputGroup,
  Intent,
  Spinner,
  Tab,
  Tabs,
} from '@blueprintjs/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ProcessorEditor } from 'app/components/ProcessorEditor/Loadable';
import { useKeycloak } from '@react-keycloak-fork/web';

interface Props {}

export const ProcessorConfig = memo((props: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();
  const isAdmin = keycloak.hasResourceRole('Administrator');
  const query = useQuery(['processor_list'], backpack.GetAllProcessors);
  const params = useParams();
  const nav = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProcessorId, setNewProcessorId] = useState('');
  const [newRequiresApproval, setNewRequiresApproval] = useState(false);
  const [newMultiAdd, setNewMultiAdd] = useState(false);

  const addMutation = useMutation(backpack.AddProcessor, {
    onSuccess: () => {
      queryClient.invalidateQueries(['processor_list']);
      setIsDialogOpen(false);
      setNewProcessorId('');
      setNewRequiresApproval(false);
      setNewMultiAdd(false);
    },
  });

  if (query.isLoading) {
    return <Spinner />;
  }

  if (query.data === undefined) {
    return <Div>Oops</Div>;
  }

  return (
    <Div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <Tabs
            className="processor-config-tab"
            renderActiveTabPanelOnly
            selectedTabId={params.processor}
            onChange={newTabId => nav(`/config/${newTabId}`)}
          >
            {query?.data?.data.map(processor => (
              <Tab
                className={'processor-config-tab'}
                key={processor.id}
                id={processor.id}
                title={processor.id}
                panel={<ProcessorEditor processor={processor} />}
              />
            ))}
          </Tabs>
        </div>
        {isAdmin && (
          <Button
            icon="plus"
            intent={Intent.PRIMARY}
            onClick={() => setIsDialogOpen(true)}
            style={{ alignSelf: 'flex-start', marginTop: '6px' }}
          >
            Add Processor
          </Button>
        )}
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Add New Processor"
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup
            label="Processor ID"
            labelFor="processor-id"
            labelInfo="(required)"
          >
            <InputGroup
              id="processor-id"
              placeholder="e.g. Processor.NPM"
              value={newProcessorId}
              onChange={e => setNewProcessorId(e.target.value)}
            />
          </FormGroup>
          <Checkbox
            label="Requires Approval for new artifacts"
            checked={newRequiresApproval}
            onChange={() => setNewRequiresApproval(!newRequiresApproval)}
          />
          <Checkbox
            label="Enable Bulk Add"
            checked={newMultiAdd}
            onChange={() => setNewMultiAdd(!newMultiAdd)}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              intent={Intent.PRIMARY}
              onClick={() =>
                addMutation.mutate({
                  processor_id: newProcessorId,
                  requires_approval: newRequiresApproval,
                  multi_add: newMultiAdd,
                })
              }
              loading={addMutation.isLoading}
              disabled={!newProcessorId}
            >
              Add
            </Button>
          </div>
        </div>
      </Dialog>
    </Div>
  );
});

const Div = styled.div`
  height: 100%;
  padding: 1rem;
`;
