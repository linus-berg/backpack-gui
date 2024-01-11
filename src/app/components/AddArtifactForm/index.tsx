import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  InputGroup,
  H6,
  Card,
} from '@blueprintjs/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo, useState } from 'react';
import styled from 'styled-components/macro';
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
  const apc = useApcApi();
  const query_client = useQueryClient();
  const mutation = useMutation({
    mutationFn: apc.AddArtifact,
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
      <Card>
        <div
          dangerouslySetInnerHTML={{ __html: props.processor.description }}
        />
      </Card>
      <ControlGroup vertical>
        <InputGroup
          placeholder="Artifact Name (ex. react)"
          value={name}
          onChange={evt => UpdateValue(SetName, evt)}
          leftIcon="cube"
        />
        <InputGroup
          placeholder="Processor"
          value={props.processor.id}
          disabled
        />
        <InputGroup
          placeholder="Regex version filter"
          value={filter}
          onChange={evt => UpdateValue(SetFilter, evt)}
        />
      </ControlGroup>
      <div>
        <H6>Auxiliary input</H6>
        <ControlGroup vertical>
          <AuxInput onChange={UpdateField} config={aux} values={config} />
        </ControlGroup>
      </div>
      <Button
        icon="cube-add"
        intent="primary"
        onClick={() => OnAdd()}
        loading={mutation.isLoading}
        disabled={name === ''}
      >
        Add
      </Button>
    </Div>
  );
});

const Div = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
