import React, { memo } from 'react';
import {
  Button,
  Card,
  Classes,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Intent,
  Switch,
  Tag,
} from '@blueprintjs/core';
import styled from 'styled-components';
import {
  AuxFieldType,
  FieldRow,
  FieldRowErrors,
  newFieldRow,
  slugKey,
} from 'utils/processorConfig';

interface Props {
  rows: FieldRow[];
  errors: Record<string, FieldRowErrors>;
  onChange: (rows: FieldRow[]) => void;
}

const TYPE_OPTIONS: { value: AuxFieldType; label: string }[] = [
  { value: 'string', label: 'Text' },
  { value: 'bool', label: 'Checkbox' },
];

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RowCard = styled(Card)`
  padding: 12px 16px 4px;
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  min-width: 0;

  .row-title {
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-actions {
    margin-left: auto;
    display: flex;
    flex-shrink: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  column-gap: 12px;

  .${Classes.FORM_GROUP} {
    margin-bottom: 12px;
  }
`;

const Empty = styled.div`
  padding: 20px;
  border: 1px dashed var(--table-border);
  border-radius: 4px;
  text-align: center;
`;

interface RowProps {
  row: FieldRow;
  index: number;
  count: number;
  errors?: FieldRowErrors;
  onChange: (row: FieldRow) => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
}

const FieldRowEditor = memo(
  ({ row, index, count, errors, onChange, onMove, onRemove }: RowProps) => {
    const id = (part: string) => `${row.uid}-${part}`;
    const set = (patch: Partial<FieldRow>) => onChange({ ...row, ...patch });
    const title = row.name.trim() || 'New field';
    const renamed =
      row.originalKey !== undefined &&
      row.key !== row.originalKey &&
      !errors?.key;

    return (
      <RowCard>
        <RowHeader>
          <span className="row-title">{title}</span>
          {row.key && (
            <Tag minimal className={Classes.MONOSPACE_TEXT}>
              {row.key}
            </Tag>
          )}
          <Tag minimal round>
            {row.type === 'bool' ? 'Checkbox' : 'Text'}
          </Tag>
          <span className="row-actions">
            <Button
              icon="arrow-up"
              variant="minimal"
              size="small"
              aria-label={`Move ${title} up`}
              title="Move up"
              disabled={index === 0}
              onClick={() => onMove(-1)}
            />
            <Button
              icon="arrow-down"
              variant="minimal"
              size="small"
              aria-label={`Move ${title} down`}
              title="Move down"
              disabled={index === count - 1}
              onClick={() => onMove(1)}
            />
            <Button
              icon="cross"
              variant="minimal"
              size="small"
              aria-label={`Remove ${title}`}
              title="Remove field"
              onClick={onRemove}
            />
          </span>
        </RowHeader>
        <Grid>
          <FormGroup
            label="Label"
            labelFor={id('name')}
            intent={errors?.name ? Intent.DANGER : Intent.NONE}
            helperText={errors?.name ?? 'Shown to users in the add form.'}
          >
            <InputGroup
              id={id('name')}
              value={row.name}
              placeholder="e.g. Group ID"
              intent={errors?.name ? Intent.DANGER : Intent.NONE}
              onChange={e => {
                const name = e.currentTarget.value;
                set(row.autoKey ? { name, key: slugKey(name) } : { name });
              }}
            />
          </FormGroup>
          <FormGroup
            label="Key"
            labelFor={id('key')}
            intent={
              errors?.key
                ? Intent.DANGER
                : renamed
                ? Intent.WARNING
                : Intent.NONE
            }
            helperText={
              errors?.key ??
              (renamed
                ? `Renamed from “${row.originalKey}”. Artifacts added before keep their value under the old key.`
                : 'The name the processor reads from the artifact’s config.')
            }
          >
            <InputGroup
              id={id('key')}
              value={row.key}
              placeholder="e.g. group"
              className={Classes.MONOSPACE_TEXT}
              intent={errors?.key ? Intent.DANGER : Intent.NONE}
              onChange={e =>
                set({ key: e.currentTarget.value.trim(), autoKey: false })
              }
            />
          </FormGroup>
          <FormGroup label="Type" labelFor={id('type')}>
            <HTMLSelect
              id={id('type')}
              fill
              value={row.type}
              options={TYPE_OPTIONS}
              onChange={e =>
                set({
                  type: e.currentTarget.value as AuxFieldType,
                  // A text default means nothing to a checkbox, and back.
                  default: '',
                })
              }
            />
          </FormGroup>
          <FormGroup
            label={row.type === 'bool' ? 'Checkbox text' : 'Placeholder'}
            labelFor={id('placeholder')}
            helperText={
              row.type === 'bool'
                ? 'Text next to the checkbox.'
                : 'Example shown in the empty input.'
            }
          >
            <InputGroup
              id={id('placeholder')}
              value={row.placeholder}
              placeholder={
                row.type === 'bool'
                  ? 'e.g. Include snapshots'
                  : 'e.g. org.example'
              }
              onChange={e => set({ placeholder: e.currentTarget.value })}
            />
          </FormGroup>
          {row.type === 'bool' ? (
            <FormGroup label="Default" helperText="Pre-set for new artifacts.">
              <Switch
                checked={row.default === 'true'}
                label="Checked"
                onChange={e =>
                  set({ default: e.currentTarget.checked ? 'true' : '' })
                }
              />
            </FormGroup>
          ) : (
            <FormGroup
              label="Default"
              labelFor={id('default')}
              labelInfo="(optional)"
              helperText="Pre-filled for new artifacts."
            >
              <InputGroup
                id={id('default')}
                value={row.default}
                onChange={e => set({ default: e.currentTarget.value })}
              />
            </FormGroup>
          )}
        </Grid>
      </RowCard>
    );
  },
);

/**
 * Edits a processor's extra add-artifact fields as a list of cards, instead
 * of the raw JSON definitions. The rows are converted with
 * utils/processorConfig (rowsFromConfig, configFromRows).
 */
export const ConfigFieldBuilder = ({ rows, errors, onChange }: Props) => {
  const update = (index: number, row: FieldRow) =>
    onChange(rows.map((r, i) => (i === index ? row : r)));
  const move = (index: number, delta: -1 | 1) => {
    const next = [...rows];
    const [row] = next.splice(index, 1);
    next.splice(index + delta, 0, row);
    onChange(next);
  };
  const remove = (index: number) =>
    onChange(rows.filter((_, i) => i !== index));
  const add = () => onChange([...rows, newFieldRow()]);

  return (
    <List>
      {rows.length === 0 ? (
        <Empty>
          <p>
            <b>No extra fields.</b>
          </p>
          <p className={Classes.TEXT_MUTED}>
            Users only enter an artifact name and an optional version filter.
            Add fields for anything else this processor needs, such as a group
            ID or a file pattern.
          </p>
          <Button icon="add" text="Add field" onClick={add} />
        </Empty>
      ) : (
        <>
          {rows.map((row, index) => (
            <FieldRowEditor
              key={row.uid}
              row={row}
              index={index}
              count={rows.length}
              errors={errors[row.uid]}
              onChange={r => update(index, r)}
              onMove={delta => move(index, delta)}
              onRemove={() => remove(index)}
            />
          ))}
          <div>
            <Button icon="add" text="Add field" onClick={add} />
          </div>
        </>
      )}
    </List>
  );
};
