import Keycloak from 'keycloak-js';

// Single shared instance — Keycloak's own docs warn against creating more than one
// per page, since each instance runs its own silent-refresh iframe.
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'agilify',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'agilify-app',
});

export default keycloak;
