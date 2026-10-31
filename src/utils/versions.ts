const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const splitVersion = (version: string) => {
  const match = version.match(/^v?([^-+]*)(?:-([^+]*))?/i);
  return { core: match?.[1] ?? version, pre: match?.[2] };
};

/**
 * Compares version strings the way people expect: numeric segments compare
 * numerically (1.10 > 1.9) and releases sort above their pre-releases
 * (1.0.0 > 1.0.0-beta). Works for semver and most free-form tags.
 * @returns Negative when a < b, positive when a > b.
 */
export const compareVersions = (a: string, b: string): number => {
  const va = splitVersion(a);
  const vb = splitVersion(b);
  const core = collator.compare(va.core, vb.core);
  if (core !== 0) {
    return core;
  }
  if (!va.pre && vb.pre) {
    return 1;
  }
  if (va.pre && !vb.pre) {
    return -1;
  }
  return collator.compare(va.pre ?? '', vb.pre ?? '') || collator.compare(a, b);
};

/** Newest-first comparator for {@link Array.sort}. */
export const compareVersionsDesc = (a: string, b: string): number =>
  compareVersions(b, a);
