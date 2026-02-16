/**
 *
 * Asynchronously loads the component for TrackAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ForceCollectArtifactButton = lazyLoad(
  () => import('./index'),
  module => module.ForceCollectArtifactButton,
);
