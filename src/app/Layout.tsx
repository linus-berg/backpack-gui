import * as React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { useMutation } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { usePendingApprovals } from 'api/queries';
import { notify } from 'utils/toaster';
import LogoImage from './logo.png';
import { ThemeToggle } from './components/ThemeToggle';
import { HelpDialog } from './components/HelpDialog';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useConfirm } from './context/ConfirmContext';
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
const Logo = styled.img`
  height: 28px;
`;
const LogoText = styled.span`
  margin-left: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  color: var(--brand-text);
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

const ToolsMenu = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const api = useBackpackApi();

  const trackAll = useMutation({
    mutationFn: api.TrackAllArtifacts,
    meta: { errorTitle: 'Could not start tracking' },
    onSuccess: () =>
      notify.success(
        'Checking every artifact for updates. Progress is shown in System Events.',
      ),
  });
  const validateAll = useMutation({
    mutationFn: api.ValidateAllArtifacts,
    meta: { errorTitle: 'Could not start validation' },
    onSuccess: () =>
      notify.success(
        'Validating every artifact. Problems are reported in System Events.',
      ),
  });

  const runGlobal = async (kind: 'track' | 'validate') => {
    const ok = await confirm({
      title:
        kind === 'track'
          ? 'Check all artifacts for updates?'
          : 'Validate all artifacts?',
      message:
        kind === 'track'
          ? 'Every artifact in every processor is re-scanned upstream. On large mirrors this queues a lot of work and can take hours.'
          : 'Every recorded file in every processor is checked against storage. On large mirrors this can take hours.',
      confirmText: kind === 'track' ? 'Check all' : 'Validate all',
      intent: Intent.WARNING,
      icon: kind === 'track' ? 'refresh' : 'archive',
    });
    if (ok) {
      (kind === 'track' ? trackAll : validateAll).mutate();
    }
  };

  return (
    <Menu>
      <MenuDivider title="Security" />
      <MenuItem
        icon="key"
        text="API keys"
        onClick={() => navigate('/apikeys')}
      />
      <MenuDivider title="System tasks" />
      <MenuItem
        icon="refresh"
        text="Check all artifacts for updates…"
        onClick={() => runGlobal('track')}
      />
      <MenuItem
        icon="archive"
        text="Validate all artifacts…"
        onClick={() => runGlobal('validate')}
      />
      <MenuDivider title="Settings" />
      <MenuItem
        icon="cog"
        text="Processor configuration"
        onClick={() => navigate('/config')}
      />
    </Menu>
  );
};

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
              <Logo src={LogoImage} alt="" />
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
                <Navbar.Divider />
                <PopoverNext content={<ToolsMenu />} placement="bottom-start">
                  <Button icon="wrench" variant="minimal" endIcon="caret-down">
                    <span className="nav-text">Tools</span>
                  </Button>
                </PopoverNext>
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
