import * as React from 'react';
import { Outlet } from 'react-router-dom';

import './app.scss';
import {
  Alignment,
  Button,
  Intent,
  Navbar,
  Popover,
  MenuDivider,
  Menu,
  Position,
} from '@blueprintjs/core';
import { ValidateAllButton } from './components/ValidateAllButton/Loadable';
import { TrackAllButton } from './components/TrackAllButton/Loadable';
import { ConfigButton } from './components/ConfigButton/Loadable';
import { ProcessorBrowserButton } from './components/ProcessorBrowserButton';
import { useKeycloak } from '@react-keycloak-fork/web';
import { StatusPageButton } from './components/StatusPageButton/Loadable';
import { ApprovalsButton } from './components/ApprovalsButton';
import { ApiKeyButton } from './components/ApiKeyButton';
import styled from 'styled-components';
import LogoImage from './logo.png';
import { ThemeToggle } from './components/ThemeToggle';

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Logo = styled.img`
  height: 28px;
`;
const LogoText = styled.div`
  margin-left: 8px;
  display: inline-block;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  color: #2d72d2;

  .bp4-dark & {
    color: #48aff0;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  gap: 4px;
`;

export function Layout() {
  const { keycloak } = useKeycloak();
  const isAdmin = keycloak.hasResourceRole('Administrator');

  const MaintenanceMenu = (
    <Menu>
      <MenuDivider title="Security" />
      <ApprovalsButton />
      <ApiKeyButton />
      <MenuDivider title="System Tasks" />
      <ValidateAllButton />
      <TrackAllButton />
      <MenuDivider title="Settings" />
      <ConfigButton />
    </Menu>
  );

  return (
    <>
      <Navbar style={{ height: '50px' }}>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            <LogoBox>
              <Logo src={LogoImage} />
              <LogoText>BACKPACK</LogoText>
            </LogoBox>
          </Navbar.Heading>
          <Navbar.Divider />
          <NavContainer>
            <StatusPageButton />
            <ProcessorBrowserButton />

            {isAdmin && (
              <>
                <Navbar.Divider />
                <Popover
                  content={MaintenanceMenu}
                  position={Position.BOTTOM_LEFT}
                >
                  <Button icon="wrench" text="Tools" minimal />
                </Popover>
              </>
            )}
          </NavContainer>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ThemeToggle />
          <Navbar.Divider />
          <Button
            icon="log-out"
            minimal
            intent={Intent.DANGER}
            onClick={() => keycloak.logout()}
            text="Sign Out"
          />
        </Navbar.Group>
      </Navbar>
      <main style={{ height: 'calc(100vh - 50px)', overflow: 'hidden' }}>
        <Outlet />
      </main>
    </>
  );
}
