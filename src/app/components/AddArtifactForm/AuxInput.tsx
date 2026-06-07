import { map } from 'lodash-es';
import React, { memo } from 'react';
import styled from 'styled-components';
import { AuxField } from 'types/AuxField';
import { StringInput } from './StringInput';
import { BoolInput } from './BoolInput';
import { AuxDict } from 'types/AuxDict';

interface Props {
  config: AuxDict;
  values: { [key: string]: string };
  onChange?: (field: AuxField, value: string) => void;
}

export const AuxInput = memo((props: Props) => {
  const config = props.config;

  const CreateField = (field: AuxField, key: string) => {
    const OnChange = (value: string) => {
      if (props.onChange) {
        props.onChange(field, value);
      }
    };
    if (field.type.toLowerCase() == 'string') {
      return (
        <StringInput
          field={field}
          key={key}
          onChange={OnChange}
          value={props.values[field.key]}
        />
      );
    }
    if (field.type.toLowerCase() == 'bool') {
      return (
        <BoolInput
          field={field}
          key={key}
          onChange={OnChange}
          value={props.values[field.key] || 'false'}
        />
      );
    }
    return null;
  };

  return (
    <Div>
      {map(config, CreateField)}
    </Div>
  );
});

const Div = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
