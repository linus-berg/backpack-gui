import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  InputGroup,
} from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { AddArtifact } from 'api/apc';
import React, { memo, ReactEventHandler, useState } from 'react';
import styled from 'styled-components/macro';
interface Props {}

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
    mutation.mutate({ name: name, module: props.processor, filter: filter });
    SetName('');
  };

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
      <Button icon="cube-add" intent="primary" onClick={() => OnAdd()}>
        Add
      </Button>
    </Div>
  );
});

const Div = styled.div``;
