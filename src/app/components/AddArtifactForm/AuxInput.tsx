import _ from 'lodash';
import { useMutation } from '@tanstack/react-query';
import React, { memo, ReactEventHandler, useState } from 'react';
import styled from 'styled-components/macro';
import { AuxField } from 'types/AuxField';
import { StringInput } from './StringInput';
interface Props {
  config: AuxField[];
  onChange?: (field: AuxField, value: any) => void;
}

export const AuxInput = memo((props: Props) => {
  const config = props.config;
  console.log(config);

  const CreateField = (field: AuxField, key: string) => {
    console.log(field, key);
    const OnChange = (value: any) => {
      if (props.onChange) {
        props.onChange(field, value);
      }
    };
    if (field.type.toLowerCase() == 'string') {
      return (
        <StringInput field={field} key={key} onChange={OnChange} value="" />
      );
    }
    return null;
  };
  return <Div>{_.map(config, CreateField)}</Div>;
});

const Div = styled.div``;
