/**
 * Asynchronously loads the component for EventFeed
 */

import { lazyLoad } from 'utils/loadable';

export const EventFeed = lazyLoad(
  () => import('./index'),
  module => module.EventFeed,
);
