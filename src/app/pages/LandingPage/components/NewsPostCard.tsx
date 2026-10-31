import React from 'react';
import {
  Button,
  Card,
  Classes,
  Divider,
  H5,
  Intent,
  Tooltip,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { NewsPost } from 'types/NewsPost';
import { notify } from 'utils/toaster';
import { DateTime } from 'app/components/common/DateTime';
import { MarkdownView } from 'app/components/common/MarkdownView';

interface Props {
  post: NewsPost;
  isAdmin: boolean;
}

export const NewsPostCard = ({ post, isAdmin }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backpack.DeleteNewsPost(id),
    meta: { errorTitle: 'Could not delete the announcement' },
    onSuccess: () => {
      notify.success('Announcement deleted.');
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
    },
  });

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete this announcement?',
      message: (
        <p>
          “{post.title}” will be removed for everyone. This can’t be undone.
        </p>
      ),
      confirmText: 'Delete',
      icon: 'trash',
      intent: Intent.DANGER,
    });
    if (ok) {
      deleteMutation.mutate(post.id);
    }
  };

  return (
    <article>
      <Card style={{ marginBottom: 15, padding: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <H5 style={{ margin: 0 }}>{post.title}</H5>
            <div
              className={Classes.TEXT_MUTED}
              style={{ fontSize: '0.85rem', marginTop: 4 }}
            >
              Published by <b>{post.author}</b> ·{' '}
              <DateTime value={post.timestamp} />
            </div>
          </div>
          {isAdmin && (
            <Tooltip content="Delete announcement">
              <Button
                icon="trash"
                variant="minimal"
                size="small"
                intent={Intent.DANGER}
                aria-label={`Delete announcement “${post.title}”`}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          )}
        </div>
        <Divider style={{ margin: '15px 0' }} />
        <MarkdownView>{post.content}</MarkdownView>
      </Card>
    </article>
  );
};
