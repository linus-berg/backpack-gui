import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { ArtifactTable } from 'app/components/ArtifactTable';
import { AddArtifactForm } from 'app/components/AddArtifactForm';
import { Processor } from '../../../types/Processor';
import { Button, Intent, Callout, Position } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { BulkAddDialog } from 'app/components/BulkAddDialog';

interface Props {
  processor: Processor;
}

export const ProcessorPanel = memo((props: Props) => {
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);

  return (
    <Div>
      <TableDiv>
        <ArtifactTable processor={props.processor} />
      </TableDiv>
      <FormDiv>
        <AddArtifactForm processor={props.processor} />
        {props.processor.multi_add && (
          <Button
            fill
            intent={Intent.NONE}
            style={{ marginTop: '1rem' }}
            onClick={() => setIsBulkAddOpen(true)}
          >
            Bulk Add Artifacts
          </Button>
        )}
      </FormDiv>
      <BulkAddDialog
        processor={props.processor}
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
      />
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
`;
