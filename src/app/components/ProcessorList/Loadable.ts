/**
 *
 * Asynchronously loads the component for ProcessorList
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ProcessorList = lazyLoad(
  () => import('./index'),
  module => module.ProcessorList,
);
