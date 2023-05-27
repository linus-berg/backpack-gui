export interface ArtifactDependency {
  id: string;
  processor: string;
  config: { [key: string]: string };
}
