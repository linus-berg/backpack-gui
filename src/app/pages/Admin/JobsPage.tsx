import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  H5,
  HTMLSelect,
  HTMLTable,
  Icon,
  Intent,
  ProgressBar,
  Radio,
  RadioGroup,
  Tag,
  Tooltip,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useActiveJobs, useProcessors } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { DateTime } from 'app/components/common/DateTime';
import {
  Page,
  PageHeader,
  SectionHeader,
} from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';
import { Job, JobKind } from 'types/Job';
import {
  isActiveJob,
  JOB_STATES,
  jobArtifacts,
  jobDuration,
  jobProgress,
  jobRemaining,
  jobTitle,
} from 'utils/jobs';
import { notify } from 'utils/toaster';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1100px;
`;

const JobCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .top {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .top h5 {
    margin: 0;
  }
  .top .actions {
    margin-left: auto;
  }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    font-variant-numeric: tabular-nums;
  }
  p {
    margin: 0;
  }
`;

const Table = styled(HTMLTable)`
  width: 100%;

  td.num,
  th.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    white-space: nowrap;
  }
  /* Details takes the remaining width and is cut off, in full on hover. */
  td.details {
    width: 100%;
    max-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  td.details .details-tip {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StateTag = ({ job }: { job: Job }) => {
  const state = JOB_STATES[job.state] ?? JOB_STATES.failed;
  return (
    <Tag minimal intent={state.intent} icon={state.icon}>
      {job.cancel_requested && job.state === 'running'
        ? 'Cancelling…'
        : state.label}
    </Tag>
  );
};

const StartedBy = ({ job }: { job: Job }) => (
  <span>
    {job.scheduled && (
      <Tooltip content="Started by its schedule">
        <Icon
          icon="calendar"
          size={12}
          className={Classes.TEXT_MUTED}
          style={{ marginRight: 6 }}
        />
      </Tooltip>
    )}
    {job.started_by}
  </span>
);

const useCancel = () => {
  const api = useBackpackApi();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const mutation = useMutation({
    mutationFn: api.CancelJob,
    meta: { errorTitle: 'Could not cancel the job' },
    onSuccess: res => {
      notify.info(
        res.data.state === 'cancelled'
          ? `${jobTitle(res.data)} was cancelled.`
          : `${jobTitle(res.data)} stops after the artifact it is sending.`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
  const cancel = async (job: Job) => {
    const ok = await confirm({
      title: `Cancel ${jobTitle(job)}?`,
      message:
        job.state === 'waiting'
          ? 'It hasn’t started yet. A scheduled re-track runs again at its next scheduled time.'
          : 'Artifacts already sent are still processed; the rest are not sent. You can start the job again later.',
      confirmText: 'Cancel job',
      cancelText: 'Keep running',
      intent: Intent.DANGER,
      icon: 'disable',
    });
    if (ok) {
      mutation.mutate(job.id);
    }
  };
  return { cancel, mutation };
};

const RunningJob = ({ job }: { job: Job }) => {
  const { cancel, mutation } = useCancel();
  const progress = jobProgress(job);
  const remaining = jobRemaining(job);
  return (
    <JobCard aria-label={`Running job: ${jobTitle(job)}`}>
      <div className="top">
        <Icon
          icon={job.kind === 'validate' ? 'archive' : 'refresh'}
          className={Classes.TEXT_MUTED}
        />
        <H5>{jobTitle(job)}</H5>
        <StateTag job={job} />
        <div className="actions">
          <Button
            variant="minimal"
            intent={Intent.DANGER}
            icon="disable"
            text="Cancel…"
            disabled={job.cancel_requested}
            loading={mutation.isPending}
            onClick={() => cancel(job)}
          />
        </div>
      </div>
      <ProgressBar
        value={progress}
        intent={job.failed > 0 ? Intent.WARNING : Intent.PRIMARY}
        aria-label="Progress"
      />
      <div className="stats">
        <span>
          {progress === undefined ? (
            'Counting artifacts…'
          ) : (
            <>
              <b>{job.done.toLocaleString()}</b> of {job.total.toLocaleString()}{' '}
              artifacts · {Math.floor(progress * 100)}%
            </>
          )}
        </span>
        {job.current_processor && !job.processor && (
          <span className={Classes.TEXT_MUTED}>
            Now: <b>{job.current_processor}</b>
          </span>
        )}
        {remaining && (
          <span className={Classes.TEXT_MUTED}>About {remaining} left</span>
        )}
        <span className={Classes.TEXT_MUTED}>
          Started by <StartedBy job={job} />{' '}
          <DateTime value={job.started_at} mode="relative" />
        </span>
        {job.failed > 0 && (
          <Tooltip content={job.message ?? ''} disabled={!job.message}>
            <span style={{ color: 'var(--warning-text)' }}>
              <Icon icon="warning-sign" size={12} />{' '}
              {job.failed.toLocaleString()} failed
            </span>
          </Tooltip>
        )}
      </div>
      <p className={Classes.TEXT_MUTED}>
        It ends once every artifact has been sent on. The processors and
        collectors then work through their queues; follow them on the{' '}
        <Link to="/status">Status page</Link>.
      </p>
    </JobCard>
  );
};

const WaitingJobs = ({ jobs }: { jobs: Job[] }) => {
  const { cancel, mutation } = useCancel();
  return (
    <JobCard aria-label="Waiting jobs">
      <div className="top">
        <Icon icon="time" className={Classes.TEXT_MUTED} />
        <H5>Waiting</H5>
        <span className={Classes.TEXT_MUTED}>
          Scheduled re-tracks start when the running job ends.
        </span>
      </div>
      {jobs.map(job => (
        <div className="top" key={job.id}>
          <span>{jobTitle(job)}</span>
          <StateTag job={job} />
          <span className={Classes.TEXT_MUTED}>
            {job.message ?? 'Waiting for the running job.'}
          </span>
          <div className="actions">
            <Button
              variant="minimal"
              size="small"
              icon="disable"
              text="Cancel…"
              loading={mutation.isPending && mutation.variables === job.id}
              onClick={() => cancel(job)}
            />
          </div>
        </div>
      ))}
    </JobCard>
  );
};

const StartJobDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const api = useBackpackApi();
  const queryClient = useQueryClient();
  const processors = useProcessors();
  const [kind, setKind] = useState<JobKind>('validate');
  const [processor, setProcessor] = useState('');
  const start = useMutation({
    mutationFn: api.StartJob,
    meta: { errorTitle: 'Could not start the job' },
    onSuccess: res => {
      notify.success(`${jobTitle(res.data)} started in the background.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      onClose();
    },
  });
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Start a job"
      icon="play"
      style={{ width: 520 }}
    >
      <DialogBody>
        <RadioGroup
          label="Job"
          selectedValue={kind}
          onChange={e => setKind(e.currentTarget.value as JobKind)}
        >
          <Radio value="validate">
            <b>Validate</b>
            <span className={Classes.TEXT_MUTED}>
              {' '}
              · send the known versions to the collectors again, so missing
              files are downloaded
            </span>
          </Radio>
          <Radio value="track">
            <b>Re-track</b>
            <span className={Classes.TEXT_MUTED}>
              {' '}
              · ask the processors again about every root artifact, for new
              versions and dependencies
            </span>
          </Radio>
        </RadioGroup>
        <FormGroup label="Processors" labelFor="job-processor">
          <HTMLSelect
            id="job-processor"
            value={processor}
            onChange={e => setProcessor(e.currentTarget.value)}
            fill
          >
            <option value="">All processors</option>
            {(processors.data ?? []).map(p => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            ))}
          </HTMLSelect>
        </FormGroup>
        <p className={Classes.TEXT_MUTED} style={{ margin: 0 }}>
          It runs in the background, so you can leave this page. Only one job
          runs at a time.
        </p>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button text="Close" onClick={onClose} />
            <Button
              intent={Intent.PRIMARY}
              icon="play"
              text="Start"
              loading={start.isPending}
              onClick={() =>
                start.mutate({ kind, processor: processor || null })
              }
            />
          </>
        }
      />
    </Dialog>
  );
};

