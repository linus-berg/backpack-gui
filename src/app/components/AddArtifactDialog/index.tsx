/**
 *
 * AddArtifactDialog
 *
 */
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

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AddArtifactDialog = memo((props: Props) => {
  const mutation = useMutation(AddArtifact);
  const [name, SetName] = useState('');
  const [module, SetModule] = useState('');

  const UpdateValue = (fnc, evt: React.ChangeEvent<HTMLInputElement>) => {
    fnc(evt.currentTarget.value);
  };

  const OnAdd = () => {
    if (name === '' || module === '') {
      return;
    }
    mutation.mutate({ name: name, module: module });
    SetName('');
    SetModule('');
  };

  return (
    <Dialog title="Add Artifact" isOpen={props.open} onClose={props.onClose}>
      <Div className={Classes.DIALOG_BODY}>
        <ControlGroup vertical>
          <InputGroup
            placeholder="Artifact Name"
            value={name}
            onChange={evt => UpdateValue(SetName, evt)}
          />
          <InputGroup
            placeholder="Module"
            value={module}
            onChange={evt => UpdateValue(SetModule, evt)}
          />
        </ControlGroup>
      </Div>
      <Div className={Classes.DIALOG_FOOTER}>
        <Div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent="primary" onClick={() => OnAdd()}>
            Add
          </Button>
        </Div>
      </Div>
    </Dialog>
  );
});

const Div = styled.div``;
