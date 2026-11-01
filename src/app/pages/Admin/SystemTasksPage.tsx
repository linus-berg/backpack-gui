import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Button,
  Card,
  Classes,
  H5,
  Icon,
  IconName,
  Intent,
} from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { useConfirm } from 'app/context/ConfirmContext';
import { Page, PageHeader } from 'app/components/common/PageHeader';
import { LinkButton } from 'app/components/common/LinkButton';
import { notify } from 'utils/toaster';

const Tasks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
  gap: 16px;
  max-width: 1100px;
`;

const TaskCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  h5 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }
  p {
    margin: 0;
  }
  .task-action {
    margin-top: auto;
    padding-top: 4px;
  }
`;

interface TaskProps {
  icon: IconName;
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}

const Task = ({ icon, title, children, action }: TaskProps) => (
  <TaskCard>
    <H5>
      <Icon icon={icon} className={Classes.TEXT_MUTED} />
      {title}
    </H5>
    {children}
    <div className="task-action">{action}</div>
  </TaskCard>
);

/** Admin → System tasks: maintenance actions that cover every processor. */
export const SystemTasksPage = () => {
  const api = useBackpackApi();
  const confirm = useConfirm();

  const trackAll = useMutation({
    mutationFn: api.TrackAllArtifacts,
    meta: { errorTitle: 'Could not start tracking' },
    onSuccess: () =>
      notify.success(
        'Checking every artifact for updates. Progress is shown in System Events.',
      ),
  });
  const validateAll = useMutation({
    mutationFn: api.ValidateAllArtifacts,
    meta: { errorTitle: 'Could not start validation' },
    onSuccess: () =>
      notify.success(
        'Validating every artifact. Problems are reported in System Events.',
      ),
  });

  const runTrackAll = async () => {
    const ok = await confirm({
      title: 'Check all artifacts for updates?',
      message:
        'Every root artifact in every processor is checked upstream for new versions and dependencies. On large mirrors this queues a lot of work and can take hours.',
      confirmText: 'Check all',
      intent: Intent.WARNING,
      icon: 'refresh',
    });
    if (ok) {
      trackAll.mutate();
    }
  };

  const runValidateAll = async () => {
    const ok = await confirm({
      title: 'Validate all artifacts?',
      message:
        'The files of every known version in every processor are sent to the collectors again, and any that are missing from storage are downloaded. On large mirrors this can take hours.',
      confirmText: 'Validate all',
      intent: Intent.WARNING,
      icon: 'archive',
    });
    if (ok) {
      validateAll.mutate();
    }
  };

  return (
    <>
      <Helmet>
        <title>System tasks</title>
      </Helmet>
      <Page>
        <PageHeader
          icon="build"
          title="System tasks"
          description="Maintenance that covers every processor at once. To run it for a single processor or artifact, use its schedule or the artifact's actions."
        />
        <Tasks>
          <Task
            icon="refresh"
            title="Check all artifacts for updates"
            action={
              <Button
                icon="refresh"
                loading={trackAll.isPending}
                onClick={runTrackAll}
              >
                Check all…
              </Button>
            }
          >
            <p>
              Asks the processors again about every root artifact and collects
              any new versions and dependencies, as the schedules do for one
              processor.
            </p>
            <p className={Classes.TEXT_MUTED}>
              Dependencies are visited again only where the artifact that
              depends on them changed.
            </p>
          </Task>
          <Task
            icon="archive"
            title="Validate all artifacts"
            action={
              <Button
                icon="archive"
                loading={validateAll.isPending}
                onClick={runValidateAll}
              >
                Validate all…
              </Button>
            }
          >
            <p>
              Sends the versions Backpack already knows to the collectors again,
              without asking the processors, so files missing from storage are
              downloaded. Stored files are skipped.
            </p>
            <p className={Classes.TEXT_MUTED}>
              Use it after storage problems or when collectors were down.
            </p>
          </Task>
          <Task
            icon="pulse"
            title="Queues and events"
            action={
              <LinkButton to="/status" icon="arrow-right" text="Open Status" />
            }
          >
            <p>
              Watch these tasks progress, purge a queue, and read the system
              events on the Status page.
            </p>
          </Task>
        </Tasks>
      </Page>
    </>
  );
};
