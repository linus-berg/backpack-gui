/**
 *
 * ProcessorEditor
 *
 */
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import Editor from '@monaco-editor/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Button, Checkbox, H3, Intent } from '@blueprintjs/core';

interface Props {
  processor: Processor;
}

const Div = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const ProcessorEditor = memo((props: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const mutation = useMutation(backpack.UpdateProcessor, {
    onSuccess: () => {
      queryClient.invalidateQueries(['processor_list']);
    },
  });
  const processor = props.processor;

  const formatJson = (jsonStr: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  const [description, SetDescription] = useState(processor.description);
  const [config, SetConfig] = useState(formatJson(processor.config));
  const [direct_collect, SetDirectCollect] = useState(processor.direct_collect);

  const Save = () => {
    mutation.mutate({
      id: processor.id,
      description,
      config,
      direct_collect,
    });
  };

  return (
    <Div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <H3 style={{ margin: 0 }}>Processor: {processor.id}</H3>
        <Button
          onClick={Save}
          loading={mutation.isLoading}
          intent={Intent.SUCCESS}
        >
          Save
        </Button>
      </div>
      <Checkbox
        label="Direct Collect"
        checked={direct_collect}
        onChange={() => SetDirectCollect(!direct_collect)}
        style={{ marginTop: '1rem' }}
      />
      <div style={{ display: 'flex', gap: '1rem', flex: 1, marginTop: '1rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <H3>Description</H3>
          <Editor
            theme="vs-dark"
            onChange={value => SetDescription(value ?? '')}
            language="html"
            height="100%"
            value={description}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '20rem',
          }}
        >
          <H3>Configuration (JSON)</H3>
          <Editor
            theme="vs-dark"
            onChange={value => SetConfig(value ?? '')}
            language="json"
            height="100%"
            value={config}
          />
        </div>
      </div>
    </Div>
  );
});
