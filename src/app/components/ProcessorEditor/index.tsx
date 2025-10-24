/**
 *
 * ProcessorEditor
 *
 */
import React, { memo, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { Processor } from 'types/Processor';
import Editor from '@monaco-editor/react';
import { useMutation } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Button, Intent } from '@blueprintjs/core';

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
  const mutation = useMutation(backpack.UpdateProcessor);
  const processor = props.processor;
  const [description, SetDescription] = useState(processor.description);
  const Save = () => {
    processor.description = description;
    mutation.mutate(processor);
  };

  return (
    <Div>
      <Button
        onClick={Save}
        loading={mutation.isLoading}
        intent={Intent.SUCCESS}
      >
        Save
      </Button>
      <Editor
        theme="vs-dark"
        onChange={value => SetDescription(value ?? '')}
        language="html"
        height="30rem"
        value={description}
      />
    </Div>
  );
});
