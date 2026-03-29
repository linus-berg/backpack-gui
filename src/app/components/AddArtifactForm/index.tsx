import {
  Button,
  InputGroup,
  H6,
  Card,
  Callout,
  Intent,
  Tooltip,
  Position,
  Icon,
} from '@blueprintjs/core';

import { Popover2 } from '@blueprintjs/popover2';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { AuxInput } from './AuxInput';
import { AuxField } from 'types/AuxField';
import { Processor } from '../../../types/Processor';
import { Artifact } from 'types';
import { AuxDict } from 'types/AuxDict';
import { AxiosResponse } from 'axios';
import { PreviewArtifactDialog } from './PreviewArtifactDialog';

interface Props {
  processor: Processor;
}

export const AddArtifactForm = memo((props: Props) => {
  const backpack = useBackpackApi();
  const query_client = useQueryClient();
  const mutation = useMutation({
    mutationFn: backpack.AddArtifact,
    onSuccess: (data: AxiosResponse<Artifact>) => {
      const artifact: Artifact = data.data;
      query_client.invalidateQueries({
        queryKey: ['artifact_table', artifact.processor, true],
      });
    },
  });

  const [name, SetName] = useState<string>('');
  const [filter, SetFilter] = useState('');
  const [config, SetConfig] = useState<Artifact['config']>({});

  // Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const UpdateValue = (fnc, evt: React.ChangeEvent<HTMLInputElement>) => {
    fnc(evt.currentTarget.value);
  };

  const UpdateField = (field: AuxField, value: string) => {
    SetConfig({ ...config, [field.key]: value });
  };

  const OnAdd = () => {
    if (name === '') {
      return;
    }
    mutation.mutate({
      id: name,
      processor: props.processor.id,
      filter: filter,
      config: config,
      root: true,
      versions: {},
      dependencies: {},
    });
    SetName('');
  };

  const aux: AuxDict = JSON.parse(props.processor.config);

  return (
    <Div>
      {props.processor.is_external && (
        <Popover2
          position={Position.LEFT}
          content={
            <div style={{ padding: '1rem', maxWidth: '300px' }}>
              Backpack acts as a <b>metadata registry</b> for this ecosystem.
              The collection, synchronization, and storage of these artifacts
              are managed by an external system.
            </div>
          }
        >
          <Callout
            intent={Intent.WARNING}
            title="External Management"
            icon="warning-sign"
            style={{
              width: '100%',
              cursor: 'pointer',
            }}
          />
        </Popover2>
      )}
      {props.processor.requires_approval && (
        <Popover2
          position={Position.LEFT}
          content={
            <div style={{ padding: '1rem', maxWidth: '300px' }}>
              New artifacts added to this processor will be reviewed by an
              administrator before collection starts.
            </div>
          }
        >
          <Callout
            intent={Intent.WARNING}
            title="Approval Required"
            icon="shield"
            style={{ marginBottom: '10px', cursor: 'pointer' }}
          />
        </Popover2>
      )}
      <Card>
        <div
          dangerouslySetInnerHTML={{ __html: props.processor.description }}
        />
      </Card>

      <FormRow>
        <InputGroup
          fill
          placeholder="Artifact Name (ex. react)"
          value={name}
          onChange={evt => UpdateValue(SetName, evt)}
          leftIcon="cube"
        />
        <Tooltip
          content="The unique identifier for the package (e.g., 'lodash' or 'ubuntu')"
          position={Position.RIGHT}
        >
          <HelpIcon icon="help" size={14} />
        </Tooltip>
      </FormRow>

      <FormRow>
        <InputGroup
          fill
          placeholder="Processor"
          value={props.processor.id}
          disabled
        />
        <div style={{ width: '14px', marginLeft: '8px' }} />
      </FormRow>

      <FormRow>
        <InputGroup
          fill
          placeholder="Regex version filter"
          value={filter}
          onChange={evt => UpdateValue(SetFilter, evt)}
          leftIcon="filter"
        />
        <Tooltip
          content="Optional: A regular expression to filter which versions should be mirrored (e.g., '^18\..*')"
          position={Position.RIGHT}
        >
          <HelpIcon icon="help" size={14} />
        </Tooltip>
      </FormRow>

      <div style={{ marginTop: '8px' }}>
        <H6>Auxiliary Configuration</H6>
        <AuxInput onChange={UpdateField} config={aux} values={config} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {!props.processor.is_external && !props.processor.direct_collect && (
          <Button
            icon="eye-open"
            onClick={() => setIsPreviewOpen(true)}
            disabled={name === ''}
            style={{ flex: 1 }}
          >
            Preview
          </Button>
        )}
        <Button
          icon="cube-add"
          intent="primary"
          onClick={() => OnAdd()}
          loading={mutation.isLoading}
          disabled={name === ''}
          style={{ flex: 2 }}
        >
          Add Artifact
        </Button>
      </div>

      <PreviewArtifactDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        artifactId={name}
        processor={props.processor.id}
        filter={filter}
      />
    </Div>
  );
});

const Div = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const HelpIcon = styled(Icon)`
  margin-left: 8px;
  color: #abb3bf;
  cursor: help;
  flex-shrink: 0;
`;
