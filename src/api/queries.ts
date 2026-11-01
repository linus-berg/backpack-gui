import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { Processor } from 'types/Processor';
import { isNotFound } from 'utils/errors';
import { ArtifactRef, useBackpackApi } from './backpack';

/**
 * Single source of truth for react-query cache keys. Prefix keys
 * (e.g. `artifactsForProcessor`) invalidate every variant below them.
 */
export const queryKeys = {
  user: ['user_info'] as const,
  processors: ['processors'] as const,
  allArtifacts: ['artifact_table'] as const,
  artifactsForProcessor: (processor: string) =>
    ['artifact_table', processor] as const,
  artifacts: (processor: string, onlyRoots: boolean) =>
    ['artifact_table', processor, onlyRoots] as const,
  artifactCounts: ['artifact_counts'] as const,
  artifact: (processor: string, id: string) =>
    ['artifact', processor, id] as const,
  preview: (processor: string, id: string, config: Record<string, string>) =>
    ['artifact_preview', processor, id, config] as const,
  pendingApprovals: ['pending_approvals'] as const,
  allEvents: ['events'] as const,
  events: (limit: number) => ['events', limit] as const,
  schedules: ['schedules'] as const,
  queues: ['queue_status'] as const,
  news: ['news'] as const,
  apiKeys: ['api_keys'] as const,
};

/** All configured processors. */
export const useProcessors = () => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.processors,
    queryFn: () => api.GetAllProcessors().then(r => r.data),
  });
};

/** Artifact summaries for one processor. Keeps showing old rows while refetching. */
export const useArtifactSummaries = (processor: string, onlyRoots: boolean) => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.artifacts(processor, onlyRoots),
    queryFn: () =>
      api.GetAllProcessorArtifacts(processor, onlyRoots).then(r => r.data),
    placeholderData: keepPreviousData,
  });
};

/** Full artifact including versions and dependencies. */
export const useArtifact = (ref: ArtifactRef | null) => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.artifact(ref?.processor ?? '', ref?.id ?? ''),
    queryFn: () => api.GetArtifact(ref!).then(r => r.data),
    enabled: ref !== null,
    retry: (count, error) => !isNotFound(error) && count < 1,
  });
};

/**
 * Artifact counts of every processor in one request; the API counts them in
 * MongoDB, so no artifact lists are downloaded just to be counted.
 */
export const useArtifactCounts = () => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.artifactCounts,
    queryFn: () => api.GetArtifactCounts().then(r => r.data),
    staleTime: 60_000,
  });
};

/**
 * Root artifact count per processor, undefined until the counts have loaded.
 * A processor the API didn't report (e.g. added a moment ago) counts as 0.
 */
export const useRootArtifactCounts = (processors: Processor[] | undefined) => {
  const query = useArtifactCounts();
  const roots = new Map((query.data ?? []).map(c => [c.processor, c.roots]));
  const counts: Record<string, number | undefined> = {};
  (processors ?? []).forEach(p => {
    counts[p.id] = query.data ? roots.get(p.id) ?? 0 : undefined;
  });
  return counts;
};

export const usePendingApprovals = (options: { enabled?: boolean } = {}) => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.pendingApprovals,
    queryFn: () => api.GetPendingArtifacts().then(r => r.data),
    refetchInterval: 30_000,
    enabled: options.enabled ?? true,
  });
};

export const useEvents = (limit = 100, refetchInterval = 10_000) => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.events(limit),
    queryFn: () => api.GetEvents(limit).then(r => r.data),
    refetchInterval,
    placeholderData: keepPreviousData,
  });
};

export const useQueueStatus = (refetchInterval = 5_000) => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.queues,
    queryFn: () => api.GetQueueStatus().then(r => r.data),
    refetchInterval,
  });
};

export const useSchedules = () => {
  const api = useBackpackApi();
  return useQuery({
    queryKey: queryKeys.schedules,
    queryFn: () => api.GetSchedules().then(r => r.data),
    refetchInterval: 10_000,
  });
};

/** Invalidates everything that changes when artifacts are added or removed. */
export const useInvalidateArtifacts = () => {
  const client = useQueryClient();
  return useCallback(
    (processor?: string) => {
      client.invalidateQueries({
        queryKey: processor
          ? queryKeys.artifactsForProcessor(processor)
          : queryKeys.allArtifacts,
      });
      client.invalidateQueries({ queryKey: queryKeys.artifactCounts });
      client.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
      client.invalidateQueries({ queryKey: queryKeys.allEvents });
    },
    [client],
  );
};
