import { ArtifactFile } from './ArtifactFile';
export interface ArtifactVersion {
  version: string;
  files: { [key: string]: ArtifactFile };
}
