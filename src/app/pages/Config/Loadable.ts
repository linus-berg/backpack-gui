/**
 *
 * Asynchronously loads the component for Administration
 *
 */

import { lazyLoad } from 'utils/loadable';

export const Config = lazyLoad(
  () => import('./index'),
  module => module.Config,
);
