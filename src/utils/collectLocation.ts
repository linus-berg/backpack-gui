/**
 * Direct-collect artifacts are identified by the URL they are collected from,
 * and its protocol picks the collector (git:// goes to the Git collector).
 * Mirrors ArtifactCollectRequest.TryGetCollectorModule in the backend.
 */
const LOCATION_PATTERN = /^[a-z][a-z0-9+.-]*:\/\/\S+$/i;

/**
 * @param processorId The processor the artifact is added to.
 * @returns An example location for the add form.
 */
export const exampleLocation = (processorId: string): string =>
  processorId === 'git'
    ? 'git://github.com/owner/repo'
    : 'protocol://host/path';

/**
 * Validates the ID of a direct-collect artifact.
 * @param value The typed ID.
 * @param processorId The processor, used for the suggestion.
 * @returns An error message, or null when the location is usable.
 */
export const validateCollectLocation = (
  value: string,
  processorId: string,
): string | null => {
  const trimmed = value.trim();
  if (!trimmed || LOCATION_PATTERN.test(trimmed)) {
    return null;
  }
  if (processorId === 'git' && !trimmed.includes('://')) {
    // scp-style "git@host:owner/repo" or "host:owner/repo" becomes
    // host/owner/repo; "host:8443/owner/repo" is a port and stays as it is.
    const scp = trimmed.match(
      /^(?:[^@/\s]+@)?([^:/\s]+):(?!\/)(?!\d+(?:\/|$))(.+)$/,
    );
    const path = scp ? `${scp[1]}/${scp[2]}` : trimmed.replace(/^\/+/, '');
    return `Include the protocol, e.g. git://${path}`;
  }
  return `Include the protocol, e.g. ${exampleLocation(processorId)}`;
};
