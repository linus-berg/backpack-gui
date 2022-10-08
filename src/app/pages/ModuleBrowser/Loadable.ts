/**
 *
 * Asynchronously loads the component for ModuleBrowser
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ModuleBrowser = lazyLoad(
  () => import('./index'),
  module => module.ModuleBrowser,
);
