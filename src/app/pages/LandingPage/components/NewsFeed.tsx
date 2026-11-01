import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  H4,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { NewsPost } from 'types/NewsPost';
import { useUser } from 'app/context/UserContext';
import { DateTime } from 'app/components/common/DateTime';
import { LinkButton } from 'app/components/common/LinkButton';
import { MarkdownView } from 'app/components/common/MarkdownView';
import { LoadingState, QueryErrorState } from 'app/components/common/States';
import { useNewsPosts } from 'app/components/Announcements/useNewsPosts';
import { HomeCard } from './HomeCard';

/** How many announcements the card shows; "All announcements" lists the rest. */
const SHOWN = 2;

/** Longest preview, in characters; CSS also clips it to two lines. */
const EXCERPT_LENGTH = 220;

/**
 * Plain-text preview of a Markdown post: formatting, code blocks, links and
 * HTML are reduced to their text so the preview is one calm paragraph.
 * @param markdown The post content.
 * @returns The text, cut at a word boundary, and whether anything was cut.
 */
export const excerpt = (
  markdown: string,
): { text: string; truncated: boolean } => {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → their text
    .replace(/<[^>]+>/g, ' ') // HTML tags
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '') // headings, quotes, lists
    .replace(/[*_~`]+/g, '') // emphasis and inline code markers
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= EXCERPT_LENGTH) {
    return { text, truncated: false };
  }
  const cut = text.slice(0, EXCERPT_LENGTH);
  const atWord = cut.slice(
    0,
    Math.max(cut.lastIndexOf(' '), EXCERPT_LENGTH - 40),
  );
  return { text: `${atWord.trimEnd()}…`, truncated: true };
};

const Post = styled.article`
  padding: 12px 0;

  & + & {
    border-top: 1px solid var(--table-border);
  }
  .title {
    /* A button that reads as a heading link. */
    display: block;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 1rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }
  .title:hover {
    text-decoration: underline;
  }
  .meta {
    margin: 2px 0 6px;
    font-size: 0.85rem;
  }
  .preview {
    margin: 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }
  .read-more {
    margin-top: 4px;
  }
`;

/**
 * The two-line preview, reporting whether CSS had to clip it, so "Read
 * more" also appears for short texts that wrap past two lines.
 */
const Preview = ({
  text,
  onClipped,
}: {
  text: string;
  onClipped: (clipped: boolean) => void;
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const measure = () => onClipped(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, onClipped]);
  return (
    <p ref={ref} className="preview">
      {text}
    </p>
  );
};

/** One announcement in the list: title, byline and preview. */
const PostSummary = ({
  post,
  onOpen,
}: {
  post: NewsPost;
  onOpen: () => void;
}) => {
  const preview = excerpt(post.content);
  const [clipped, setClipped] = useState(false);
  return (
    <Post>
      <button type="button" className="title" onClick={onOpen}>
        {post.title}
      </button>
      <div className={`meta ${Classes.TEXT_MUTED}`}>
        {post.author} · <DateTime value={post.timestamp} mode="relative" />
      </div>
      {preview.text && <Preview text={preview.text} onClipped={setClipped} />}
      {(preview.truncated || clipped) && (
        <Button
          className="read-more"
          variant="minimal"
          size="small"
          endIcon="chevron-right"
          text="Read more"
          aria-label={`Read “${post.title}”`}
          onClick={onOpen}
        />
      )}
    </Post>
  );
};

const DialogMeta = styled.div`
  margin-bottom: 12px;
  font-size: 0.9rem;
`;

/** Full announcement; long posts scroll inside the dialog, not the page. */
const PostDialog = ({
  post,
  onClose,
}: {
  post: NewsPost | null;
  onClose: () => void;
}) => (
  <Dialog
    isOpen={post !== null}
    onClose={onClose}
    title={post?.title}
    icon={post ? 'feed' : undefined}
    style={{ width: 640, maxWidth: '90vw' }}
  >
    {post && (
      <>
        <DialogBody style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <DialogMeta className={Classes.TEXT_MUTED}>
            Published by <b>{post.author}</b> ·{' '}
            <DateTime value={post.timestamp} />
          </DialogMeta>
          <MarkdownView>{post.content}</MarkdownView>
        </DialogBody>
        <DialogFooter actions={<Button text="Close" onClick={onClose} />} />
      </>
    )}
  </Dialog>
);

const AllPosts = styled.div`
  article + article {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--table-border);
  }
  h4 {
    margin: 0;
  }
`;

/** Every announcement in full, newest first, scrolling inside the dialog. */
const AllPostsDialog = ({
  posts,
  isOpen,
  onClose,
}: {
  posts: NewsPost[];
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog
    isOpen={isOpen}
    onClose={onClose}
    title="Announcements"
    icon="feed"
    style={{ width: 680, maxWidth: '90vw' }}
  >
    <DialogBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <AllPosts>
        {posts.map(post => (
          <article key={post.id}>
            <H4>{post.title}</H4>
            <DialogMeta className={Classes.TEXT_MUTED}>
              Published by <b>{post.author}</b> ·{' '}
              <DateTime value={post.timestamp} />
            </DialogMeta>
            <MarkdownView>{post.content}</MarkdownView>
          </article>
        ))}
      </AllPosts>
    </DialogBody>
    <DialogFooter actions={<Button text="Close" onClick={onClose} />} />
  </Dialog>
);

const Footer = styled.div`
  padding-top: 8px;
  border-top: 1px solid var(--table-border);
`;

/**
 * Announcements on the home page, read-only and shortened to a preview;
 * the full post opens in a dialog. Administrators publish and delete them
 * under Admin → Announcements.
 */
export const NewsFeed = () => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const query = useNewsPosts();
  const all = query.data ?? [];
  const posts = all.slice(0, SHOWN);
  const [open, setOpen] = useState<NewsPost | null>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <HomeCard
      icon="feed"
      title="Announcements"
      titleId="home-news"
      action={
        isAdmin && (
          <LinkButton
            to="/admin/announcements"
            icon="cog"
            text="Manage"
            minimal
            small
          />
        )
      }
    >
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <QueryErrorState
          title="Couldn't load announcements"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      ) : posts.length === 0 ? (
        <p className={Classes.TEXT_MUTED} style={{ margin: '12px 0' }}>
          No announcements. Maintenance windows and other news will appear here.
        </p>
      ) : (
        posts.map(post => (
          <PostSummary key={post.id} post={post} onOpen={() => setOpen(post)} />
        ))
      )}
      {all.length > SHOWN && (
        <Footer>
          <Button
            variant="minimal"
            size="small"
            icon="list"
            text={`All announcements (${all.length})`}
            onClick={() => setShowAll(true)}
          />
        </Footer>
      )}
      <PostDialog post={open} onClose={() => setOpen(null)} />
      <AllPostsDialog
        posts={all}
        isOpen={showAll}
        onClose={() => setShowAll(false)}
      />
    </HomeCard>
  );
};
