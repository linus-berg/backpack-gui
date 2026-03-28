/**
 * Asynchronously loads the component for ApiKeyPage
 */

import { lazyLoad } from 'utils/loadable';

export const ApiKeyPage = lazyLoad(
  () => import('./index'),
  module => module.ApiKeyPage,
);
