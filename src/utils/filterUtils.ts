import { filter } from 'lodash-es';
import { Artifact } from 'types';

/**
 * Recursively filters an object based on a string query.
 * @param query The search query.
 * @param obj The object to search within.
 * @param deep Whether to search recursively in nested objects.
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
  const keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];
    if (deep && typeof value === 'object' && value !== null) {
      if (filterObject(query, value, deep)) {
        return true;
      }
    } else {
      if (String(value).toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
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
export const filterArtifacts = (
  query: string,
  artifacts: Artifact[],
  deep = false,
): Artifact[] => {
  if (query === '') {
    return artifacts;
  }
  return filter(artifacts, artifact =>
    filterObject(query, artifact, deep),
  );
};
