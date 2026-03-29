import React, { useState } from 'react';
import {
  H2,
  H5,
  Card,
  Elevation,
  Button,
  Intent,
  Dialog,
  Classes,
  InputGroup,
  TextArea,
  Divider,
  Spinner,
  Icon,
  NonIdealState,
} from '@blueprintjs/core';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { useUser } from 'app/context/UserContext';
import { NewsPost } from 'types/NewsPost';
import dayjs from 'dayjs';

const Container = styled.div`
  padding: 30px;
  height: 100%;
  background-color: var(--page-bg);
  overflow: hidden;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
`;

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

const EditorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 15px;
  height: 450px; /* Explicit fixed height */
`;

const PreviewPane = styled(Card)`
  background: var(--card-bg);
  border: 1px solid var(--table-border);
  overflow-y: auto;
  padding: 15px;
  height: calc(450px - 35px); /* Match Grid height minus header */
`;

export const LandingPage = () => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const queryClient = useQueryClient();

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const { data: newsPosts, isLoading } = useQuery(['news'], () =>
    backpack.GetNewsPosts().then(r => r.data),
  );

  const createMutation = useMutation(backpack.CreateNewsPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(['news']);
      setIsPostDialogOpen(false);
      setNewPost({ title: '', content: '' });
    },
  });

  const deleteMutation = useMutation(
    (id: string) => backpack.DeleteNewsPost(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['news']);
      },
    },
  );

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;
    createMutation.mutate(newPost);
  };

  return (
    <Container>
      <ContentGrid>
        {/* Left Column: Description */}
        <div>
          <H2 style={{ marginBottom: '5px' }}>Backpack 🎒</H2>
          <div
            style={{
              color: '#5c7080',
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            Collecting the Internet, one <code>node_modules</code> folder at a
            time.
          </div>
          <Divider />
          <div
            style={{ marginTop: '20px', color: '#5c7080', lineHeight: '1.6' }}
          >
            <p>
              Welcome to <b>Backpack</b>, the over-engineered shopping cart for
              your artifacts. We spend our days stalking registries like NPM and
              NuGet so you don't have to.
            </p>
            <p>
              Our strategy is simple: <b>Greed is Good™</b>. If a package has a
              dependency, we want it. If that dependency has a dependency, we
              want that too. We won't stop until your local Nexus is so full
              of... well, whatever those 15,000 sub-dependencies actually do. Do
              we really need all of them? Probably not. Are we going to stop?
              Absolutely not.
            </p>
            <p>
              Perfect for airgapped sites, high-security bunkers, or people who
              just really, really distrust the internet.
            </p>
          </div>
        </div>

        {/* Right Column: News Feed */}
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
                      <H5 style={{ margin: 0, fontWeight: 600 }}>
                        {post.title}
                      </H5>
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
                        onClick={() => {
                          if (confirm('Permanently delete this announcement?'))
                            deleteMutation.mutate(post.id);
                        }}
                      />
                    )}
                  </div>
                  <Divider style={{ margin: '15px 0' }} />
                  <MarkdownBody>
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </MarkdownBody>
                </PostCard>
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
        </NewsColumn>
      </ContentGrid>

      <Dialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
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
            <Button onClick={() => setIsPostDialogOpen(false)}>Cancel</Button>
            <Button
              intent={Intent.PRIMARY}
              onClick={handleCreatePost}
              loading={createMutation.isLoading}
              disabled={!newPost.title || !newPost.content}
            >
              Publish Announcement
            </Button>
          </div>
        </div>
      </Dialog>
    </Container>
  );
};
