/**
 * Asynchronously loads the component for ApprovalsPage
 */

import { lazyLoad } from 'utils/loadable';

export const ApprovalsPage = lazyLoad(
  () => import('./index'),
  module => module.ApprovalsPage,
);
