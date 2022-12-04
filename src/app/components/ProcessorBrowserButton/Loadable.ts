/**
 *
 * Asynchronously loads the component for ValidateAllButton
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ProcessorBrowserButton = lazyLoad(
  () => import('./index'),
  module => module.ProcessorBrowserButton,
);
