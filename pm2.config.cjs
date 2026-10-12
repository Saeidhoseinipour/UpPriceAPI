module.exports = {
  apps: [
    {
      name: 'upprice-api-24h',
      script: 'server.ts',
      interpreter: 'tsx',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        HOST: '0.0.0.0',
      },
    },
  ],
};
