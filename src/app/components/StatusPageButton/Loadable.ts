/**
 *
 * Asynchronously loads the component for ValidateAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const StatusPageButton = lazyLoad(
  () => import('./index'),
  module => module.StatusPageButton,
);
