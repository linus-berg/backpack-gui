import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FillPage } from 'app/components/common/PageHeader';
import { SchedulerPanel } from 'app/components/SchedulerPanel/Loadable';

/** Admin → Schedules: add, edit, delete and run tracking schedules. */
export const SchedulesPage = () => (
  <>
    <Helmet>
      <title>Schedules</title>
    </Helmet>
    <FillPage>
      <SchedulerPanel variant="page" />
    </FillPage>
  </>
);
