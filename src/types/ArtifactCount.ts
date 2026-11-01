/** Artifact counts of one processor (GET /api/artifact/counts). */
export interface ArtifactCount {
  processor: string;
  /** Artifacts someone added. */
  roots: number;
  /** All artifacts, including those only there as dependencies. */
  total: number;
}
