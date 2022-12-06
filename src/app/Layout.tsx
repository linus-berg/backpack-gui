import * as React from 'react';
import { Outlet } from 'react-router-dom';

import './app.scss';
import { ButtonGroup, Navbar } from '@blueprintjs/core';
import { ValidateAllButton } from './components/ValidateAllButton/Loadable';
import { TrackAllButton } from './components/TrackAllButton/Loadable';
import { ConfigButton } from './components/ConfigButton/Loadable';
import { ProcessorBrowserButton } from './components/ProcessorBrowserButton';

export function Layout() {
  return (
    <>
      <Navbar>
        <Navbar.Group>
          <Navbar.Heading>Artifact Processing Complex</Navbar.Heading>
          <Navbar.Divider />
          <ButtonGroup>
            <ProcessorBrowserButton />
            <ValidateAllButton />
            <TrackAllButton />
            <ConfigButton />
          </ButtonGroup>
        </Navbar.Group>
      </Navbar>
      <Outlet />
    </>
  );
}
