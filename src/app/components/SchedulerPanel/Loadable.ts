/**
 * Asynchronously loads the component for SchedulerPanel
 */

import { lazyLoad } from 'utils/loadable';

export const SchedulerPanel = lazyLoad(
  () => import('./index'),
  module => module.SchedulerPanel,
);
