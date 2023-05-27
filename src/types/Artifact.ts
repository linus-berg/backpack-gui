import { ArtifactDependency } from './ArtifactDependency';
import { ArtifactVersion } from './ArtifactVersion';

export interface Artifact {
  id: string;
  processor: string;
  filter: string;
  root: boolean;
  config: { [key: string]: string };
  versions: { [key: string]: ArtifactVersion };
  dependencies: { [key: string]: ArtifactDependency };
}
