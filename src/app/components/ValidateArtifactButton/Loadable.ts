/**
 *
 * Asynchronously loads the component for TrackAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ValidateArtifactButton = lazyLoad(
  () => import('./index'),
  module => module.ValidateArtifactButton,
);
