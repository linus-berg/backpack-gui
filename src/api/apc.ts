import axios from 'axios';
import { Artifact } from 'types';

const APC_API = ':8004/api';
//const APC_API = 'http://localhost:9000/api';
const APC_ARTIFACTS = APC_API + '/artifact';

/* Getters */
export const GetAllModules = () => {
  return axios.get(APC_ARTIFACTS + '/modules');
};

export const GetAllModuleArtifacts = ({ queryKey }) => {
  return axios.get(APC_ARTIFACTS, { params: { module: queryKey[1] } });
};

/* Delete */
const DeleteArtifactUrl = (artifact_id: number) =>
  `${APC_ARTIFACTS}/${artifact_id}`;
export const DeleteArtifact = (artifact_id: number) => {
  return axios.delete(DeleteArtifactUrl(artifact_id));
};

/* Add */
export const AddArtifact = (artifact: Artifact) => {
  return axios.post(APC_ARTIFACTS, {
    Name: artifact.name,
    Module: artifact.module,
    Filter: artifact.filter,
  });
};
export const TrackAllArtifacts = () => {
  return axios.post(APC_ARTIFACTS + '/track/all');
};

export const ValidateAllArtifacts = () => {
  return axios.post(APC_ARTIFACTS + '/validate/all');
};
