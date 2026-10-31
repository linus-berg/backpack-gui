import React from 'react';
import { Classes, Icon, Position, Tooltip } from '@blueprintjs/core';

interface Props {
  content: string | JSX.Element;
  /** Accessible label; defaults to "More information". */
  label?: string;
  position?: Position;
}

/** Small, keyboard-focusable help icon that explains a nearby control. */
export const HelpTip = ({
  content,
  label = 'More information',
  position = Position.TOP,
}: Props) => (
  <Tooltip content={content} position={position} className="help-tip">
    <Icon
      icon="help"
      size={14}
      className={Classes.TEXT_MUTED}
      tabIndex={0}
      aria-label={label}
      style={{ cursor: 'help', marginLeft: 6, verticalAlign: 'text-bottom' }}
    />
  </Tooltip>
);
