/**
 *
 * Asynchronously loads the component for ProcessorEditor
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ProcessorEditor = lazyLoad(
  () => import('./index'),
  module => module.ProcessorEditor,
);
