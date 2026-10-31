import React from 'react';
import { Classes, Icon, IconName, Intent } from '@blueprintjs/core';
import { Link, LinkProps } from 'react-router-dom';

interface Props extends Omit<LinkProps, 'className'> {
  icon?: IconName;
  text: string;
  intent?: Intent;
  minimal?: boolean;
  small?: boolean;
}

/**
 * A router link that looks like a Blueprint button. Unlike a button that calls
 * `navigate()`, it can be middle-clicked, opened in a new tab and copied.
 */
export const LinkButton = ({
  icon,
  text,
  intent,
  minimal,
  small,
  ...linkProps
}: Props) => {
  const classes = [
    Classes.BUTTON,
    minimal && Classes.MINIMAL,
    small && Classes.SMALL,
    intent && Classes.intentClass(intent),
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Link className={classes} {...linkProps}>
      {icon && <Icon icon={icon} />}
      <span className={Classes.BUTTON_TEXT}>{text}</span>
    </Link>
  );
};
