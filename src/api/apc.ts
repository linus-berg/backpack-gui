import axios from 'axios';
const APC_API = 'http://localhost:4001/api';
const APC_ARTIFACTS = APC_API + '/artifact';

export const GetAllModules = () => {
  return axios.get(APC_ARTIFACTS + '/modules');
}

export const GetAllModuleArtifacts = ({ queryKey }) => {
  return axios.get(APC_ARTIFACTS, { params: { module: queryKey[1] } });
};

export const AddArtifact = (artifact) => {
  return axios.post(APC_ARTIFACTS, {
    Name: artifact.name,
    Module: artifact.module,
  });
};
