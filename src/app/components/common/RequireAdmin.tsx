import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useUser } from 'app/context/UserContext';
import { EmptyState } from './States';
import { LinkButton } from './LinkButton';

/** Shown instead of an admin-only page when the user lacks the role. */
export const NotAuthorized = () => (
  <>
    <Helmet>
      <title>Not authorized</title>
    </Helmet>
    <EmptyState
      icon="lock"
      title="Administrators only"
      description="You need the Administrator role to open this page. Ask an administrator if you need access."
      action={<LinkButton to="/" icon="home" text="Go to home page" />}
    />
  </>
);

/** Renders children only for administrators. */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { hasRole } = useUser();
  return hasRole('Administrator') ? <>{children}</> : <NotAuthorized />;
};
