import Keycloak from 'keycloak-js';
import { APC_API } from './api/apc';

const keycloak = new Keycloak(APC_API + '/status/keycloak');

export default keycloak;
