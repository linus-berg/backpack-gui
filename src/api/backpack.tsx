import { useKeycloak } from '@react-keycloak-fork/web';
import axios from 'axios';
import React, { createContext, useContext, useEffect } from 'react';
import { Artifact } from 'types';
import type { AxiosInstance } from 'axios';
import { Spinner } from '@blueprintjs/core';
import { AuthInterceptor } from './AuthInterceptor';
import { Processor } from '../types/Processor';
import { QueueStatus } from '../types/QueueStatus';
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
  const { keycloak, initialized } = useKeycloak();

  useEffect(() => {
    interceptor.SetToken(keycloak?.token ?? '');
  }, [keycloak.token]);
  keycloak.onAuthRefreshSuccess = () => {
    interceptor.SetToken(keycloak?.token ?? '');
  };

  if (!initialized || !keycloak?.authenticated) {
    return <Spinner />;
  }

  return (
    <axios_ctx.Provider value={axios_instance}>
      {keycloak?.authenticated ? props.children : <Spinner />}
    </axios_ctx.Provider>
  );
};

export const useAxios = () => {
  return useContext(axios_ctx);
};

export const useBackpackApi = () => {
  const backpack = useAxios();
  /* Getters */
  const GetAllProcessors = () => {
    return backpack.get(BACKPACK_PROCESSOR + '/processors');
  };
  const GetQueueStatus = () => {
    return backpack.get<QueueStatus[]>('/status/queue');
  };

  const GetAllProcessorArtifacts = ({ queryKey }) => {
    return backpack.get(BACKPACK_ARTIFACTS + '/all', {
      params: { processor: queryKey[1], only_roots: queryKey[2] },
    });
  };

  const GetArtifact = ({ queryKey }) => {
    return backpack.get(BACKPACK_ARTIFACTS, {
      params: { processor: queryKey[1], id: queryKey[2] },
    });
  };

  const DeleteArtifact = ({ id, processor }) => {
    return backpack.delete(BACKPACK_ARTIFACTS, {
      data: {
        id: id,
        processor: processor,
      },
    });
  };

  const TrackArtifact = ({ id, processor }) => {
    return backpack.post(BACKPACK_ARTIFACTS + '/track', {
      id: id,
      processor: processor,
    });
  };

  const ValidateArtifact = ({ id, processor }) => {
    return backpack.post(BACKPACK_ARTIFACTS + '/validate', {
      id: id,
      processor: processor,
    });
  };

  /* Add */
  const AddArtifact = (artifact: Artifact) => {
    return backpack.post(BACKPACK_ARTIFACTS, {
      id: artifact.id,
      processor: artifact.processor,
      filter: artifact.filter,
      config: artifact.config,
      versions: {},
      dependencies: {},
    });
  };
  const TrackAllArtifacts = () => {
    return backpack.post(BACKPACK_ARTIFACTS + '/track/all');
  };

  const ValidateAllArtifacts = () => {
    return backpack.post(BACKPACK_ARTIFACTS + '/validate/all');
  };

  /* Add Processor */
  const AddProcessor = (processor_id: string) => {
    return backpack.post(BACKPACK_PROCESSOR, {
      processor_id: processor_id,
    });
  };

  const UpdateProcessor = (processor: Processor) => {
    return backpack.post(BACKPACK_PROCESSOR + '/update', {
      processor_id: processor.id,
      description: processor.description,
    });
  };

  return {
    GetQueueStatus,
    AddProcessor,
    UpdateProcessor,
    AddArtifact,
    GetArtifact,
    TrackAllArtifacts,
    TrackArtifact,
    DeleteArtifact,
    GetAllProcessors,
    GetAllProcessorArtifacts,
    ValidateAllArtifacts,
    ValidateArtifact,
  };
};
