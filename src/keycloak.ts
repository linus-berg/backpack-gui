import Keycloak from 'keycloak-js';
import { BACKPACK_API } from 'api/backpack';

const keycloak = new Keycloak(BACKPACK_API + '/status/keycloak');

export default keycloak;
