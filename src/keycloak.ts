import Keycloak from 'keycloak-js';

const keycloak = Keycloak({
  url: 'http://localhost:8090',
  realm: 'master',
  clientId: 'apc',
});

export default keycloak;
