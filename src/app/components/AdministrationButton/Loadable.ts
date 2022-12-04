/**
 *
 * Asynchronously loads the component for ValidateAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const AdministrationButton = lazyLoad(
  () => import('./index'),
  module => module.AdministrationButton,
);
