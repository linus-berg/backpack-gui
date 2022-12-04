import React, { memo } from 'react';
import styled from 'styled-components/macro';
import { ArtifactTable } from 'app/components/ArtifactTable';
import { AddArtifactForm } from 'app/components/AddArtifactForm';

interface Props {
  processor: string;
}

export const ProcessorPanel = memo((props: Props) => {
  return (
    <Div>
      <TableDiv>
        <ArtifactTable processor={props.processor} />
      </TableDiv>
      <FormDiv>
        <AddArtifactForm processor={props.processor} />
      </FormDiv>
    </Div>
  );
});

const Div = styled.div`
  display: grid;
  width: 100%;
  grid-template-rows: 100%;
  grid-template-columns: 80% 20%;
`;
const TableDiv = styled.div`
  display: flex;
  width: 100%;
`;

const FormDiv = styled.div`
  padding-left: 2rem;
  padding-top: 2rem;
`;
