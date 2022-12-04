/**
 *
 * Asynchronously loads the component for AddArtifactForm
 *
 */

import { lazyLoad } from 'utils/loadable';

export const AddArtifactForm = lazyLoad(
  () => import('./index'),
  module => module.AddArtifactForm,
);
