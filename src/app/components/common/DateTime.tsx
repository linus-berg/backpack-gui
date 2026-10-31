import React from 'react';
import { formatDateTime, formatRelative } from 'utils/dates';

interface Props {
  value?: string | null;
  /** `relative` shows "3 minutes ago"; `absolute` shows the full timestamp. */
  mode?: 'relative' | 'absolute';
  /** Text shown when there is no timestamp. */
  empty?: string;
}

/**
 * Consistent timestamp display. Whichever form isn't shown is available on
 * hover, so both are always one glance away.
 */
export const DateTime = ({ value, mode = 'absolute', empty = '—' }: Props) => {
  if (!value || formatDateTime(value) === '—') {
    return <span>{empty}</span>;
  }
  const absolute = formatDateTime(value);
  const relative = formatRelative(value);
  return (
    <time
      dateTime={value}
      title={mode === 'relative' ? absolute : relative}
      style={{ whiteSpace: 'nowrap' }}
    >
      {mode === 'relative' ? relative : absolute}
    </time>
  );
};
