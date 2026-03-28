import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { ArtifactTable } from 'app/components/ArtifactTable';
import { AddArtifactForm } from 'app/components/AddArtifactForm';
import { Processor } from '../../../types/Processor';
import { Button, Intent, Callout } from '@blueprintjs/core';
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
        {props.processor.is_external && (
          <Callout
            intent={Intent.WARNING}
            title="External Management"
            icon="warning-sign"
            style={{ marginBottom: '1.5rem' }}
          >
            <div style={{ fontSize: '0.85em' }}>
              Backpack acts as a <b>metadata registry</b> for this ecosystem. 
              The collection, synchronization, and storage of these artifacts 
               are managed by an external system.
            </div>
          </Callout>
        )}
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
  padding-top: 2rem;
`;
