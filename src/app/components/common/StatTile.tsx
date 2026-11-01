import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Classes, Icon, IconName, Intent } from '@blueprintjs/core';
import styled, { css } from 'styled-components';

/** Colour is reserved for numbers that need someone to act. */
export type Tone = 'neutral' | 'good' | 'attention' | 'bad';

const TONE_BACKGROUND: Record<Tone, string> = {
  neutral: 'var(--hover-bg)',
  good: 'var(--hover-bg)',
  attention: 'rgba(255, 194, 71, 0.22)',
  bad: 'rgba(205, 66, 70, 0.18)',
};

const TONE_TEXT: Record<Tone, string> = {
  neutral: '',
  good: 'var(--success-text)',
  attention: 'var(--warning-text)',
  bad: 'var(--danger-text)',
};

const TONE_INTENT: Record<Tone, Intent> = {
  neutral: Intent.NONE,
  good: Intent.SUCCESS,
  attention: Intent.WARNING,
  bad: Intent.DANGER,
};

const tileStyles = css<{ $tone: Tone; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  min-width: 0;
  text-align: left;
  font: inherit;
  color: inherit;
  /* An active toggle tile is outlined; the extra specificity beats
     Blueprint's card shadows. */
  ${p => (p.$active ? `&&& { box-shadow: 0 0 0 2px var(--brand-text); }` : '')}

  &&,
  &&:hover {
    color: inherit;
    text-decoration: none;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .label {
    font-weight: 600;
  }
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: ${p => TONE_BACKGROUND[p.$tone]};
  }
  .value {
    font-size: 1.85rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
  }
  .detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    /* Neutral captions keep Blueprint's muted text colour. */
    ${p => (p.$tone === 'neutral' ? '' : `color: ${TONE_TEXT[p.$tone]};`)}
  }
`;

const LinkTile = styled(Link)<{ $tone: Tone; $active?: boolean }>`
  ${tileStyles}
`;

const ButtonTile = styled.button<{ $tone: Tone; $active?: boolean }>`
  ${tileStyles}
  border: 0;
  cursor: pointer;
`;

const StaticTile = styled.div<{ $tone: Tone; $active?: boolean }>`
  ${tileStyles}
`;

interface Props {
  icon: IconName;
  label: string;
  value: ReactNode;
  detail: ReactNode;
  tone?: Tone;
  /** Makes the tile a link. */
  to?: string;
  /** Makes the tile a toggle button, e.g. a filter. */
  onClick?: () => void;
  /** Shows a toggle tile as switched on. */
  active?: boolean;
}

/**
 * A number with a label and a status line, as on the home and Status pages.
 * It links somewhere (`to`), acts as a toggle (`onClick`), or just shows.
 */
export const StatTile = ({
  icon,
  label,
  value,
  detail,
  tone = 'neutral',
  to,
  onClick,
  active,
}: Props) => {
  const quiet = tone === 'neutral' || tone === 'good';
  const content = (
    <>
      <div className="top">
        <span className="label">{label}</span>
        <span className="icon" aria-hidden="true">
          <Icon
            icon={icon}
            intent={quiet ? undefined : TONE_INTENT[tone]}
            className={quiet ? Classes.TEXT_MUTED : undefined}
          />
        </span>
      </div>
      <div className="value">{value}</div>
      <div className={`detail ${tone === 'neutral' ? Classes.TEXT_MUTED : ''}`}>
        {detail}
      </div>
    </>
  );
  const interactive = `${Classes.CARD} ${Classes.INTERACTIVE}`;
  if (to) {
    return (
      <LinkTile to={to} $tone={tone} className={interactive}>
        {content}
      </LinkTile>
    );
  }
  if (onClick) {
    return (
      <ButtonTile
        type="button"
        $tone={tone}
        $active={active}
        aria-pressed={active}
        onClick={onClick}
        className={interactive}
      >
        {content}
      </ButtonTile>
    );
  }
  return (
    <StaticTile $tone={tone} className={Classes.CARD}>
      {content}
    </StaticTile>
  );
};

/** Tiles side by side, all on one row. */
export const StatGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.$columns}, minmax(0, 1fr));
  gap: 16px;
`;
