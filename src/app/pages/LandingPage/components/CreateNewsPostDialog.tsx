import React, { useState } from 'react';
import {
  Button,
  Card,
  Classes,
  Dialog,
  FormGroup,
  InputGroup,
  Intent,
  TextArea,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { notify } from 'utils/toaster';
import { MarkdownView } from 'app/components/common/MarkdownView';

const EditorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewPane = styled(Card)`
  background: var(--card-bg);
  overflow-y: auto;
  padding: 15px;
  height: 45vh;
  min-height: 240px;
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNewsPostDialog = ({ isOpen, onClose }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const createMutation = useMutation({
    mutationFn: backpack.CreateNewsPost,
    meta: { errorTitle: 'Could not publish the announcement' },
    onSuccess: () => {
      notify.success('Announcement published.');
      queryClient.invalidateQueries({ queryKey: queryKeys.news });
      onClose();
      setNewPost({ title: '', content: '' });
    },
  });

  const canPublish =
    newPost.title.trim() !== '' && newPost.content.trim() !== '';
  const hasDraft = newPost.title !== '' || newPost.content !== '';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="New announcement"
      icon="edit"
      style={{ width: 'min(1200px, 95vw)' }}
      // Keep drafts safe from stray clicks outside the dialog.
      canOutsideClickClose={!hasDraft}
    >
      <form
        onSubmit={e => {
          e.preventDefault();
          if (canPublish) {
            createMutation.mutate({
              title: newPost.title.trim(),
              content: newPost.content,
            });
          }
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Title" labelFor="news-title-input">
            <InputGroup
              id="news-title-input"
              placeholder="Post title…"
              value={newPost.title}
              autoFocus
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            />
          </FormGroup>

          <EditorGrid>
            <FormGroup
              label="Content"
              labelFor="news-content"
              labelInfo="(Markdown)"
              style={{ margin: 0 }}
            >
              <TextArea
                id="news-content"
                fill
                placeholder="Markdown is supported…"
                style={{
                  height: '45vh',
                  minHeight: 240,
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  resize: 'none',
                }}
                value={newPost.content}
                onChange={e =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
              />
            </FormGroup>
            <div>
              <label className={Classes.LABEL}>Preview</label>
              <PreviewPane>
                {newPost.content.trim() ? (
                  <MarkdownView>{newPost.content}</MarkdownView>
                ) : (
                  <span className={Classes.TEXT_MUTED}>
                    Nothing to preview yet.
                  </span>
                )}
              </PreviewPane>
            </div>
          </EditorGrid>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              intent={Intent.PRIMARY}
              loading={createMutation.isPending}
              disabled={!canPublish}
            >
              Publish
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
