import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  InputGroup,
} from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import React, { memo, ReactEventHandler, useState } from 'react';
import styled from 'styled-components/macro';
import { AuxField } from 'types/AuxField';

interface Props {
  value: string;
  field: AuxField;
  onChange: (value: string) => void;
}

export const StringInput = memo((props: Props) => {
  const OnChange = evt => props.onChange(evt.currentTarget.value);
  const field = props.field;
  return (
    <InputGroup
      value={props.value}
      onChange={OnChange}
      placeholder={field.placeholder}
    />
  );
});
