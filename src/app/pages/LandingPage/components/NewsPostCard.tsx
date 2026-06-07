import React from 'react';
import {
  H5,
  Card,
  Elevation,
  Button,
  Intent,
  Divider,
} from '@blueprintjs/core';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { NewsPost } from 'types/NewsPost';

const PostCard = styled(Card)`
  margin-bottom: 15px;
  padding: 20px;
`;

const MarkdownBody = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;

  p:last-child {
    margin-bottom: 0;
  }
  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
`;

interface Props {
  post: NewsPost;
  isAdmin: boolean;
}

export const NewsPostCard = ({ post, isAdmin }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backpack.DeleteNewsPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const handleDelete = () => {
    if (confirm('Permanently delete this announcement?')) {
      deleteMutation.mutate(post.id);
    }
  };

  return (
    <PostCard
      key={post.id}
      elevation={Elevation.ZERO}
      style={{ border: '1px solid var(--table-border)' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <H5 style={{ margin: 0, fontWeight: 600 }}>{post.title}</H5>
          <div
            style={{
              color: '#abb3bf',
              fontSize: '0.8rem',
              marginTop: '4px',
            }}
          >
            Published by <b>{post.author}</b> on{' '}
            {dayjs(post.timestamp).format('YYYY-MM-DD HH:mm')}
          </div>
        </div>
        {isAdmin && (
          <Button
            icon="trash"
            minimal
            small
            intent={Intent.DANGER}
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          />
        )}
      </div>
      <Divider style={{ margin: '15px 0' }} />
      <MarkdownBody>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </MarkdownBody>
    </PostCard>
  );
};
