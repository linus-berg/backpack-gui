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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { AuxInput } from './AuxInput';
import { AuxField } from 'types/AuxField';
import { Processor } from '../../../types/Processor';
import { Artifact } from 'types';
import { AuxDict } from 'types/AuxDict';
import { AxiosResponse } from 'axios';

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
      {props.processor.requires_approval && (
        <Callout
          intent={Intent.WARNING}
          title="Administrator Approval Required"
          icon="shield"
          style={{ marginBottom: '10px' }}
        >
          <div style={{ fontSize: '0.85em' }}>
            New artifacts added to this processor will be reviewed by an
            administrator before collection starts.
          </div>
        </Callout>
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
      <Button
        icon="cube-add"
        intent="primary"
        onClick={() => OnAdd()}
        loading={mutation.isLoading}
        disabled={name === ''}
        style={{ marginTop: '8px' }}
      >
        Add Artifact
      </Button>
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
