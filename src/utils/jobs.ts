import { IconName, Intent } from '@blueprintjs/core';
import { Job, JobState } from 'types/Job';

export const isActiveJob = (job: Job) =>
  job.state === 'waiting' || job.state === 'running';

/** "Validate all artifacts", "Re-track npm". */
export const jobTitle = (job: Pick<Job, 'kind' | 'processor'>) =>
  `${job.kind === 'validate' ? 'Validate' : 'Re-track'} ${
    job.processor ?? 'all artifacts'
  }`;

export const JOB_STATES: Record<
  JobState,
  { label: string; intent: Intent; icon: IconName }
> = {
  waiting: { label: 'Waiting', intent: Intent.NONE, icon: 'time' },
  running: { label: 'Running', intent: Intent.PRIMARY, icon: 'refresh' },
  succeeded: { label: 'Finished', intent: Intent.SUCCESS, icon: 'tick' },
  failed: { label: 'Failed', intent: Intent.DANGER, icon: 'error' },
  cancelled: { label: 'Cancelled', intent: Intent.WARNING, icon: 'disable' },
  interrupted: { label: 'Interrupted', intent: Intent.DANGER, icon: 'offline' },
  skipped: { label: 'Skipped', intent: Intent.WARNING, icon: 'fast-forward' },
};

/** 0–1, or undefined while the artifacts are still being counted. */
export const jobProgress = (job: Job): number | undefined =>
  job.total > 0 ? Math.min(1, job.done / job.total) : undefined;

/** "45 s", "4 min 12 s", "2 h 5 min". */
export const formatJobDuration = (ms: number): string => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) {
    return `${Math.max(1, seconds)} s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return seconds % 60 ? `${minutes} min ${seconds % 60} s` : `${minutes} min`;
  }
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

const since = (value?: string | null) =>
  value ? Date.now() - Date.parse(value) : 0;

/** How long it ran, or has been running. */
export const jobDuration = (job: Job): string | null => {
  if (!job.started_at) {
    return null;
  }
  const end = job.finished_at ? Date.parse(job.finished_at) : Date.now();
  return formatJobDuration(end - Date.parse(job.started_at));
};

/**
 * Time left at the rate so far, once there is enough to go on (10 seconds
 * and 1% in).
 */
export const jobRemaining = (job: Job): string | null => {
  const elapsed = since(job.started_at);
  const progress = jobProgress(job);
  if (!progress || progress >= 1 || elapsed < 10_000 || progress < 0.01) {
    return null;
  }
  return formatJobDuration((elapsed / progress) * (1 - progress));
};

/** "7,025 of 60,000" while running or stopped early, "60,000" when done. */
export const jobArtifacts = (job: Job): string =>
  job.total === 0 && job.done === 0
    ? '—'
    : job.state === 'succeeded' || job.done >= job.total
    ? job.done.toLocaleString()
    : `${job.done.toLocaleString()} of ${job.total.toLocaleString()}`;
