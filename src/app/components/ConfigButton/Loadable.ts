/**
 *
 * Asynchronously loads the component for ValidateAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ConfigButton = lazyLoad(
  () => import('./index'),
  module => module.ConfigButton,
);
