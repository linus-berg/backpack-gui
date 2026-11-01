import * as React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Alignment,
  Button,
  Classes,
  Icon,
  IconName,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  Navbar,
  PopoverNext,
  Position,
  Tag,
  Tooltip,
} from '@blueprintjs/core';
import { useAuth } from 'react-oidc-context';
import styled from 'styled-components';
import { usePendingApprovals } from 'api/queries';
import LogoMark from './logo.svg?react';
import { ThemeToggle } from './components/ThemeToggle';
import { HelpDialog } from './components/HelpDialog';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useUser } from './context/UserContext';
import './app.scss';

const LogoBox = styled(NavLink)`
  display: flex;
  align-items: center;

  &&,
  &&:hover {
    color: inherit;
    text-decoration: none;
  }
`;
/* Inline, so the mark's currentColor follows the navbar text colour. */
const Logo = styled(LogoMark)`
  height: 28px;
  width: 28px;
  flex-shrink: 0;
`;
/* Same ink as the mark; the tracked, heavy caps match the README and
   social preview wordmark. The negative margin cancels the trailing
   letter-spacing so the text sits centred before the divider. */
const LogoText = styled.span`
  margin-left: 10px;
  margin-right: -0.14em;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.14em;
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  gap: 4px;
`;

/** Navigation labels collapse to icons on narrow screens; tooltips remain. */
const NavBar = styled(Navbar)`
  @media (max-width: 900px) {
    .nav-text {
      display: none;
    }
  }
`;

const Main = styled.main`
  height: calc(100vh - 50px);
  overflow: auto;
  display: flex;
  flex-direction: column;

  > * {
    flex: 1;
  }
`;

interface NavItemProps {
  to: string;
  icon: IconName;
  text: string;
  end?: boolean;
  badge?: React.ReactNode;
}

/** Router link styled as a minimal Blueprint button, highlighted when active. */
const NavItem = ({ to, icon, text, end, badge }: NavItemProps) => (
  <NavLink
    to={to}
    end={end}
    title={text}
    className={({ isActive }) =>
      [Classes.BUTTON, Classes.MINIMAL, isActive && Classes.ACTIVE]
        .filter(Boolean)
        .join(' ')
    }
  >
    <Icon icon={icon} />
    <span className={`${Classes.BUTTON_TEXT} nav-text`}>{text}</span>
    {badge}
  </NavLink>
);

export function Layout() {
  const auth = useAuth();
  const location = useLocation();
  const { user, hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const approvals = usePendingApprovals({ enabled: isAdmin });
  const pendingCount = approvals.data?.length ?? 0;

  const userMenu = (
    <Menu>
      <MenuDivider title={user?.name ?? 'Signed in'} />
      {(user?.roles ?? []).length > 0 && (
        <MenuItem
          disabled
          icon="badge"
          text={`Roles: ${user!.roles.join(', ')}`}
        />
      )}
      <MenuItem
        icon="log-out"
        text="Sign out"
        intent={Intent.DANGER}
        onClick={() => auth.signoutRedirect()}
      />
    </Menu>
  );

  return (
    <>
      <NavBar>
        <Navbar.Group align={Alignment.START}>
          <Navbar.Heading>
            <LogoBox to="/" aria-label="Backpack home">
              <Logo aria-hidden="true" focusable="false" />
              <LogoText className="nav-text">BACKPACK</LogoText>
            </LogoBox>
          </Navbar.Heading>
          <Navbar.Divider />
          <NavContainer as="nav" aria-label="Main">
            <NavItem to="/" end icon="home" text="Home" />
            <NavItem to="/status" icon="pulse" text="Status" />
            <NavItem to="/processor" icon="cube" text="Artifacts" />
            {isAdmin && (
              <>
                <NavItem
                  to="/approvals"
                  icon="confirm"
                  text="Approvals"
                  badge={
                    pendingCount > 0 && (
                      <Tag
                        round
                        intent={Intent.WARNING}
                        aria-label={`${pendingCount} waiting`}
                      >
                        {pendingCount}
                      </Tag>
                    )
                  }
                />
                <NavItem to="/admin" icon="cog" text="Admin" />
              </>
            )}
          </NavContainer>
        </Navbar.Group>
        <Navbar.Group align={Alignment.END}>
          <Tooltip content="Documentation & help" position={Position.BOTTOM}>
            <Button
              icon="help"
              variant="minimal"
              aria-label="Documentation and help"
              onClick={() => setIsHelpOpen(true)}
            />
          </Tooltip>
          <ThemeToggle />
          <Navbar.Divider />
          <PopoverNext content={userMenu} placement="bottom-end">
            <Button
              icon="user"
              variant="minimal"
              endIcon="caret-down"
              aria-label="Account"
            >
              <span className="nav-text">{user?.name ?? 'Account'}</span>
            </Button>
          </PopoverNext>
        </Navbar.Group>
      </NavBar>
      <Main>
        <ErrorBoundary resetKey={location.pathname + location.search}>
          <Outlet />
        </ErrorBoundary>
      </Main>

      <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
