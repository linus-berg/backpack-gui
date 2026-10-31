/**
 * Lightweight artifact row returned by `GET /artifact/all`. Versions and
 * dependencies are counts here; fetch the full {@link Artifact} for details.
 */
export interface ArtifactSummary {
  id: string;
  processor: string;
  filter: string;
  root: boolean;
  config: Record<string, string>;
  versions: number;
  dependencies: number;
}
