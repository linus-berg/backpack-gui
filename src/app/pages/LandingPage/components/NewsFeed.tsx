import React, { useState } from 'react';
import { Button, Classes, H5, Icon, Intent } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { useUser } from 'app/context/UserContext';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { NewsPostCard } from './NewsPostCard';
import { CreateNewsPostDialog } from './CreateNewsPostDialog';

export const NewsFeed = () => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: queryKeys.news,
    queryFn: () => backpack.GetNewsPosts().then(r => r.data),
  });
  const posts = query.data ?? [];

  return (
    <section aria-labelledby="news-title">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <H5 id="news-title" style={{ margin: 0 }}>
          <Icon
            icon="feed"
            className={Classes.TEXT_MUTED}
            style={{ marginRight: 8 }}
          />
          Announcements
        </H5>
        {isAdmin && (
          <Button
            icon="add"
            small
            intent={Intent.PRIMARY}
            text="New announcement"
            onClick={() => setIsPostDialogOpen(true)}
          />
        )}
      </div>

      {query.isLoading ? (
        <LoadingState />
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
          description="System updates and news will appear here."
        />
      ) : (
        posts.map(post => (
          <NewsPostCard key={post.id} post={post} isAdmin={isAdmin} />
        ))
      )}

      {isAdmin && (
        <CreateNewsPostDialog
          isOpen={isPostDialogOpen}
          onClose={() => setIsPostDialogOpen(false)}
        />
      )}
    </section>
  );
};
