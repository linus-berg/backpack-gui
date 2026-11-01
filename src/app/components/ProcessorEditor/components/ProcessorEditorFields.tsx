import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Classes,
  H4,
  Intent,
  Tooltip,
} from '@blueprintjs/core';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';
import { useTheme } from 'app/context/ThemeContext';
import { HelpTip } from 'app/components/common/HelpTip';
import { RichMarkdownView } from 'app/components/common/RichMarkdownView';
import { AuxInput } from 'app/components/AddArtifactForm/AuxInput';
import {
  auxDefaults,
  configFromRows,
  FieldRow,
  parseAuxConfig,
  rowsFromConfig,
  validateFieldRows,
} from 'utils/processorConfig';
import { ConfigFieldBuilder } from './ConfigFieldBuilder';
import '../monaco';

interface Props {
  description: string;
  onDescriptionChange: (value: string) => void;
  config: string;
  onConfigChange: (value: string) => void;
  /** Problems with the JSON, shown in the JSON view. */
  configError: string | null;
  /**
   * Reports problems in the field builder (empty or duplicate keys, missing
   * labels) so the editor can block saving; null when there are none.
   */
  onBuilderErrorChange: (summary: string | null) => void;
}

type ConfigMode = 'fields' | 'preview' | 'json';

/** Interactive preview of the extra fields as the add form renders them. */
const FieldsPreview = ({ config }: { config: string }) => {
  const aux = useMemo(() => parseAuxConfig(config), [config]);
  const [values, setValues] = useState(() => auxDefaults(aux));
  useEffect(() => setValues(auxDefaults(aux)), [aux]);
  const empty = Object.keys(aux).length === 0;
  return (
    <Card style={{ height: '100%', overflowY: 'auto' }}>
      <p className={Classes.TEXT_MUTED}>
        {empty
          ? 'No extra fields: the add form only asks for the artifact name and an optional version filter.'
          : 'Shown in the add form below the artifact name and version filter.'}
      </p>
      <AuxInput
        config={aux}
        values={values}
        idPrefix="config-preview"
        onChange={(field, value) =>
          setValues(prev => ({ ...prev, [field.key]: value }))
        }
      />
    </Card>
  );
};

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 1rem;
  flex: 1;
  min-height: 0;
  margin-top: 1rem;
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 360px;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  h4 {
    margin: 0;
  }
`;

const EditorBox = styled.div`
  flex: 1;
  min-height: 300px;
  border: 1px solid var(--table-border);
  border-radius: 3px;
  overflow: hidden;
`;

/* The field cards scroll inside the panel, like the editors beside them. */
const BuilderBox = styled.div`
  flex: 1;
  min-height: 300px;
  overflow-y: auto;
  padding: 2px 2px 12px;
`;

export const ProcessorEditorFields = ({
  description,
  onDescriptionChange,
  config,
  onConfigChange,
  configError,
  onBuilderErrorChange,
}: Props) => {
  const { isDark } = useTheme();
  const theme = isDark ? 'vs-dark' : 'light';
  const [showPreview, setShowPreview] = useState(false);

  /* The builder works on rows; the form (and the API) on the JSON string.
     Rows are re-read from the JSON whenever it changes from outside the
     builder: discard, save, or edits in the JSON view. */
  const initial = useMemo(() => rowsFromConfig(config), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [rows, setRows] = useState<FieldRow[]>(initial.rows);
  const [parseError, setParseError] = useState<string | null>(initial.error);
  const [mode, setMode] = useState<ConfigMode>(
    initial.error ? 'json' : 'fields',
  );
  const emitted = useRef(config);

  useEffect(() => {
    if (config === emitted.current) {
      return;
    }
    emitted.current = config;
    const parsed = rowsFromConfig(config);
    setParseError(parsed.error);
    if (!parsed.error) {
      setRows(parsed.rows);
    }
  }, [config]);

  const validation = useMemo(() => validateFieldRows(rows), [rows]);
  const builderError = mode === 'json' ? null : validation.summary;
  useEffect(
    () => onBuilderErrorChange(builderError),
    [builderError, onBuilderErrorChange],
  );

  const onRowsChange = (next: FieldRow[]) => {
    setRows(next);
    const json = configFromRows(next);
    emitted.current = json;
    onConfigChange(json);
  };

  /* Fields and Preview need JSON the builder understands; JSON needs rows
     that map to it (duplicate keys would be lost). */
  const fieldsBlocked = parseError
    ? 'Fix the JSON first: the field builder can’t show it.'
    : null;
  const jsonBlocked = validation.summary
    ? 'Fix the highlighted fields first.'
    : null;
  const modeButton = (
    value: ConfigMode,
    text: string,
    blocked: string | null,
  ) => {
    const button = (
      <Button
        size="small"
        text={text}
        active={mode === value}
        disabled={!!blocked && mode !== value}
        onClick={() => setMode(value)}
      />
    );
    return blocked && mode !== value ? (
      <Tooltip content={blocked}>{button}</Tooltip>
    ) : (
      button
    );
  };

  return (
    <Columns>
      <Panel>
        <PanelHeader>
          <H4>
            Description
            <HelpTip content="Markdown shown to users above the add-artifact form. Basic HTML is allowed; scripts and styles are removed." />
          </H4>
          <ButtonGroup>
            <Button
              size="small"
              text="Edit"
              active={!showPreview}
              onClick={() => setShowPreview(false)}
            />
            <Button
              size="small"
              text="Preview"
              active={showPreview}
              onClick={() => setShowPreview(true)}
            />
          </ButtonGroup>
        </PanelHeader>
        <EditorBox>
          {showPreview ? (
            <Card style={{ height: '100%', overflowY: 'auto' }}>
              {description.trim() ? (
                <RichMarkdownView>{description}</RichMarkdownView>
              ) : (
                <span className={Classes.TEXT_MUTED}>No description.</span>
              )}
            </Card>
          ) : (
            <Editor
              theme={theme}
              onChange={value => onDescriptionChange(value ?? '')}
              language="markdown"
              height="100%"
              value={description}
              options={{ minimap: { enabled: false }, wordWrap: 'on' }}
            />
          )}
        </EditorBox>
      </Panel>
      <Panel>
        <PanelHeader>
          <H4>
            Configuration fields
            <HelpTip content="Extra inputs in the add-artifact form for this processor. Their values are stored on each artifact and passed to the processor under the field's key." />
          </H4>
          <ButtonGroup>
            {modeButton('fields', 'Fields', fieldsBlocked)}
            {modeButton('preview', 'Preview', fieldsBlocked)}
            {modeButton('json', 'JSON', jsonBlocked)}
          </ButtonGroup>
        </PanelHeader>
        {mode === 'json' ? (
          <>
            <EditorBox>
              <Editor
                theme={theme}
                onChange={value => onConfigChange(value ?? '')}
                language="json"
                height="100%"
                value={config}
                options={{ minimap: { enabled: false } }}
              />
            </EditorBox>
            {configError && (
              <Callout
                intent={Intent.DANGER}
                icon="error"
                style={{ marginTop: 8 }}
              >
                {configError}
              </Callout>
            )}
          </>
        ) : mode === 'preview' ? (
          <EditorBox>
            <FieldsPreview config={config} />
          </EditorBox>
        ) : (
          <BuilderBox>
            <ConfigFieldBuilder
              rows={rows}
              errors={validation.byRow}
              onChange={onRowsChange}
            />
          </BuilderBox>
        )}
      </Panel>
    </Columns>
  );
};
