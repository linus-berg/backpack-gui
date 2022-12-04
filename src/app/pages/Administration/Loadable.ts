/**
 *
 * Asynchronously loads the component for Administration
 *
 */

import { lazyLoad } from 'utils/loadable';

export const Administration = lazyLoad(
  () => import('./index'),
  module => module.Administration,
);
