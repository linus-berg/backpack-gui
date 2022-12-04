/**
 *
 * Asynchronously loads the component for ModuleBrowser
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ProcessorBrowser = lazyLoad(
  () => import('./index'),
  module => module.ProcessorBrowser,
);
