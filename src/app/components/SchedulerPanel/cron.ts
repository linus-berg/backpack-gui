import cronstrue from 'cronstrue';

/** Common schedules, in Backpack's six-field (seconds-first) cron format. */
export const CRON_PRESETS = [
  { label: 'Every hour', cron: '0 0 * * * ?' },
  { label: 'Every 6 hours', cron: '0 0 */6 * * ?' },
  { label: 'Every day at 02:00', cron: '0 0 2 * * ?' },
  { label: 'Every Sunday at 03:00', cron: '0 0 3 ? * SUN' },
];

/**
 * @param cron A cron expression.
 * @returns A plain-English description such as "At 02:00 AM", or null when
 * the expression can't be described.
 */
export const describeCron = (cron: string): string | null => {
  // Only describe Backpack's six-field format; cronstrue would happily read a
  // five-field Unix expression that the scheduler rejects.
  if (cron.trim().split(/\s+/).length !== 6) {
    return null;
  }
  try {
    return cronstrue.toString(cron, {
      use24HourTimeFormat: true,
      throwExceptionOnParseError: true,
      verbose: false,
    });
  } catch {
    return null;
  }
};

/**
 * Explains the most common mistake: pasting a standard five-field Unix cron.
 * @param cron A cron expression.
 * @returns A hint, or null when the field count looks right.
 */
export const cronFieldHint = (cron: string): string | null => {
  const fields = cron.trim().split(/\s+/).filter(Boolean);
  if (fields.length === 5) {
    return `Backpack cron expressions start with a seconds field. Did you mean "0 ${fields.join(
      ' ',
    )}"?`;
  }
  if (fields.length > 0 && fields.length < 5) {
    return 'Expected six fields: second minute hour day-of-month month day-of-week.';
  }
  return null;
};