/** Admin → Jobs: background re-tracks and validations, one at a time. */
export const JobsPage = () => {
  const { running, waiting, query } = useActiveJobs();
  const [isStartOpen, setIsStartOpen] = useState(false);
  /* Running and waiting jobs have their own cards above. */
  const jobs = (query.data ?? []).filter(job => !isActiveJob(job));

  return (
    <>
      <Helmet>
        <title>Jobs</title>
      </Helmet>
      <Page>
        <PageHeader
          icon="history"
          title="Jobs"
          description="Re-tracks and validations run in the background, one at a time. Scheduled re-tracks wait their turn."
          actions={
            <Tooltip
              content={
                running
                  ? `${jobTitle(
                      running,
                    )} is running. Wait for it to finish, or cancel it.`
                  : ''
              }
              disabled={!running}
            >
              <Button
                icon="play"
                intent={Intent.PRIMARY}
                text="Start a job…"
                disabled={!!running}
                onClick={() => setIsStartOpen(true)}
              />
            </Tooltip>
          }
        />
        <Stack>
          {query.isLoading ? (
            <LoadingState />
          ) : query.isError && !query.data ? (
            <QueryErrorState
              title="Couldn't load the jobs"
              error={query.error}
              onRetry={() => query.refetch()}
            />
          ) : (
            <>
              {running && <RunningJob job={running} />}
              {waiting.length > 0 && <WaitingJobs jobs={waiting} />}
              <section aria-labelledby="job-history">
                <SectionHeader
                  icon="history"
                  title={<span id="job-history">History</span>}
                />
                {jobs.length === 0 ? (
                  <EmptyState
                    icon="history"
                    title={
                      running || waiting.length
                        ? 'No finished jobs yet'
                        : 'No jobs yet'
                    }
                    description="Start one here or on the System tasks page. Scheduled re-tracks show up here too."
                  />
                ) : (
                  <ScrollTableContainer>
                    <Table compact striped>
                      <thead>
                        <tr>
                          <th>Job</th>
                          <th>State</th>
                          <th>Started by</th>
                          <th>Started</th>
                          <th className="num">Duration</th>
                          <th className="num">Artifacts</th>
                          <th className="num">Failed</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => (
                          <tr key={job.id}>
                            <td>{jobTitle(job)}</td>
                            <td>
                              <StateTag job={job} />
                            </td>
                            <td>
                              <StartedBy job={job} />
                            </td>
                            <td>
                              <DateTime
                                value={job.started_at ?? job.created_at}
                                mode="relative"
                              />
                            </td>
                            <td className="num">{jobDuration(job) ?? '—'}</td>
                            <td className="num">{jobArtifacts(job)}</td>
                            <td
                              className="num"
                              style={
                                job.failed > 0
                                  ? { color: 'var(--warning-text)' }
                                  : undefined
                              }
                            >
                              {job.failed > 0
                                ? job.failed.toLocaleString()
                                : '—'}
                            </td>
                            <td className={`details ${Classes.TEXT_MUTED}`}>
                              {job.message ? (
                                <Tooltip
                                  content={job.message}
                                  className="details-tip"
                                  targetTagName="div"
                                >
                                  {job.message}
                                </Tooltip>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ScrollTableContainer>
                )}
              </section>
            </>
          )}
        </Stack>
      </Page>
      <StartJobDialog
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
      />
    </>
  );
};
