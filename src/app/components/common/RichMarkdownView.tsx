import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Classes } from '@blueprintjs/core';
import { MarkdownBody } from './MarkdownView';

/* The parts of a hast tree this file touches. */
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/* Tags descriptions use for layout, on top of GitHub's set. */
const EXTRA_TAGS = [
  'abbr',
  'article',
  'aside',
  'caption',
  'cite',
  'col',
  'colgroup',
  'figcaption',
  'figure',
  'footer',
  'header',
  'mark',
  'small',
  'time',
  'u',
];

/*
 * GitHub's schema (no scripts, event handlers, forms, frames or javascript:
 * links), plus classes and inline styles on every element, so descriptions
 * can use Blueprint's classes ("bp6-callout bp6-intent-primary", "bp6-tag",
 * "bp6-html-table") and simple layout. The schema's per-tag class rules
 * (such as code: language-*) would win over the global one and drop every
 * other class, so they are removed.
 */
const SCHEMA = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), ...EXTRA_TAGS],
  /* Dropped with their content, which would otherwise show as text
     (e.g. the CSS of a <style> block). */
  strip: [
    'script',
    'style',
    'template',
    'noscript',
    'textarea',
    'title',
    'iframe',
    'object',
    'embed',
  ],
  attributes: {
    ...Object.fromEntries(
      Object.entries(defaultSchema.attributes ?? {}).map(([tag, rules]) => [
        tag,
        rules.filter(
          rule =>
            rule !== 'className' &&
            !(Array.isArray(rule) && rule[0] === 'className'),
        ),
      ]),
    ),
    '*': [
      ...(defaultSchema.attributes?.['*'] ?? []),
      'className',
      'style',
      'role',
      'ariaLabel',
      'ariaHidden',
    ],
  },
};

/* Anything in a style that could load or run something. */
const UNSAFE_STYLE_VALUE =
  /url\s*\(|image-set\s*\(|expression\s*\(|javascript:|@import|[\\<>]/i;
const UNSAFE_STYLE_PROPERTY = new Set(['behavior', '-moz-binding']);

/**
 * Keeps the harmless declarations of an inline style: no url(), scripts or
 * CSS escapes (used to hide them), and no fixed positioning, which could
 * cover the rest of the page.
 * @returns The cleaned style, or undefined when nothing is left.
 */
export const cleanStyle = (style: string): string | undefined => {
  const kept = style
    .split(';')
    .map(declaration => declaration.trim())
    .flatMap(declaration => {
      const colon = declaration.indexOf(':');
      if (colon <= 0) {
        return [];
      }
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      const unsafe =
        !/^-?[a-z][a-z0-9-]*$/.test(property) ||
        !value ||
        UNSAFE_STYLE_PROPERTY.has(property) ||
        UNSAFE_STYLE_VALUE.test(value) ||
        (property === 'position' && /fixed|sticky/i.test(value));
      return unsafe ? [] : [`${property}: ${value}`];
    });
  return kept.length > 0 ? kept.join('; ') : undefined;
};

/* Descriptions written for older Blueprint versions use bp3-/bp4-/bp5-. */
const NAMESPACE = Classes.getClassNamespace();
const OLD_NAMESPACE = /^bp\d+-/;

/**
 * Runs after sanitizing: cleans inline styles and moves Blueprint classes
 * of older versions to the current namespace.
 */
const rehypeDescriptionStyles = () => (tree: HastNode) => {
  const walk = (node: HastNode) => {
    const properties = node.properties;
    if (node.type === 'element' && properties) {
      if (typeof properties.style === 'string') {
        const style = cleanStyle(properties.style);
        if (style) {
          properties.style = style;
        } else {
          delete properties.style;
        }
      }
      if (Array.isArray(properties.className)) {
        properties.className = properties.className.map(name =>
          typeof name === 'string'
            ? name.replace(OLD_NAMESPACE, `${NAMESPACE}-`)
            : name,
        );
      }
    }
    node.children?.forEach(walk);
  };
  walk(tree);
};

interface Props {
  children: string;
  className?: string;
}

/**
 * Renders Markdown with inline HTML, sanitized: no scripts, event handlers,
 * forms, frames, <style> blocks or unsafe links, but classes and inline
 * styles are kept, so processor descriptions can use Blueprint markup. Kept
 * separate from MarkdownView so the HTML parser only loads on pages that
 * need it.
 */
export const RichMarkdownView = ({ children, className }: Props) => (
  <MarkdownBody className={className}>
    <ReactMarkdown
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, SCHEMA],
        rehypeDescriptionStyles,
      ]}
    >
      {children}
    </ReactMarkdown>
  </MarkdownBody>
);
