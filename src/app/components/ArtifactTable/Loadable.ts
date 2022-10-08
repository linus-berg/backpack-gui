/**
 *
 * Asynchronously loads the component for ArtifactTable
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ArtifactTable = lazyLoad(
  () => import('./index'),
  module => module.ArtifactTable,
);
