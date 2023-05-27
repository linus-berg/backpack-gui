import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  InputGroup,
  H6,
  Card,
} from '@blueprintjs/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo, ReactEventHandler, useState } from 'react';
import styled from 'styled-components/macro';
import { AuxInput } from './AuxInput';
import { AuxField } from 'types/AuxField';
import { Processor } from '../../../types/Processor';
import { Artifact } from 'types';
import { AuxDict } from 'types/AuxDict';
interface Props {
  processor: Processor;
}

export const AddArtifactForm = memo((props: Props) => {
  const apc = useApcApi();
  const mutation = useMutation(apc.AddArtifact);
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
  console.log();

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
