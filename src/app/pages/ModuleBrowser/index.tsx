/**
 *
 * ModuleBrowser
 *
 */
import { Button } from '@blueprintjs/core';
import {ArtifactTable} from 'app/components/ArtifactTable';
import React, { memo } from 'react';
import styled from 'styled-components/macro';

interface Props {}

export const ModuleBrowser = memo((props: Props) => {
  return (
    <Div>
      <ArtifactTable />
    </Div>
  );
});

const Div = styled.div``;
