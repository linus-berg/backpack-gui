import { filter } from 'lodash-es';

/**
 * Recursively filters an object based on a string query.
 * @param query The search query.
 * @param obj The object to search within.
 * @param deep Whether to search recursively in nested objects. When false,
 * nested objects are skipped instead of being matched as "[object Object]".
 * @returns True if the query is found in any value.
 */
export const filterObject = (
  query: string,
  obj: Record<string, any> | null | undefined,
  deep = false,
): boolean => {
  if (obj === undefined || obj === null) {
    return false;
  }
  const needle = query.toLowerCase();
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      if (deep && filterObject(query, value, deep)) {
        return true;
      }
    } else if (String(value).toLowerCase().includes(needle)) {
      return true;
    }
  }
  return false;
};

/**
 * Filters an array of artifacts based on a search string.
 * @param query The search string.
 * @param artifacts Array of artifacts to filter.
 * @param deep Whether to search recursively in artifact configuration.
 * @returns Filtered array of artifacts.
 */
export const filterArtifacts = <T extends object>(
  query: string,
  artifacts: T[],
  deep = false,
): T[] => {
  const trimmed = query.trim();
  if (trimmed === '') {
    return artifacts;
  }
  return filter(artifacts, artifact =>
    filterObject(trimmed, artifact as Record<string, any>, deep),
  );
};
