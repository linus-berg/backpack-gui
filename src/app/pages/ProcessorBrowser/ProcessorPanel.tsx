import React, { memo, useState } from 'react';
import { Button, H4, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import { ArtifactTable } from 'app/components/ArtifactTable';
import { AddArtifactForm } from 'app/components/AddArtifactForm';
import { ArtifactInspector } from 'app/components/ArtifactInspector';
import { BulkAddDialog } from 'app/components/BulkAddDialog';
import { useBrowserParams } from './useBrowserParams';

interface Props {
  processor: Processor;
}

export const ProcessorPanel = memo(({ processor }: Props) => {
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const { inspectId, closeInspector } = useBrowserParams();

  return (
    <Grid>
      <TableArea>
        <Header>
          <H4 style={{ margin: 0 }}>{processor.id}</H4>
          {processor.requires_approval && (
            <Tag minimal icon="shield">
              Requires approval
            </Tag>
          )}
          {processor.is_external && (
            <Tag minimal icon="share">
              Managed externally
            </Tag>
          )}
          {processor.direct_collect && (
            <Tag minimal icon="flash">
              Direct collect
            </Tag>
          )}
        </Header>
        <ArtifactTable processor={processor} />
      </TableArea>
      <Aside>
        <AddArtifactForm processor={processor} />
        {processor.multi_add && (
          <Button
            fill
            icon="add-row-bottom"
            style={{ marginTop: '1rem' }}
            onClick={() => setIsBulkAddOpen(true)}
          >
            Bulk add…
          </Button>
        )}
      </Aside>
      {processor.multi_add && (
        <BulkAddDialog
          processor={processor}
          isOpen={isBulkAddOpen}
          onClose={() => setIsBulkAddOpen(false)}
        />
      )}
      <ArtifactInspector
        processor={processor}
        artifactId={inspectId}
        onClose={closeInspector}
      />
    </Grid>
  );
});

const Grid = styled.div`
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 1.5rem;

  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(420px, 70vh) auto;
  }
`;

const TableArea = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const Aside = styled.aside`
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
`;
