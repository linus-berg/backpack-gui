export interface PendingArtifact {
  id: string;
  processor: string;
  filter: string;
  config: Record<string, string>;
  requested_by: string;
  timestamp: string;
}
