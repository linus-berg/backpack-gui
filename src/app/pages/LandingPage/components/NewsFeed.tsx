import React from 'react';
import { Classes, H5, Icon } from '@blueprintjs/core';
import { useUser } from 'app/context/UserContext';
import { LinkButton } from 'app/components/common/LinkButton';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { NewsPostCard } from 'app/components/Announcements/NewsPostCard';
import { useNewsPosts } from 'app/components/Announcements/useNewsPosts';

/**
 * Announcements on the home page, read-only. Administrators publish and
 * delete them under Admin → Announcements.
 */
export const NewsFeed = () => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const query = useNewsPosts();
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
          <LinkButton
            to="/admin/announcements"
            icon="cog"
            text="Manage"
            minimal
            small
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
        posts.map(post => <NewsPostCard key={post.id} post={post} />)
      )}
    </section>
  );
};
