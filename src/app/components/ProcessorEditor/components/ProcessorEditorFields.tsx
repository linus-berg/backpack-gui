import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  Callout,
  Card,
  Classes,
  H4,
  Intent,
} from '@blueprintjs/core';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';
import { useTheme } from 'app/context/ThemeContext';
import { HelpTip } from 'app/components/common/HelpTip';
import { RichMarkdownView } from 'app/components/common/RichMarkdownView';
import '../monaco';

interface Props {
  description: string;
  onDescriptionChange: (value: string) => void;
  config: string;
  onConfigChange: (value: string) => void;
  configError: string | null;
}

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

export const ProcessorEditorFields = ({
  description,
  onDescriptionChange,
  config,
  onConfigChange,
  configError,
}: Props) => {
  const { isDark } = useTheme();
  const theme = isDark ? 'vs-dark' : 'light';
  const [showPreview, setShowPreview] = useState(false);

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
              small
              text="Edit"
              active={!showPreview}
              onClick={() => setShowPreview(false)}
            />
            <Button
              small
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
            Configuration fields (JSON)
            <HelpTip content='Extra inputs shown when adding an artifact. Each entry: { "key", "type": "string" | "bool", "name", "placeholder", "default" }.' />
          </H4>
        </PanelHeader>
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
          <Callout intent={Intent.DANGER} icon="error" style={{ marginTop: 8 }}>
            {configError}
          </Callout>
        )}
      </Panel>
    </Columns>
  );
};
