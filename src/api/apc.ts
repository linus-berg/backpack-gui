import { useKeycloak } from '@react-keycloak-fork/web';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { Artifact } from 'types';
import type { AxiosInstance } from 'axios';
const APC_API =
  window.location.protocol + '//' + window.location.hostname + ':8004/api';
const APC_ARTIFACTS = '/artifact';
const APC_PROCESSOR = '/processor';
/* Delete */
const DeleteArtifactUrl = (id: string, processor: string) =>
  `${APC_ARTIFACTS}/${processor}/${id}`;

export const useApcApi = () => {
  const { keycloak, initialized } = useKeycloak();
  const token = keycloak?.token ?? '';
  const CreateInstance = () => {
    return axios.create({
      baseURL: APC_API,
      headers: {
        Authorization: initialized ? `Bearer ${token}` : undefined,
      },
    });
  };
  const APC = useRef<AxiosInstance>(CreateInstance());

  useEffect(() => {
    APC.current = CreateInstance();
  }, [initialized, token]);

  /* Getters */
  const GetAllProcessors = () => {
    return APC.current.get(APC_PROCESSOR + '/processors');
  };

  const GetAllProcessorArtifacts = ({ queryKey }) => {
    return APC.current.get(APC_ARTIFACTS, {
      params: { processor: queryKey[1], only_roots: false },
    });
  };

  const DeleteArtifact = ({ id, processor }) => {
    return APC.current.delete(DeleteArtifactUrl(id, processor));
  };

  /* Add */
  const AddArtifact = (artifact: Artifact) => {
    return APC.current.post(APC_ARTIFACTS, {
      Id: artifact.name,
      Processor: artifact.processor,
      Filter: artifact.filter,
    });
  };
  const TrackAllArtifacts = () => {
    return APC.current.post(APC_ARTIFACTS + '/track/all');
  };

  const ValidateAllArtifacts = () => {
    return APC.current.post(APC_ARTIFACTS + '/validate/all');
  };

  /* Add Processor */
  const AddProcessor = (processor_id: string) => {
    return APC.current.post(APC_PROCESSOR, {
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
