/**
 *
 * Asynchronously loads the component for TrackAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const TrackArtifactButton = lazyLoad(
  () => import('./index'),
  module => module.TrackArtifactButton,
);
