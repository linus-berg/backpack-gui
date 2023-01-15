import { useKeycloak } from '@react-keycloak-fork/web';
import axios from 'axios';
import React, { createContext, useContext, useEffect } from 'react';
import { Artifact } from 'types';
import type { AxiosInstance } from 'axios';
import { Spinner } from '@blueprintjs/core';
import { AuthInterceptor } from './AuthInterceptor';
const APC_API =
  window.location.protocol + '//' + window.location.hostname + ':8004/api';
const APC_ARTIFACTS = '/artifact';
const APC_PROCESSOR = '/processor';
/* Delete */
const DeleteArtifactUrl = (id: string, processor: string) =>
  `${APC_ARTIFACTS}/${processor}/${id}`;

const ax_ctx = createContext<AxiosInstance>({} as AxiosInstance);

const ax_in = axios.create({
  baseURL: APC_API,
});

const interceptor = new AuthInterceptor();
const interceptor_hdl = ax_in.interceptors.request.use(
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
    <ax_ctx.Provider value={ax_in}>
      {keycloak?.authenticated ? props.children : <Spinner />}
    </ax_ctx.Provider>
  );
};

export const useAxios = () => {
  return useContext(ax_ctx);
};

export const useApcApi = () => {
  const APC = useAxios();
  /* Getters */
  const GetAllProcessors = () => {
    return APC.get(APC_PROCESSOR + '/processors');
  };

  const GetAllProcessorArtifacts = ({ queryKey }) => {
    return APC.get(APC_ARTIFACTS, {
      params: { processor: queryKey[1], only_roots: false },
    });
  };

  const DeleteArtifact = ({ id, processor }) => {
    return APC.delete(DeleteArtifactUrl(id, processor));
  };

  /* Add */
  const AddArtifact = (artifact: Artifact) => {
    return APC.post(APC_ARTIFACTS, {
      Id: artifact.name,
      Processor: artifact.processor,
      Filter: artifact.filter,
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
      ProcessorId: processor_id,
    });
  };
  return {
    AddProcessor,
    AddArtifact,
    TrackAllArtifacts,
    DeleteArtifact,
    GetAllProcessors,
    GetAllProcessorArtifacts,
    ValidateAllArtifacts,
  };
};
