import axios from 'axios';
import { Artifact } from 'types';

const APC_API =
  window.location.protocol + '//' + window.location.hostname + ':8004/api';
//const APC_API = 'http://localhost:9000/api';
const APC_ARTIFACTS = APC_API + '/artifact';

/* Getters */
export const GetAllProcessors = () => {
  return axios.get(APC_ARTIFACTS + '/processors');
};

export const GetAllProcessorArtifacts = ({ queryKey }) => {
  return axios.get(APC_ARTIFACTS, {
    params: { processor: queryKey[1], only_roots: false },
  });
};

/* Delete */
const DeleteArtifactUrl = (id: string, processor: string) =>
  `${APC_ARTIFACTS}/${processor}/${id}`;

export const DeleteArtifact = ({ id, processor }) => {
  return axios.delete(DeleteArtifactUrl(id, processor));
};

/* Add */
export const AddArtifact = (artifact: Artifact) => {
  return axios.post(APC_ARTIFACTS, {
    Id: artifact.name,
    Processor: artifact.module,
    Filter: artifact.filter,
  });
};
export const TrackAllArtifacts = () => {
  return axios.post(APC_ARTIFACTS + '/track/all');
};

export const ValidateAllArtifacts = () => {
  return axios.post(APC_ARTIFACTS + '/validate/all');
};
