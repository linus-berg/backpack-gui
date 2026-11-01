import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Callout,
  Card,
  Classes,
  H5,
  Icon,
  IconName,
  Intent,
  Tooltip,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useActiveJobs } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { Page, PageHeader } from 'app/components/common/PageHeader';
import { LinkButton } from 'app/components/common/LinkButton';
import { JobKind } from 'types/Job';
import { jobProgress, jobTitle } from 'utils/jobs';
import { notify } from 'utils/toaster';

const Running = styled(Callout)`
  max-width: 1100px;
  margin-bottom: 16px;

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .row > :last-child {
    margin-left: auto;
  }
`;

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
    display: flex;
    gap: 8px;
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

/**
 * Admin → System tasks: maintenance actions that cover every processor. They
 * run as background jobs, one at a time (see the Jobs page).
 */
export const SystemTasksPage = () => {
  const api = useBackpackApi();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { running } = useActiveJobs();
  const progress = running ? jobProgress(running) : undefined;

  const start = useMutation({
    mutationFn: api.StartJob,
    meta: { errorTitle: 'Could not start the job' },
    onSuccess: res => {
      notify.success(`${jobTitle(res.data)} started in the background.`, {
        action: { text: 'View job', onClick: () => navigate('/admin/jobs') },
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
  const isStarting = (kind: JobKind) =>
    start.isPending && start.variables?.kind === kind;
  const busy = running
    ? `${jobTitle(
        running,
      )} is running. Wait for it to finish, or cancel it on the Jobs page.`
    : '';

  const runTrackAll = async () => {
    const ok = await confirm({
      title: 'Check all artifacts for updates?',
      message:
        'Every root artifact in every processor is checked upstream for new versions and dependencies. On large mirrors this queues a lot of work. It runs in the background, so you can leave this page and follow it on the Jobs page.',
      confirmText: 'Check all',
      intent: Intent.WARNING,
      icon: 'refresh',
    });
    if (ok) {
      start.mutate({ kind: 'track' });
    }
  };

  const runValidateAll = async () => {
    const ok = await confirm({
      title: 'Validate all artifacts?',
      message:
        'The files of every known version in every processor are sent to the collectors again, and any that are missing from storage are downloaded. It runs in the background, so you can leave this page and follow it on the Jobs page.',
      confirmText: 'Validate all',
      intent: Intent.WARNING,
      icon: 'archive',
    });
    if (ok) {
      start.mutate({ kind: 'validate' });
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
          description="Maintenance that covers every processor at once. Each runs as a background job; only one job runs at a time."
        />
        {running && (
          <Running intent={Intent.PRIMARY} icon="refresh">
            <div className="row">
              <span>
                <b>{jobTitle(running)}</b> is running
                {progress !== undefined &&
                  ` · ${running.done.toLocaleString()} of ${running.total.toLocaleString()} artifacts (${Math.floor(
                    progress * 100,
                  )}%)`}
                . The tasks below can start once it has finished.
              </span>
              <LinkButton to="/admin/jobs" icon="arrow-right" text="View job" />
            </div>
          </Running>
        )}
        <Tasks>
          <Task
            icon="refresh"
            title="Check all artifacts for updates"
            action={
              <Tooltip content={busy} disabled={!running}>
                <Button
                  icon="refresh"
                  loading={isStarting('track')}
                  disabled={!!running}
                  onClick={runTrackAll}
                >
                  Check all…
                </Button>
              </Tooltip>
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
              <Tooltip content={busy} disabled={!running}>
                <Button
                  icon="archive"
                  loading={isStarting('validate')}
                  disabled={!!running}
                  onClick={runValidateAll}
                >
                  Validate all…
                </Button>
              </Tooltip>
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
            icon="history"
            title="Jobs and queues"
            action={
              <>
                <LinkButton to="/admin/jobs" icon="history" text="Open Jobs" />
                <LinkButton to="/status" icon="pulse" text="Open Status" />
              </>
            }
          >
            <p>
              Follow a running job, cancel it, or start one for a single
              processor on the Jobs page.
            </p>
            <p className={Classes.TEXT_MUTED}>
              A job ends once every artifact has been sent on; the queues it
              fills, and the system events, are on the Status page.
            </p>
          </Task>
        </Tasks>
      </Page>
    </>
  );
};
