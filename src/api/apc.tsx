import axios from 'axios';
import React, { createContext, useContext, useEffect } from 'react';
import { Artifact } from 'types';
import type { AxiosInstance } from 'axios';
import { AuthInterceptor } from './AuthInterceptor';
import { Processor } from '../types/Processor';
import User from '../types/User';

export const APC_HOST =
  window.location.protocol + '//' + window.location.hostname + ':8004';
export const APC_API = APC_HOST + '/api';
const APC_ARTIFACTS = '/artifact';

const APC_PROCESSOR = '/processor';

const axios_ctx = createContext<AxiosInstance>({} as AxiosInstance);

const axios_instance = axios.create({
  baseURL: APC_API,
});

const interceptor = new AuthInterceptor();
const interceptor_hdl = axios_instance.interceptors.request.use(
  interceptor.Intercept.bind(interceptor),
);

export const AxiosProvider = props => {
  return (
    <axios_ctx.Provider value={axios_instance}>
      {props.children}
    </axios_ctx.Provider>
  );
};

export const useAxios = () => {
  return useContext(axios_ctx);
};

export const useApcApi = () => {
  const APC = useAxios();
  const GetMe = async () => {
    const { data } = await APC.get<User>('/auth/me');
    return data;
  };

  /* Getters */
  const GetAllProcessors = () => {
    return APC.get(APC_PROCESSOR + '/processors');
  };

  const GetAllProcessorArtifacts = ({ queryKey }) => {
    return APC.get(APC_ARTIFACTS + '/all', {
      params: { processor: queryKey[1], only_roots: queryKey[2] },
    });
  };

  const GetArtifact = ({ queryKey }) => {
    return APC.get(APC_ARTIFACTS, {
      params: { processor: queryKey[1], id: queryKey[2] },
    });
  };

  const DeleteArtifact = ({ id, processor }) => {
    return APC.delete(APC_ARTIFACTS, {
      data: {
        id: id,
        processor: processor,
      },
    });
  };

  const TrackArtifact = ({ id, processor }) => {
    return APC.post(APC_ARTIFACTS + '/track', {
      id: id,
      processor: processor,
    });
  };

  const ValidateArtifact = ({ id, processor }) => {
    return APC.post(APC_ARTIFACTS + '/validate', {
      id: id,
      processor: processor,
    });
  };

  /* Add */
  const AddArtifact = (artifact: Artifact) => {
    return APC.post(APC_ARTIFACTS, {
      id: artifact.id,
      processor: artifact.processor,
      filter: artifact.filter,
      config: artifact.config,
      versions: {},
      dependencies: {},
    });
  };
  const TrackAllArtifacts = () => {
    return APC.post(APC_ARTIFACTS + '/track/all');
  };

  const ValidateAllArtifacts = () => {
    return APC.post(APC_ARTIFACTS + '/validate/all');
  };

  /* Add Processor */
  const AddProcessor = (processor_id: string) => {
    return APC.post(APC_PROCESSOR, {
      processor_id: processor_id,
    });
  };

  const UpdateProcessor = (processor: Processor) => {
    return APC.post(APC_PROCESSOR + '/update', {
      processor_id: processor.id,
      description: processor.description,
    });
  };

  return {
    GetMe,
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
