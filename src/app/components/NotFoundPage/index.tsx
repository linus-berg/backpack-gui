import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { EmptyState } from 'app/components/common/States';
import { LinkButton } from 'app/components/common/LinkButton';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page not found</title>
        <meta name="description" content="Page not found" />
      </Helmet>
      <EmptyState
        icon="search"
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<LinkButton to="/" icon="home" text="Go to home page" />}
      />
    </>
  );
}
