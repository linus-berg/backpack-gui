import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button, Intent } from '@blueprintjs/core';
import styled from 'styled-components';
import { Page, PageHeader } from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { CreateNewsPostDialog } from 'app/components/Announcements/CreateNewsPostDialog';
import { NewsPostCard } from 'app/components/Announcements/NewsPostCard';
import { useNewsPosts } from 'app/components/Announcements/useNewsPosts';

const List = styled.div`
  max-width: 860px;
`;

/** Admin → Announcements: publish and delete the posts shown on the home page. */
export const AnnouncementsPage = () => {
  const query = useNewsPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const posts = query.data ?? [];

  return (
    <>
      <Helmet>
        <title>Announcements</title>
      </Helmet>
      <Page>
        <PageHeader
          icon="feed"
          title="Announcements"
          description="Posts shown to everyone on the home page, e.g. maintenance windows or new ecosystems."
          actions={
            <Button
              icon="plus"
              intent={Intent.PRIMARY}
              onClick={() => setIsDialogOpen(true)}
            >
              New announcement
            </Button>
          }
        />
        {query.isLoading ? (
          <LoadingState label="Loading announcements…" />
        ) : query.isError ? (
          <QueryErrorState
            title="Couldn't load announcements"
            error={query.error}
            onRetry={() => query.refetch()}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="feed"
            title="No announcements"
            description="Publish one to tell everyone about maintenance, changes or new ecosystems."
          />
        ) : (
          <List>
            {posts.map(post => (
              <NewsPostCard key={post.id} post={post} canDelete />
            ))}
          </List>
        )}
      </Page>
      <CreateNewsPostDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};
