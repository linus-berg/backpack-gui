/** `track` re-tracks root artifacts; `validate` re-collects missing files. */
export type JobKind = 'track' | 'validate';

export type JobState =
  | 'waiting'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'interrupted'
  | 'skipped';

/** A background job, from `/api/jobs`. Only one runs at a time. */
export interface Job {
  id: string;
  kind: JobKind;
  /** One processor, or null for every processor. */
  processor: string | null;
  state: JobState;
  /** A user name, or "Scheduler". */
  started_by: string;
  scheduled: boolean;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  heartbeat_at: string;
  /** The pod running it. */
  host?: string | null;
  /** Artifacts to handle, counted when it starts. */
  total: number;
  /** Artifacts handled, including failed ones. */
  done: number;
  failed: number;
  current_processor?: string | null;
  /** The latest problem, or a summary once it ends. */
  message?: string | null;
  cancel_requested: boolean;
  cancelled_by?: string | null;
}
