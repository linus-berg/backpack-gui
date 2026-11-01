import { useAuth } from 'react-oidc-context';
import axios, { AxiosResponse } from 'axios';
import React, { createContext, useContext, useEffect } from 'react';
import { Artifact, ArtifactSummary } from 'types';
import type { AxiosInstance } from 'axios';
import { AuthInterceptor } from './AuthInterceptor';
import { BACKPACK_API } from './config';
import { Processor } from '../types/Processor';
import { ArtifactCount } from 'types/ArtifactCount';
import { QueueStatus } from '../types/QueueStatus';
import { InfrastructureHealth } from '../types/InfrastructureHealth';
import { Job, JobKind } from '../types/Job';
import { Event } from '../types/Event';
import { Schedule } from '../types/Schedule';
import { ScheduleValidationResult } from '../types/ScheduleValidationResult';
import { PendingArtifact } from '../types/PendingArtifact';
import { ApiKey } from '../types/ApiKey';
import { User } from '../types/User';
import { NewsPost } from '../types/NewsPost';
import { FullPageSpinner } from 'app/components/common/States';

export { BACKPACK_API };

const BACKPACK_ARTIFACTS = '/artifact';
const BACKPACK_PROCESSOR = '/processor';

const axios_ctx = createContext<AxiosInstance>({} as AxiosInstance);

const axios_instance = axios.create({
  baseURL: BACKPACK_API,
});

const interceptor = new AuthInterceptor();
axios_instance.interceptors.request.use(
  interceptor.Intercept.bind(interceptor),
);

/** Identifies an artifact within a processor. */
export interface ArtifactRef {
  id: string;
  processor: string;
}

/** Payload for adding or previewing an artifact. */
export interface ArtifactInput extends ArtifactRef {
  filter: string;
  config: Record<string, string>;
}

/**
 * Response body of `POST /artifact`. The API answers 200 for every outcome;
 * a `message` is present when the artifact went to the approval queue or was
 * already tracked.
 */
export type AddArtifactResponse = Partial<ArtifactInput> & {
  message?: string;
};

export const AxiosProvider = (props: { children: React.ReactNode }) => {
  const auth = useAuth();

  useEffect(() => {
    interceptor.SetToken(auth.user?.access_token ?? '');
  }, [auth.user?.access_token]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return <FullPageSpinner label="Signing in…" />;
  }

  return (
    <axios_ctx.Provider value={axios_instance}>
      {props.children}
    </axios_ctx.Provider>
  );
};

export const useAxios = () => {
  return useContext(axios_ctx);
};

