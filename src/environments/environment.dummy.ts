import { commonEnv } from './environment.common';

const env = {
  production: false,
  dagw: true,
  useDummyData: true,
  useDevSign: false,
  useDynamicEndpoint: false,
  ssoUri: 'http://localhost:8025/api/',
  // gateway: 'http://localhost:4000/',
  gateway: 'http://localhost:3000/api/',
};

export const environment = { ...commonEnv, ...env };
