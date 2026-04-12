import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'workdashboard',
  brand: {
    displayName: '직장인 대시보드',
    primaryColor: '#1E40AF',
    icon: 'https://static.toss.im/appsintoss/27863/93a2ee7d-38fc-488f-a779-db973e151372.png',
  },
  web: {
    host: 'localhost',
    port: 5183,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
