import { commonEnv } from './environment.common';

const env = {
  production: false,
  dagw: false,
  useDummyData: false,
  useDevSign: true,
  useDynamicEndpoint: false,
  ssoUri: 'http://localhost:8025/api/',
  gateway: '/api/',
};

export const environment = { ...commonEnv, ...env };
