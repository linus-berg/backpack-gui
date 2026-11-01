import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Classes, Icon, IconName, Spinner, Tooltip } from '@blueprintjs/core';
import styled from 'styled-components';
import { useActiveJobs } from 'api/queries';
import { ErrorBoundary } from 'app/components/common/ErrorBoundary';
import { jobProgress, jobTitle } from 'utils/jobs';

interface Section {
  to: string;
  icon: IconName;
  label: string;
}

/** The pages of the Admin section, in navigation order. */
export const ADMIN_SECTIONS: Section[] = [
  { to: '/admin/processors', icon: 'cog', label: 'Processors' },
  { to: '/admin/schedules', icon: 'calendar', label: 'Schedules' },
  { to: '/admin/api-keys', icon: 'key', label: 'API keys' },
  { to: '/admin/announcements', icon: 'feed', label: 'Announcements' },
  { to: '/admin/tasks', icon: 'build', label: 'System tasks' },
  { to: '/admin/jobs', icon: 'history', label: 'Jobs' },
];

const Shell = styled.div`
  display: flex;
  height: 100%;
  min-height: 0;

  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
  }
`;

const Nav = styled.nav`
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 1rem 12px 1rem 1.25rem;
  background: var(--card-bg);
  border-right: 1px solid var(--divider);
  overflow-y: auto;

  @media (max-width: 900px) {
    width: auto;
    flex-direction: row;
    align-items: center;
    padding: 8px 1.25rem;
    border-right: none;
    border-bottom: 1px solid var(--table-border);
    overflow-x: auto;
  }
`;

const NavTitle = styled.div`
  margin: 4px 8px 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 4px;
  white-space: nowrap;

  /* && outranks Blueprint's '.bp6-dark a' link colour. */
  &&,
  &&:hover {
    color: inherit;
    text-decoration: none;
  }
  &:hover {
    background: var(--hover-bg);
  }
  &.active {
    background: var(--active-bg);
    font-weight: 600;
  }
`;

/* Each page brings its own padding and fills the remaining space. */
const Content = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;

  > * {
    flex: 1;
  }
`;

/**
 * Frame of the Admin section: navigation between the administration pages
 * on the left, the selected page on the right. Only rendered for
 * administrators (see the route in app/index.tsx).
 */
export const AdminLayout = () => {
  const location = useLocation();
  /* A running job is shown next to "Jobs" on every admin page. */
  const { running } = useActiveJobs();
  const progress = running ? jobProgress(running) : undefined;
  return (
    <Shell>
      <Nav aria-label="Administration">
        <NavTitle className={Classes.TEXT_MUTED}>Administration</NavTitle>
        {ADMIN_SECTIONS.map(section => (
          <Item key={section.to} to={section.to}>
            <Icon icon={section.icon} className={Classes.TEXT_MUTED} />
            {section.label}
            {section.to === '/admin/jobs' && running && (
              <Tooltip
                content={`${jobTitle(running)}${
                  progress !== undefined
                    ? ` · ${Math.floor(progress * 100)}%`
                    : ''
                }`}
              >
                <Spinner
                  size={14}
                  value={progress}
                  aria-label={`${jobTitle(running)} is running`}
                  style={{ marginLeft: 'auto' }}
                />
              </Tooltip>
            )}
          </Item>
        ))}
      </Nav>
      <Content>
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </Content>
    </Shell>
  );
};
