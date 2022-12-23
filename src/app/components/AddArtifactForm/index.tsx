import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  InputGroup,
  H6,
} from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { AddArtifact } from 'api/apc';
import React, { memo, ReactEventHandler, useState } from 'react';
import styled from 'styled-components/macro';
import { AuxInput } from './AuxInput';
import { AuxField } from 'types/AuxField';
interface Props {
  processor: string;
}
export const AddArtifactForm = memo((props: Props) => {
  const mutation = useMutation(AddArtifact);
  const [name, SetName] = useState('');
  const [filter, SetFilter] = useState('');

  const UpdateValue = (fnc, evt: React.ChangeEvent<HTMLInputElement>) => {
    fnc(evt.currentTarget.value);
  };

  const OnAdd = () => {
    if (name === '') {
      return;
    }
    mutation.mutate({ name: name, processor: props.processor, filter: filter });
    SetName('');
  };

  const aux: AuxField[] = [
    {
      id: 'group',
      type: 'string',
      placeholder: 'Group',
    },
  ];
  return (
    <Div>
      <ControlGroup vertical>
        <InputGroup
          placeholder="Artifact Name (ex. react)"
          value={name}
          onChange={evt => UpdateValue(SetName, evt)}
          leftIcon="cube"
        />
        <InputGroup placeholder="Processor" value={props.processor} disabled />
        <InputGroup
          placeholder="Regex version filter"
          value={filter}
          onChange={evt => UpdateValue(SetFilter, evt)}
        />
      </ControlGroup>
      <div>
        <H6>Auxiliary input</H6>
        <ControlGroup vertical>
          <AuxInput config={aux} />
        </ControlGroup>
      </div>
      <Button icon="cube-add" intent="primary" onClick={() => OnAdd()}>
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