export const useBackpackApi = () => {
  const backpack = useAxios();
  /* Getters */
  const GetAllProcessors = (): Promise<AxiosResponse<Processor[]>> => {
    return backpack.get<Processor[]>(BACKPACK_PROCESSOR + '/processors');
  };
  const GetQueueStatus = (): Promise<AxiosResponse<QueueStatus[]>> => {
    return backpack.get<QueueStatus[]>('/status/queue');
  };
  const GetInfrastructureHealth = (): Promise<
    AxiosResponse<InfrastructureHealth>
  > => {
    return backpack.get<InfrastructureHealth>('/status/health');
  };

  const GetUserInfo = (): Promise<AxiosResponse<User>> => {
    return backpack.get<User>('/auth/me');
  };

  const GetEvents = (limit = 100): Promise<AxiosResponse<Event[]>> => {
    return backpack.get<Event[]>('/event', { params: { limit } });
  };

  const GetSchedules = (): Promise<AxiosResponse<Schedule[]>> => {
    return backpack.get<Schedule[]>('/scheduler');
  };

  const GetApiKeys = (): Promise<AxiosResponse<ApiKey[]>> => {
    return backpack.get<ApiKey[]>('/apikey');
  };

  const CreateApiKey = ({
    name,
    is_admin,
  }: {
    name: string;
    is_admin: boolean;
  }): Promise<AxiosResponse<ApiKey>> => {
    return backpack.post('/apikey', { name: name, is_admin: is_admin });
  };

  const DeleteApiKey = (id: string): Promise<AxiosResponse<void>> => {
    return backpack.delete(`/apikey/${id}`);
  };

  const GetNewsPosts = (): Promise<AxiosResponse<NewsPost[]>> => {
    return backpack.get<NewsPost[]>('/news');
  };

  const CreateNewsPost = (
    post: Partial<NewsPost>,
  ): Promise<AxiosResponse<NewsPost>> => {
    return backpack.post('/news', post);
  };

  const DeleteNewsPost = (id: string): Promise<AxiosResponse<void>> => {
    return backpack.delete(`/news/${id}`);
  };

  /* Background jobs: one runs at a time; starting another answers 409. */
  const GetJobs = (limit = 50): Promise<AxiosResponse<Job[]>> => {
    return backpack.get<Job[]>('/jobs', { params: { limit } });
  };
  const StartJob = (input: {
    kind: JobKind;
    processor?: string | null;
  }): Promise<AxiosResponse<Job>> => {
    return backpack.post<Job>('/jobs', input);
  };
  const CancelJob = (id: string): Promise<AxiosResponse<Job>> => {
    return backpack.post<Job>(`/jobs/${encodeURIComponent(id)}/cancel`);
  };

  const UpdateSchedule = (schedule: Schedule): Promise<AxiosResponse<void>> => {
    return backpack.put('/scheduler', schedule);
  };

  const AddSchedule = (
    schedule: Omit<Schedule, 'id'>,
  ): Promise<AxiosResponse<void>> => {
    return backpack.post('/scheduler', schedule);
  };

  const DeleteSchedule = (id: string): Promise<AxiosResponse<void>> => {
    return backpack.delete(`/scheduler/${id}`);
  };

  const ValidateSchedule = (
    schedule: Partial<Schedule>,
  ): Promise<AxiosResponse<ScheduleValidationResult>> => {
    return backpack.post('/scheduler/validate', schedule);
  };

  const PurgeQueue = (queue_name: string): Promise<AxiosResponse<void>> => {
    return backpack.delete(`/status/queue/${queue_name}`);
  };

  /** Artifact counts of every processor, counted by the API in one request. */
  const GetArtifactCounts = (): Promise<AxiosResponse<ArtifactCount[]>> => {
    return backpack.get<ArtifactCount[]>(BACKPACK_ARTIFACTS + '/counts');
  };

  const GetAllProcessorArtifacts = (
    processor: string,
    only_roots: boolean,
  ): Promise<AxiosResponse<ArtifactSummary[]>> => {
    return backpack.get<ArtifactSummary[]>(BACKPACK_ARTIFACTS + '/all', {
      params: { processor, only_roots },
    });
  };

  const GetArtifact = ({
    processor,
    id,
  }: ArtifactRef): Promise<AxiosResponse<Artifact>> => {
    return backpack.get<Artifact>(BACKPACK_ARTIFACTS, {
      params: { processor, id },
    });
  };

  const DeleteArtifact = ({
    id,
    processor,
  }: ArtifactRef): Promise<AxiosResponse<void>> => {
    return backpack.delete(BACKPACK_ARTIFACTS, {
      data: {
        id: id,
        processor: processor,
      },
    });
  };

  const TrackArtifact = ({
    id,
    processor,
  }: ArtifactRef): Promise<AxiosResponse<string>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/track', {
      id: id,
      processor: processor,
    });
  };

  const ValidateArtifact = ({
    id,
    processor,
    force,
  }: ArtifactRef & { force: boolean }): Promise<AxiosResponse<string>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/validate', {
      id: id,
      processor: processor,
      force: force,
    });
  };

  const PreviewArtifact = (
    artifact: ArtifactInput,
  ): Promise<AxiosResponse<Artifact>> => {
    return backpack.post<Artifact>(BACKPACK_ARTIFACTS + '/preview', artifact);
  };

  const GetPendingArtifacts = (): Promise<AxiosResponse<PendingArtifact[]>> => {
    return backpack.get<PendingArtifact[]>(BACKPACK_ARTIFACTS + '/pending');
  };

  const ApproveArtifact = ({
    id,
    processor,
  }: ArtifactRef): Promise<AxiosResponse<{ message?: string }>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/approve', {
      id: id,
      processor: processor,
    });
  };

  const RejectArtifact = ({
    id,
    processor,
    reason,
  }: ArtifactRef & { reason?: string }): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/reject', {
      id: id,
      processor: processor,
      reason: reason || undefined,
    });
  };

  /* Add */
  const AddArtifact = (
    artifact: ArtifactInput,
  ): Promise<AxiosResponse<AddArtifactResponse>> => {
    return backpack.post(BACKPACK_ARTIFACTS, {
      id: artifact.id,
      processor: artifact.processor,
      filter: artifact.filter,
      config: artifact.config,
      versions: {},
      dependencies: {},
    });
  };
  /* Add Processor */
  const AddProcessor = ({
    processor_id,
    requires_approval,
    multi_add,
    is_external,
    preview_enabled,
  }: {
    processor_id: string;
    requires_approval: boolean;
    multi_add: boolean;
    is_external: boolean;
    preview_enabled: boolean;
  }): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_PROCESSOR, {
      processor_id: processor_id,
      requires_approval: requires_approval,
      multi_add: multi_add,
      is_external: is_external,
      preview_enabled: preview_enabled,
    });
  };

  const UpdateProcessor = (
    processor: Processor,
  ): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_PROCESSOR + '/update', {
      processor_id: processor.id,
      description: processor.description,
      config: processor.config,
      direct_collect: processor.direct_collect,
      requires_approval: processor.requires_approval,
      multi_add: processor.multi_add,
      is_external: processor.is_external,
      preview_enabled: processor.preview_enabled,
    });
  };

  const DeleteProcessor = (
    processor_id: string,
  ): Promise<AxiosResponse<void>> => {
    return backpack.delete(BACKPACK_PROCESSOR + '/' + processor_id);
  };

  return {
    GetQueueStatus,
    GetInfrastructureHealth,
    GetUserInfo,
    GetEvents,
    GetSchedules,
    AddSchedule,
    UpdateSchedule,
    DeleteSchedule,
    ValidateSchedule,
    GetApiKeys,
    CreateApiKey,
    DeleteApiKey,
    GetNewsPosts,
    CreateNewsPost,
    DeleteNewsPost,
    GetJobs,
    StartJob,
    CancelJob,
    PurgeQueue,
    AddProcessor,
    UpdateProcessor,
    DeleteProcessor,
    AddArtifact,
    GetArtifact,
    TrackArtifact,
    PreviewArtifact,
    DeleteArtifact,
    GetAllProcessors,
    GetAllProcessorArtifacts,
    GetArtifactCounts,
    ValidateArtifact,
    GetPendingArtifacts,
    ApproveArtifact,
    RejectArtifact,
  };
};
