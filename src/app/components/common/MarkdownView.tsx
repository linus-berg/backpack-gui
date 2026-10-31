import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

export const MarkdownBody = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  overflow-wrap: anywhere;

  > :first-child {
    margin-top: 0;
  }
  > :last-child {
    margin-bottom: 0;
  }
  code {
    background: var(--code-bg);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }
  pre {
    background: var(--code-bg);
    padding: 8px 10px;
    border-radius: 3px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }
  img {
    max-width: 100%;
  }
`;

interface Props {
  children: string;
  className?: string;
}

/**
 * Renders Markdown. Raw HTML is not rendered, so content can't inject
 * markup. Use {@link RichMarkdownView} where sanitized HTML is needed.
 */
export const MarkdownView = ({ children, className }: Props) => (
  <MarkdownBody className={className}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </MarkdownBody>
);
