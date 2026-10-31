import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { MarkdownBody } from './MarkdownView';

interface Props {
  children: string;
  className?: string;
}

/**
 * Renders Markdown with inline HTML allowed but sanitized: scripts, event
 * handlers and inline styles are stripped. Used for processor descriptions,
 * which were previously written as HTML. Kept separate from MarkdownView so
 * the HTML parser only loads on pages that need it.
 */
export const RichMarkdownView = ({ children, className }: Props) => (
  <MarkdownBody className={className}>
    <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeSanitize]}>
      {children}
    </ReactMarkdown>
  </MarkdownBody>
);
