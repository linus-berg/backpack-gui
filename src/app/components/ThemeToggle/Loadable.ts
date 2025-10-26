/**
 *
 * Asynchronously loads the component for AddArtifactForm
 *
 */

import { lazyLoad } from 'utils/loadable';

export const ThemeToggle = lazyLoad(
  () => import('./index'),
  module => module.ThemeToggle,
);
