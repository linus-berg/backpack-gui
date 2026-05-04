import { useAuth } from 'react-oidc-context';
import axios, { AxiosResponse } from 'axios';
import React, { createContext, useContext, useEffect } from 'react';
import { Artifact } from 'types';
import type { AxiosInstance } from 'axios';
import { Spinner } from '@blueprintjs/core';
import { AuthInterceptor } from './AuthInterceptor';
import { Processor } from '../types/Processor';
import { QueueStatus } from '../types/QueueStatus';
import { Event } from '../types/Event';
import { Schedule } from '../types/Schedule';
import { PendingArtifact } from '../types/PendingArtifact';
import { ApiKey } from '../types/ApiKey';
import { User } from '../types/User';
import { NewsPost } from '../types/NewsPost';

export const BACKPACK_API =
  window.location.protocol + '//' + window.location.hostname + ':8004/api';
const BACKPACK_ARTIFACTS = '/artifact';

const BACKPACK_PROCESSOR = '/processor';

const axios_ctx = createContext<AxiosInstance>({} as AxiosInstance);

const axios_instance = axios.create({
  baseURL: BACKPACK_API,
});

const interceptor = new AuthInterceptor();
const interceptor_hdl = axios_instance.interceptors.request.use(
  interceptor.Intercept.bind(interceptor),
);

export const AxiosProvider = props => {
  const auth = useAuth();

  useEffect(() => {
    interceptor.SetToken(auth.user?.access_token ?? '');
  }, [auth.user?.access_token]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return <Spinner />;
  }

  return (
    <axios_ctx.Provider value={axios_instance}>
      {auth.isAuthenticated ? props.children : <Spinner />}
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

  const GetUserInfo = (): Promise<AxiosResponse<User>> => {
    return backpack.get<User>('/auth/me');
  };

  const GetEvents = (): Promise<AxiosResponse<Event[]>> => {
    return backpack.get<Event[]>('/event');
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

  const TriggerSync = (processor: string): Promise<AxiosResponse<void>> => {
    return backpack.post(`/scheduler/trigger/${processor}`);
  };

  const UpdateSchedule = (schedule: Schedule): Promise<AxiosResponse<void>> => {
    return backpack.put('/scheduler', schedule);
  };

  const AddSchedule = (schedule: Schedule): Promise<AxiosResponse<void>> => {
    return backpack.post('/scheduler', schedule);
  };

  const DeleteSchedule = (id: string): Promise<AxiosResponse<void>> => {
    return backpack.delete(`/scheduler/${id}`);
  };

  const ValidateSchedule = (
    schedule: Schedule,
  ): Promise<AxiosResponse<void>> => {
    return backpack.post('/scheduler/validate', schedule);
  };

  const PurgeQueue = (queue_name: string): Promise<AxiosResponse<void>> => {
    return backpack.delete(`/status/queue/${queue_name}`);
  };

  const GetAllProcessorArtifacts = ({
    queryKey,
  }: {
    queryKey: any[];
  }): Promise<AxiosResponse<Artifact[]>> => {
    return backpack.get<Artifact[]>(BACKPACK_ARTIFACTS + '/all', {
      params: { processor: queryKey[1], only_roots: queryKey[2] },
    });
  };

  const GetArtifact = ({
    queryKey,
  }: {
    queryKey: any[];
  }): Promise<AxiosResponse<Artifact>> => {
    return backpack.get<Artifact>(BACKPACK_ARTIFACTS, {
      params: { processor: queryKey[1], id: queryKey[2] },
    });
  };

  const DeleteArtifact = ({
    id,
    processor,
  }: {
    id: string;
    processor: string;
  }): Promise<AxiosResponse<void>> => {
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
  }: {
    id: string;
    processor: string;
  }): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/track', {
      id: id,
      processor: processor,
    });
  };

  const ValidateArtifact = ({
    id,
    processor,
    force,
  }: {
    id: string;
    processor: string;
    force: boolean;
  }): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/validate', {
      id: id,
      processor: processor,
      force: force,
    });
  };

  const PreviewArtifact = (
    id: string,
    processor: string,
  ): Promise<AxiosResponse<Artifact>> => {
    return backpack.get<Artifact>(BACKPACK_ARTIFACTS + '/preview', {
      params: { id, processor },
    });
  };

  const GetPendingArtifacts = (): Promise<AxiosResponse<PendingArtifact[]>> => {
    return backpack.get<PendingArtifact[]>(BACKPACK_ARTIFACTS + '/pending');
  };

  const ApproveArtifact = ({
    id,
    processor,
  }: {
    id: string;
    processor: string;
  }): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/approve', {
      id: id,
      processor: processor,
    });
  };

  const RejectArtifact = ({
    id,
    processor,
  }: {
    id: string;
    processor: string;
  }): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/reject', {
      id: id,
      processor: processor,
    });
  };

  /* Add */
  const AddArtifact = (artifact: Artifact): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS, {
      id: artifact.id,
      processor: artifact.processor,
      filter: artifact.filter,
      config: artifact.config,
      versions: {},
      dependencies: {},
    });
  };
  const TrackAllArtifacts = (): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/track/all');
  };

  const ValidateAllArtifacts = (): Promise<AxiosResponse<void>> => {
    return backpack.post(BACKPACK_ARTIFACTS + '/validate/all');
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
    TriggerSync,
    PurgeQueue,
    AddProcessor,
    UpdateProcessor,
    DeleteProcessor,
    AddArtifact,
    GetArtifact,
    TrackAllArtifacts,
    TrackArtifact,
    PreviewArtifact,
    DeleteArtifact,
    GetAllProcessors,
    GetAllProcessorArtifacts,
    ValidateAllArtifacts,
    ValidateArtifact,
    GetPendingArtifacts,
    ApproveArtifact,
    RejectArtifact,
  };
};
