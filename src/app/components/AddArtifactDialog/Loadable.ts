/**
 *
 * Asynchronously loads the component for AddArtifactDialog
 *
 */

import { lazyLoad } from 'utils/loadable';

export const AddArtifactDialog = lazyLoad(
  () => import('./index'),
  module => module.AddArtifactDialog,
);
