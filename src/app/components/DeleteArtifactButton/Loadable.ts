/**
 *
 * Asynchronously loads the component for TrackAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const DeleteArtifactButton = lazyLoad(
  () => import('./index'),
  module => module.DeleteArtifactButton,
);
