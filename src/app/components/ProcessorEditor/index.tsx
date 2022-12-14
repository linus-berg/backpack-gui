/**
 *
 * ProcessorEditor
 *
 */
import React, { memo } from 'react';
import styled from 'styled-components/macro';
import { Processor } from 'types/Processor';

interface Props {
  processor: Processor;
}

const Div = styled.div``;

export const ProcessorEditor = memo((props: Props) => {
  const processor = props.processor;
  return <Div>{processor.config}</Div>;
});
