/**
 *
 * Asynchronously loads the component for AddArtifactForm
 *
 */

import { lazyLoad } from 'utils/loadable';

export const QueueStatusTable = lazyLoad(
  () => import('./index'),
  module => module.QueueStatusTable,
);
