import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const isValid = (value?: string | null) => !!value && dayjs(value).isValid();

/**
 * @param value An ISO timestamp.
 * @returns The timestamp as `YYYY-MM-DD HH:mm:ss` in local time, or an em dash.
 */
export const formatDateTime = (value?: string | null): string =>
  isValid(value) ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—';

/**
 * @param value An ISO timestamp.
 * @returns A relative description such as "3 minutes ago" or "in 2 hours".
 */
export const formatRelative = (value?: string | null): string =>
  isValid(value) ? dayjs(value).fromNow() : '—';

/**
 * @param ms A duration in milliseconds.
 * @returns A short description such as "45 minutes" or "6 hours".
 */
export const formatDuration = (ms: number): string => {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 1) {
    return 'less than a minute';
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `${Math.round(hours / 24)} days`;
};
