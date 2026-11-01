/**
 * Asynchronously loads the pages of the Admin section. The processor and
 * API key pages are loaded through their own Loadable files.
 */

import { lazyLoad } from 'utils/loadable';

export const AdminLayout = lazyLoad(
  () => import('./AdminLayout'),
  module => module.AdminLayout,
);

export const SchedulesPage = lazyLoad(
  () => import('./SchedulesPage'),
  module => module.SchedulesPage,
);

export const AnnouncementsPage = lazyLoad(
  () => import('./AnnouncementsPage'),
  module => module.AnnouncementsPage,
);

export const JobsPage = lazyLoad(
  () => import('./JobsPage'),
  module => module.JobsPage,
);

export const SystemTasksPage = lazyLoad(
  () => import('./SystemTasksPage'),
  module => module.SystemTasksPage,
);
