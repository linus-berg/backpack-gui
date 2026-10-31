import React, { useEffect, useState } from 'react';
import { Button, ButtonProps, Tooltip } from '@blueprintjs/core';
import { copyToClipboard } from 'utils/clipboard';
import { notify } from 'utils/toaster';

interface Props extends Omit<ButtonProps, 'onClick'> {
  value: string;
  /** What is being copied, used in the accessible label ("Copy URI"). */
  label?: string;
  /** Called after a successful copy. */
  onCopied?: () => void;
}

/**
 * Copies `value` and briefly confirms it. Works on plain HTTP, where the
 * browser Clipboard API isn't available.
 */
export const CopyButton = ({
  value,
  label = 'value',
  onCopied,
  text,
  ...buttonProps
}: Props) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const onClick = async () => {
    if (await copyToClipboard(value)) {
      setCopied(true);
      onCopied?.();
    } else {
      notify.error(
        `Couldn't copy the ${label}. Select it and press Ctrl+C instead.`,
      );
    }
  };

  const button = (
    <Button
      variant={!text ? 'minimal' : undefined}
      size={!text ? 'small' : undefined}
      icon={copied ? 'tick' : 'duplicate'}
      intent={copied ? 'success' : undefined}
      aria-label={`Copy ${label}`}
      text={text ? (copied ? 'Copied' : text) : undefined}
      onClick={onClick}
      {...buttonProps}
    />
  );

  return text ? (
    button
  ) : (
    <Tooltip content={copied ? 'Copied' : `Copy ${label}`}>{button}</Tooltip>
  );
};
