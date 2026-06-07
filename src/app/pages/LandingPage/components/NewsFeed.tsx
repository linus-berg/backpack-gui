import React, { useState } from 'react';
import {
  H5,
  Button,
  Intent,
  Divider,
  Spinner,
  Icon,
  NonIdealState,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { useUser } from 'app/context/UserContext';
import { NewsPost } from 'types/NewsPost';
import { NewsPostCard } from './NewsPostCard';
import { CreateNewsPostDialog } from './CreateNewsPostDialog';

const NewsColumn = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const ScrollableNews = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  margin-top: 10px;
`;

export const NewsFeed = () => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const { data: newsPosts, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => backpack.GetNewsPosts().then(r => r.data),
  });

  return (
    <NewsColumn>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon icon="feed" color="#5c7080" />
          <H5 style={{ margin: 0 }}>System Announcements</H5>
        </div>
        {isAdmin && (
          <Button
            icon="add"
            small
            intent={Intent.PRIMARY}
            text="New Post"
            onClick={() => setIsPostDialogOpen(true)}
          />
        )}
      </div>

      <Divider />

      <ScrollableNews>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Spinner size={40} />
          </div>
        ) : (
          newsPosts?.map((post: NewsPost) => (
            <NewsPostCard key={post.id} post={post} isAdmin={isAdmin} />
          ))
        )}

        {newsPosts?.length === 0 && !isLoading && (
          <NonIdealState
            icon="info-sign"
            title="No Announcements"
            description="There are currently no system updates or news posts to display."
          />
        )}
      </ScrollableNews>

      <CreateNewsPostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
      />
    </NewsColumn>
  );
};
