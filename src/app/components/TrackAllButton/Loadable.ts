/**
 *
 * Asynchronously loads the component for TrackAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const TrackAllButton = lazyLoad(
  () => import('./index'),
  module => module.TrackAllButton,
);
