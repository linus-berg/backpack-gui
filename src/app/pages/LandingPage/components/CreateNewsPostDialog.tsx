import React, { useState } from 'react';
import {
  H5,
  Card,
  Elevation,
  Button,
  Intent,
  Dialog,
  Classes,
  InputGroup,
  TextArea,
} from '@blueprintjs/core';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';

const EditorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 15px;
  height: 450px;
`;

const PreviewPane = styled(Card)`
  background: var(--card-bg);
  border: 1px solid var(--table-border);
  overflow-y: auto;
  padding: 15px;
  height: calc(450px - 35px);
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
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNewsPostDialog = ({ isOpen, onClose }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const createMutation = useMutation({
    mutationFn: backpack.CreateNewsPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      onClose();
      setNewPost({ title: '', content: '' });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;
    createMutation.mutate(newPost);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create System Announcement"
      icon="edit"
      style={{ width: '80vw' }}
    >
      <div
        className={Classes.DIALOG_BODY}
        style={{ height: '70vh', overflow: 'hidden' }}
      >
        <H5>Title</H5>
        <InputGroup
          placeholder="Post title..."
          value={newPost.title}
          onChange={e => setNewPost({ ...newPost, title: e.target.value })}
        />

        <EditorGrid>
          <div style={{ height: '100%' }}>
            <H5>Content (Markdown)</H5>
            <TextArea
              fill
              placeholder="Markdown is supported..."
              style={{
                height: 'calc(100% - 35px)',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                resize: 'none',
              }}
              value={newPost.content}
              onChange={e =>
                setNewPost({ ...newPost, content: e.target.value })
              }
            />
          </div>
          <div style={{ height: '100%' }}>
            <H5>Live Preview</H5>
            <PreviewPane elevation={Elevation.ZERO}>
              <MarkdownBody>
                <ReactMarkdown>{newPost.content}</ReactMarkdown>
              </MarkdownBody>
            </PreviewPane>
          </div>
        </EditorGrid>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            intent={Intent.PRIMARY}
            onClick={handleCreatePost}
            loading={createMutation.isPending}
            disabled={!newPost.title || !newPost.content}
          >
            Publish Announcement
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
