export interface Artifact {
  name: string;
  processor: string;
  filter: string;
  root: boolean;
  config: { [key: string]: string };
}
