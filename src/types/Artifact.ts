export interface Artifact {
  name: string;
  processor: string;
  filter: string;
  config: { [key: string]: string };
}
