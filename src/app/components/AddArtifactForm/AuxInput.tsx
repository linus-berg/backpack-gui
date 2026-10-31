import React, { memo } from 'react';
import { AuxField } from 'types/AuxField';
import { AuxDict } from 'types/AuxDict';
import { auxFieldList } from 'utils/processorConfig';
import { StringInput } from './StringInput';
import { BoolInput } from './BoolInput';

interface Props {
  config: AuxDict;
  values: { [key: string]: string };
  idPrefix: string;
  onChange?: (field: AuxField, value: string) => void;
}

/** One input per auxiliary field defined on the processor. */
export const AuxInput = memo(
  ({ config, values, idPrefix, onChange }: Props) => (
    <>
      {auxFieldList(config).map(field => {
        const handle = (value: string) => onChange?.(field, value);
        switch (field.type?.toLowerCase()) {
          case 'string':
            return (
              <StringInput
                key={field.key}
                field={field}
                idPrefix={idPrefix}
                onChange={handle}
                value={values[field.key]}
              />
            );
          case 'bool':
            return (
              <BoolInput
                key={field.key}
                field={field}
                onChange={handle}
                value={values[field.key] || 'false'}
              />
            );
          default:
            return null;
        }
      })}
    </>
  ),
);
