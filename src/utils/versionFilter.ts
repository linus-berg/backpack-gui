/**
 * A version filter after parsing. Mirrors the backend router: an empty filter
 * collects every version, anything else is a regular expression matched
 * anywhere in the version string.
 */
export type CompiledFilter =
  | { kind: 'all' }
  | { kind: 'regex'; regex: RegExp }
  | { kind: 'invalid'; error: string };

/**
 * Parses a version filter without ever throwing.
 * @param filter The raw filter string from the artifact.
 * @returns The compiled filter.
 */
export const compileFilter = (filter?: string | null): CompiledFilter => {
  if (!filter) {
    return { kind: 'all' };
  }
  try {
    return { kind: 'regex', regex: new RegExp(filter) };
  } catch (e) {
    return {
      kind: 'invalid',
      error: e instanceof Error ? e.message : 'Invalid regular expression',
    };
  }
};

/**
 * @param compiled A filter from {@link compileFilter}.
 * @param version The version string to test.
 * @returns Whether the version would be collected, or null if unknown because
 * the filter is invalid.
 */
export const matchesFilter = (
  compiled: CompiledFilter,
  version: string,
): boolean | null => {
  switch (compiled.kind) {
    case 'all':
      return true;
    case 'regex':
      return compiled.regex.test(version);
    default:
      return null;
  }
};

/**
 * Validates a filter typed by the user.
 * @param value The input value.
 * @returns An error message, or null when the filter is acceptable.
 */
export const validateFilterInput = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed === '*') {
    return "'*' isn't a valid regular expression. Leave the filter empty to mirror every version, or use '.*'.";
  }
  const compiled = compileFilter(trimmed);
  return compiled.kind === 'invalid'
    ? `Invalid regular expression: ${compiled.error}`
    : null;
};
