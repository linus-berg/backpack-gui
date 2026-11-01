import { QueueStatus } from 'types/QueueStatus';
import { getQueueHealth, QueueHealth } from 'utils/queueHealth';

/** Where a queue belongs on the Status page. */
export type QueueGroupId =
  | 'gateway'
  | 'router'
  | 'processors'
  | 'collectors'
  | 'other';

export const QUEUE_GROUPS: {
  id: QueueGroupId;
  label: string;
  description: string;
}[] = [
  {
    id: 'gateway',
    label: 'Gateway',
    description: 'Ingest requests, processor results and system events.',
  },
  {
    id: 'router',
    label: 'Router',
    description: 'Sends each file to the collector for its URL scheme.',
  },
  {
    id: 'processors',
    label: 'Processors',
    description: 'One per ecosystem; resolve versions, files and dependencies.',
  },
  {
    id: 'collectors',
    label: 'Collectors',
    description: 'Download files and store them, one per URL scheme.',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Queues Backpack doesn’t recognise.',
  },
];

/** Readable names for the gateway's queues (Core.Kernel/Endpoints.cs). */
const GATEWAY_QUEUES: Record<string, string> = {
  'gateway-ingest-unprocessed': 'Ingest requests',
  'gateway-ingest-processed': 'Processor results',
  'gateway-ingest-processed-raw': 'Processor results (plain JSON)',
  'system-event': 'System events',
};

/** Readable names for the collectors, by URL scheme. */
const COLLECTOR_NAMES: Record<string, string> = {
  http: 'HTTP',
  https: 'HTTPS',
  git: 'Git',
  docker: 'Container images (docker://)',
  oci: 'Container images (oci://)',
  'docker-archive': 'Docker archives',
  hf: 'Hugging Face',
  wget: 'Website mirror (wget)',
  rsync: 'Rsync',
};

export interface QueueInfo {
  group: QueueGroupId;
  /** What the queue is, e.g. "npm" or "HTTPS". */
  label: string;
  /** For processor queues: the processor ID, for linking to its artifacts. */
  processor?: string;
  /** True for a processor's `-preview` queue. */
  preview?: boolean;
}

/**
 * Interprets a queue name: `processor-<id>[-preview]`,
 * `collector-<scheme>`, `collector-router`, or one of the gateway queues.
 * @param name The RabbitMQ queue name.
 */
export const describeQueue = (name: string): QueueInfo => {
  if (GATEWAY_QUEUES[name]) {
    return { group: 'gateway', label: GATEWAY_QUEUES[name] };
  }
  if (name === 'collector-router') {
    return { group: 'router', label: 'Router' };
  }
  if (name.startsWith('processor-')) {
    const rest = name.slice('processor-'.length);
    return rest.endsWith('-preview')
      ? {
          group: 'processors',
          label: 'Preview',
          processor: rest.slice(0, -'-preview'.length),
          preview: true,
        }
      : { group: 'processors', label: rest, processor: rest };
  }
  if (name.startsWith('collector-')) {
    const scheme = name.slice('collector-'.length);
    return { group: 'collectors', label: COLLECTOR_NAMES[scheme] ?? scheme };
  }
  return { group: 'other', label: name };
};

export interface QueueRow {
  queue: QueueStatus;
  info: QueueInfo;
  health: QueueHealth;
  /** For processor rows: the processor's preview queue, folded under it. */
  preview?: QueueRow;
}

export interface QueueGroup {
  id: QueueGroupId;
  label: string;
  description: string;
  rows: QueueRow[];
  /** Rows (including folded preview queues) that need attention. */
  attention: number;
}

/** Health ranks 0 (no consumers) and 1 (backlog growing) need attention. */
export const needsAttention = (row: QueueRow) => row.health.rank <= 1;

/**
 * Groups queues for the Status page, worst health first within a group, and
 * folds each processor's preview queue under the processor's main queue.
 * @param queues Queue statistics from the API.
 * @param keep Optional filter; a processor row is kept if it or its preview
 * queue matches.
 */
export const groupQueues = (
  queues: QueueStatus[],
  keep?: (row: QueueRow) => boolean,
): QueueGroup[] => {
  const rows: QueueRow[] = queues.map(queue => ({
    queue,
    info: describeQueue(queue.name),
    health: getQueueHealth(queue),
  }));

  const previews = new Map(
    rows.filter(r => r.info.preview).map(r => [r.info.processor!, r]),
  );
  const top: QueueRow[] = rows
    .filter(r => !r.info.preview)
    .map(r =>
      r.info.processor && previews.has(r.info.processor)
        ? { ...r, preview: previews.get(r.info.processor) }
        : r,
    );
  // A preview queue whose processor has no main queue is shown on its own.
  const mains = new Set(top.map(r => r.info.processor).filter(Boolean));
  previews.forEach((row, processor) => {
    if (!mains.has(processor)) {
      top.push({
        ...row,
        info: { ...row.info, label: `${processor} (preview)` },
      });
    }
  });

  const worst = (r: QueueRow) =>
    Math.min(r.health.rank, r.preview?.health.rank ?? Number.POSITIVE_INFINITY);
  const matches = (r: QueueRow) =>
    !keep || keep(r) || (r.preview !== undefined && keep(r.preview));

  return QUEUE_GROUPS.map(group => {
    const groupRows = top
      .filter(r => r.info.group === group.id && matches(r))
      .sort(
        (a, b) =>
          worst(a) - worst(b) || a.info.label.localeCompare(b.info.label),
      );
    return {
      ...group,
      rows: groupRows,
      attention: groupRows.reduce(
        (sum, r) =>
          sum +
          (needsAttention(r) ? 1 : 0) +
          (r.preview && needsAttention(r.preview) ? 1 : 0),
        0,
      ),
    };
  }).filter(group => group.rows.length > 0);
};
