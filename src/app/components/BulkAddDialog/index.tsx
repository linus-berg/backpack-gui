import React, { memo, useState } from 'react';
import {
  Button,
  Classes,
  Dialog,
  Intent,
  TextArea,
  Callout,
  H6,
  Code,
  Tag,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import styled from 'styled-components';
import { Processor } from 'types/Processor';

interface Props {
  processor: Processor;
  isOpen: boolean;
  onClose: () => void;
}

const Layout = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
`;

const InputArea = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
`;

const HelpArea = styled.div`
  flex: 1;
`;

export const BulkAddDialog = memo(({ processor, isOpen, onClose }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const mutation = useMutation(backpack.AddArtifact, {
    onSuccess: () => {
      queryClient.invalidateQueries(['artifact_table', processor.id]);
    },
  });

  const handleAdd = async () => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    setIsProcessing(true);
    setProgress({ current: 0, total: lines.length });
    
    let count = 0;
    for (const line of lines) {
      const parts = line.split(';');
      if (parts.length < 1 || !parts[0].trim()) {
        count++;
        setProgress({ current: count, total: lines.length });
        continue;
      }

      const id = parts[0].trim();
      const filter = parts.length > 1 ? parts[1].trim() : '';
      const config: Record<string, string> = {};

      if (parts.length > 2) {
        for (let i = 2; i < parts.length; i++) {
          const kv = parts[i].split('=');
          if (kv.length === 2) {
            config[kv[0].trim()] = kv[1].trim();
          }
        }
      }

      try {
        await mutation.mutateAsync({
          id,
          processor: processor.id,
          filter,
          config,
          root: true,
          versions: {},
          dependencies: {},
        });
      } catch (e) {
        console.error(`Failed to add ${id}`, e);
      }
      count++;
      setProgress({ current: count, total: lines.length });
    }

    setIsProcessing(false);
    setText('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Add Artifacts - ${processor.id}`}
      style={{ width: '800px' }}
    >
      <Layout>
        <InputArea>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <H6 style={{ margin: 0 }}>Artifact List (One per row)</H6>
            {isProcessing && (
              <Tag intent={Intent.PRIMARY} minimal>
                Adding: {progress.current} / {progress.total}
              </Tag>
            )}
          </div>
          <TextArea
            fill
            growVertically
            large
            placeholder="artifact-id;filter;key1=value1;key2=value2"
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ minHeight: '300px', fontFamily: 'monospace' }}
          />
        </InputArea>
        <HelpArea>
          <Callout title="Format Guide" intent={Intent.PRIMARY} icon="help">
            <p>Each line should follow this format:</p>
            <Code>ID;Filter;Key=Value;...</Code>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', fontSize: '0.85em' }}>
              <li><b>ID</b>: The artifact name/identifier.</li>
              <li><b>Filter</b>: Regex for version filtering (optional).</li>
              <li><b>Config</b>: Key-Value pairs separated by <Code>=</Code>.</li>
            </ul>
            <p style={{ fontSize: '0.85em', marginTop: '0.5rem' }}>
              Examples:<br/>
              <Code>react</Code> (ID only)<br/>
              <Code>lodash;^4.0.0</Code> (ID + Filter)<br/>
              <Code>my-pkg;;env=prod</Code> (ID + Config)<br/>
              <Code>my-pkg;^1.0.0;env=prod</Code> (Full)
            </p>
          </Callout>
          {processor.requires_approval && (
            <Callout intent={Intent.WARNING} style={{ marginTop: '1rem' }} icon="shield">
              These artifacts will require administrator approval.
            </Callout>
          )}
        </HelpArea>
      </Layout>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            intent={Intent.SUCCESS}
            onClick={handleAdd}
            loading={isProcessing}
            disabled={!text.trim()}
          >
            Add All
          </Button>
        </div>
      </div>
    </Dialog>
  );
});
